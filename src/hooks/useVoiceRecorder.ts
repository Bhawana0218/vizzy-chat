"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  waveform: number[];
  error: string | null;
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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      chunksRef.current = [];
      pausedDurationRef.current = 0;

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
      setState((prev) => ({ ...prev, isRecording: true, isPaused: false, duration: 0, waveform: [], error: null }));
    } catch (err) {
      const message = err instanceof DOMException && err.name === "NotAllowedError"
        ? "Microphone access denied. Please allow microphone permissions."
        : "Could not start recording. Please check your microphone.";
      setState((prev) => ({ ...prev, error: message }));
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
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
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    chunksRef.current = [];
    doCleanup(timerRef, animFrameRef, streamRef, analyserRef, mediaRecorderRef);
    setState((prev) => ({ ...prev, isRecording: false, isPaused: false, duration: 0, waveform: [], error: null }));
  }, []);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
      pausedDurationRef.current += Date.now() - (startTimeRef.current + pausedDurationRef.current);
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      startTimeRef.current = Date.now() - pausedDurationRef.current;
      collectRef.current();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, []);

  return { ...state, startRecording, stopRecording, cancelRecording, pauseRecording, resumeRecording };
}
