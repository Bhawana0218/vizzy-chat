"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  waveform: number[];
  error: string | null;
  transcript: string;
  isTranscribing: boolean;
}

export interface VoiceRecordingActions {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
}

function doCleanup(
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  animFrameRef: React.MutableRefObject<number | null>,
  streamRef: React.MutableRefObject<MediaStream | null>,
  analyserRef: React.MutableRefObject<AnalyserNode | null>,
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
) {
  if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
  if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  analyserRef.current = null;
  mediaRecorderRef.current = null;
}

export function useVoiceRecorder(): VoiceRecordingState & VoiceRecordingActions {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    waveform: [],
    error: null,
    transcript: "",
    isTranscribing: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const collectRef = useRef<() => void>(() => {});
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    collectRef.current = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const bars = 24;
      const step = Math.floor(dataArray.length / bars);
      const normalized = Array.from({ length: bars }, (_, i) => (dataArray[i * step] || 0) / 255);
      setState((prev) => ({ ...prev, waveform: normalized }));
      animFrameRef.current = requestAnimationFrame(() => collectRef.current());
    };
  }, []);

  const startTranscription = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      transcriptRef.current = finalTranscript || interimTranscript;
      setState((prev) => ({ ...prev, transcript: transcriptRef.current }));
    };

    recognition.onerror = () => {
      // Silently ignore - transcription is best-effort
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      // Already started or not supported
    }
  }, []);

  const stopTranscription = useCallback((): string => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try { recognition.stop(); } catch { /* ok */ }
      recognitionRef.current = null;
    }
    return transcriptRef.current;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      chunksRef.current = [];
      pausedDurationRef.current = 0;
      transcriptRef.current = "";

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm",
      });
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;
        setState((prev) => ({ ...prev, duration: elapsed }));
      }, 100);

      collectRef.current();
      setState((prev) => ({ ...prev, isRecording: true, isPaused: false, duration: 0, waveform: [], error: null, transcript: "", isTranscribing: false }));

      // Start speech-to-text
      startTranscription();
      setState((prev) => ({ ...prev, isTranscribing: true }));
    } catch (err) {
      const message = err instanceof DOMException && err.name === "NotAllowedError"
        ? "Microphone access denied. Please allow microphone permissions."
        : "Could not start recording. Please check your microphone.";
      setState((prev) => ({ ...prev, error: message }));
    }
  }, [startTranscription]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    // Stop transcription first
    const finalTranscript = stopTranscription();
    setState((prev) => ({ ...prev, isTranscribing: false, transcript: finalTranscript }));

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") { resolve(null); return; }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        doCleanup(timerRef, animFrameRef, streamRef, analyserRef, mediaRecorderRef);
        resolve(blob);
      };
      recorder.stop();
    });
  }, [stopTranscription]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    chunksRef.current = [];
    stopTranscription();
    doCleanup(timerRef, animFrameRef, streamRef, analyserRef, mediaRecorderRef);
    setState((prev) => ({ ...prev, isRecording: false, isPaused: false, duration: 0, waveform: [], error: null, transcript: "", isTranscribing: false }));
  }, [stopTranscription]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
      pausedDurationRef.current += Date.now() - (startTimeRef.current + pausedDurationRef.current);
      // Pause transcription
      const recognition = recognitionRef.current;
      if (recognition) {
        try { recognition.abort(); } catch { /* ok */ }
        recognitionRef.current = null;
      }
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      startTimeRef.current = Date.now() - pausedDurationRef.current;
      collectRef.current();
      // Resume transcription
      startTranscription();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [startTranscription]);

  return { ...state, startRecording, stopRecording, cancelRecording, pauseRecording, resumeRecording };
}

// Type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
