import { GenerateImageParams, AIImageResult } from "./types";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

const VARIATION_STYLES = [
  {
    name: "Minimal Modern",
    suffix: "minimal modern aesthetic, clean layout, soft muted colors, negative space, contemporary design, elegant simplicity",
    gradient: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 50%, #d6d3d1 100%)",
  },
  {
    name: "Cinematic Dramatic",
    suffix: "cinematic dramatic aesthetic, high contrast lighting, bold composition, film grain, rich shadows, intense atmosphere",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)",
  },
  {
    name: "Luxury Premium",
    suffix: "luxury premium aesthetic, rich warm colors, editorial style, gold accents, sophisticated typography, high-end commercial photography",
    gradient: "linear-gradient(135deg, #78350f 0%, #a16207 50%, #451a03 100%)",
  },
  {
    name: "Vibrant Bold",
    suffix: "vibrant bold aesthetic, saturated colors, dynamic composition, energetic visual impact, striking color palette",
    gradient: "linear-gradient(135deg, #dc2626 0%, #7c3aed 50%, #0ea5e9 100%)",
  },
  {
    name: "Ethereal Dreamy",
    suffix: "ethereal dreamy aesthetic, soft pastel tones, gaussian blur, light leaks, whimsical atmosphere, dreamy quality",
    gradient: "linear-gradient(135deg, #c084fc 0%, #f9a8d4 50%, #93c5fd 100%)",
  },
  {
    name: "Dark Noir",
    suffix: "dark noir aesthetic, deep shadows, moody atmosphere, desaturated tones, mysterious ambiance, dramatic lighting",
    gradient: "linear-gradient(135deg, #0c0a09 0%, #292524 50%, #1c1917 100%)",
  },
];

function widthHeightToLabel(width: number, height: number): string {
  if (width === height) return "square 1:1";
  const ratio = width / height;
  if (Math.abs(ratio - 16 / 9) < 0.1) return "widescreen 16:9";
  if (Math.abs(ratio - 9 / 16) < 0.1) return "portrait 9:16";
  if (Math.abs(ratio - 4 / 3) < 0.1) return "landscape 4:3";
  if (Math.abs(ratio - 3 / 4) < 0.1) return "portrait 3:4";
  return `${width}x${height}`;
}

function buildEnhancedPrompt(basePrompt: string, styleSuffix: string, width: number, height: number): string {
  const parts: string[] = [basePrompt];
  parts.push(styleSuffix);
  parts.push(`Aspect ratio: ${widthHeightToLabel(width, height)}`);
  parts.push("highly detailed, professional quality, sharp focus, 8k resolution");
  return parts.join(". ");
}

export function generatePollinationsUrl(params: GenerateImageParams): AIImageResult[] {
  const count = params.n || 1;
  const results: AIImageResult[] = [];

  for (let i = 0; i < count; i++) {
    const variation = VARIATION_STYLES[i % VARIATION_STYLES.length];
    const prompt = params.style
      ? `${buildEnhancedPrompt(params.prompt, `${variation.suffix}, ${params.style}`, params.width, params.height)}`
      : buildEnhancedPrompt(params.prompt, variation.suffix, params.width, params.height);

    const encoded = encodeURIComponent(prompt);
    const seed = params.seed !== undefined ? params.seed + i * 137 : Math.floor(Math.random() * 999999);

    const queryParts = [
      `width=${params.width}`,
      `height=${params.height}`,
      `seed=${seed}`,
      `nologo=true`,
    ];

    const url = `${POLLINATIONS_BASE}/${encoded}?${queryParts.join("&")}`;

    results.push({
      url,
      revisedPrompt: prompt,
      seed,
      metadata: {
        provider: "pollinations",
        model: "pollinations-flux",
        variationName: variation.name,
        style: params.style || variation.name,
        aspectRatio: widthHeightToLabel(params.width, params.height),
        gradient: variation.gradient,
      },
    });
  }

  return results;
}

export { VARIATION_STYLES };
