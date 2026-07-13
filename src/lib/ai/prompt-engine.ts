import { CreativeIntent, EnhancedPrompt, ResponseFormat, AssetType } from "../types";

const INTENT_KEYWORDS: Record<CreativeIntent, string[]> = {
  "image-generation": ["create", "generate", "make", "design", "draw", "illustrate", "picture", "image", "photo"],
  "video-concept": ["video", "animation", "motion", "animate", "cinematic", "film", "clip", "timelapse"],
  "poster-design": ["poster", "banner", "flyer", "billboard", "signage", "print", "brochure"],
  "story-narrative": ["story", "book", "chapter", "narrative", "tale", "fable", "fairytale", "storyboard"],
  "vision-board": ["vision board", "mood board", "inspiration board", "goal board", "dream board"],
  "mood-board": ["mood", "aesthetic", "vibe", "atmosphere", "feeling", "tone"],
  "brand-artwork": ["brand", "logo", "identity", "branding", "brand colors", "brand guidelines"],
  "emotional-landscape": ["emotion", "feeling", "mood", "emotional", "inner", "psychological", "mental state"],
  "dream-visualization": ["dream", "fantasy", "surreal", "otherworldly", "ethereal", "imagine"],
  "quote-poster": ["quote", "typography", "text art", "word art", "motivational", "inspirational quote"],
  "photo-transform": ["transform", "reimagine", "restyle", "convert", "turn into", "remake", "recreate", "style transfer"],
  "product-ad": ["product", "advertisement", "ad ", "marketing", "promotional", "commercial", "instagram ad"],
  "campaign-design": ["campaign", "social media", "marketing campaign", "seasonal", "launch"],
  "general-creative": [],
};

const STYLE_MODIFIERS: Record<string, string[]> = {
  luxury: ["premium", "elegant", "sophisticated", "opulent", "refined", "high-end", "luxury", "bespoke"],
  minimal: ["clean", "minimal", "simple", "modern", "sleek", "minimalist", "scandinavian"],
  bold: ["bold", "vibrant", "dramatic", "striking", "powerful", "intense", "high-contrast"],
  soft: ["soft", "gentle", "pastel", "muted", "subtle", "delicate", "airy"],
  dark: ["dark", "moody", "noir", "shadowy", "cinematic", "dramatic", "gothic"],
  vintage: ["vintage", "retro", "nostalgic", "classic", "aged", "sepia", "old-fashioned"],
  futuristic: ["futuristic", "cyberpunk", "sci-fi", "neon", "tech", "digital", "synthwave"],
  organic: ["organic", "natural", "earthy", "botanical", "floral", "nature", "green"],
  cinematic: ["cinematic", "film", "movie", "dramatic lighting", "film grain", "anamorphic"],
  artistic: ["artistic", "painterly", "impressionist", "abstract", "expressionist", "gallery"],
};

const ASPECT_RATIOS: Record<string, string> = {
  instagram: "1:1",
  "instagram story": "9:16",
  "instagram reel": "9:16",
  poster: "2:3",
  banner: "16:9",
  facebook: "1200x630",
  linkedin: "1200x627",
  twitter: "16:9",
  wallpaper: "16:9",
  square: "1:1",
  portrait: "3:4",
  landscape: "4:3",
  widescreen: "16:9",
  cinematic: "21:9",
};

function detectIntent(text: string): CreativeIntent {
  const lower = text.toLowerCase();
  let bestIntent: CreativeIntent = "general-creative";
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [CreativeIntent, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

function detectStyle(text: string): string {
  const lower = text.toLowerCase();
  for (const [style, keywords] of Object.entries(STYLE_MODIFIERS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return style;
    }
  }
  return "modern";
}

function detectAspectRatio(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, ratio] of Object.entries(ASPECT_RATIOS)) {
    if (lower.includes(key)) return ratio;
  }
  if (lower.includes("story") || lower.includes("reel") || lower.includes("vertical")) return "9:16";
  if (lower.includes("wide") || lower.includes("panorama")) return "21:9";
  return "1:1";
}

function detectAssetType(intent: CreativeIntent, text: string): AssetType {
  const lower = text.toLowerCase();
  if (intent === "video-concept" || lower.includes("video") || lower.includes("animation")) return "video";
  if (intent === "poster-design" || intent === "campaign-design" || lower.includes("poster")) return "poster";
  if (intent === "story-narrative" || lower.includes("story") || lower.includes("book")) return "storyboard";
  if (intent === "vision-board" || intent === "mood-board" || lower.includes("board")) return "moodboard";
  return "image";
}

function detectAssetCount(text: string): number {
  const lower = text.toLowerCase();
  const numberWords: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 6, six: 6, few: 3, several: 4, couple: 2, pair: 2,
  };
  for (const [word, num] of Object.entries(numberWords)) {
    if (lower.includes(word)) return num;
  }
  const numMatch = lower.match(/(\d+)\s*(images?|variations?|versions?|options?|assets?|poster|banner)/);
  if (numMatch) return Math.min(parseInt(numMatch[1], 10), 8);
  if (lower.includes("board") || lower.includes("collage")) return 6;
  if (lower.includes("variation")) return 3;
  return 3;
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(["a", "an", "the", "is", "it", "of", "for", "and", "or", "in", "on", "at", "to", "with", "my", "i", "me", "we", "our", "this", "that", "create", "make", "generate", "design", "show", "give"]);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 12);
}

export function enhancePrompt(original: string, hasReferenceImage: boolean): EnhancedPrompt {
  const intent = detectIntent(original);
  const style = detectStyle(original);
  const aspectRatio = detectAspectRatio(original);
  const assetType = detectAssetType(intent, original);
  const assetCount = detectAssetCount(original);
  const keywords = extractKeywords(original);

  const styleDescription = STYLE_MODIFIERS[style]?.join(", ") || "modern, clean";

  let enhanced = original;

  const enhancers: string[] = [];

  if (style !== "modern") {
    enhancers.push(`${style} aesthetic`);
  }

  enhancers.push("professional quality");

  if (assetType === "image" || assetType === "poster") {
    enhancers.push("detailed composition", "careful color grading");
  }

  if (assetType === "video" || assetType === "storyboard") {
    enhancers.push("dynamic composition", "visual storytelling");
  }

  if (intent === "product-ad" || intent === "campaign-design") {
    enhancers.push("social media optimized", "eye-catching visual hierarchy", "brand-appropriate");
  }

  if (hasReferenceImage) {
    enhancers.push("matching reference style and composition");
  }

  if (enhancers.length > 0) {
    enhanced = `${original.trim()}. Style: ${styleDescription}. Quality: ${enhancers.join(", ")}.`;
  }

  const format: ResponseFormat = {
    assetType,
    count: assetCount,
    aspectRatio,
    style,
  };

  return {
    original,
    enhanced,
    intent,
    format,
    keywords,
    hasReferenceImage,
  };
}

export function detectWorkspace(text: string): "personal" | "business" {
  const lower = text.toLowerCase();
  const businessKeywords = ["brand", "campaign", "marketing", "business", "company", "product", "ad ", "advert", "promotion", "social media", "instagram", "facebook", "linkedin", "commercial", "retail", "store", "shop"];
  return businessKeywords.some((kw) => lower.includes(kw)) ? "business" : "personal";
}

export function getMockResponseForIntent(enhanced: EnhancedPrompt): string {
  const responses: Partial<Record<CreativeIntent, string[]>> = {
    "image-generation": [
      `I've generated ${enhanced.format.count} stunning images with a ${enhanced.format.style} aesthetic. Each piece features careful composition, professional lighting, and deliberate color choices that bring your vision to life.`,
      `Here are ${enhanced.format.count} creative interpretations. I focused on ${enhanced.format.style} styling with attention to detail, depth, and visual impact. Each variant explores a different creative angle.`,
    ],
    "poster-design": [
      `I've designed ${enhanced.format.count} poster concepts. Each uses strong visual hierarchy, ${enhanced.format.style} typography, and compositions optimized for the ${enhanced.format.aspectRatio} format. The layouts balance readability with artistic impact.`,
    ],
    "product-ad": [
      `Here are ${enhanced.format.count} premium product advertisement concepts. I've applied ${enhanced.format.style} aesthetics with cinematic lighting, premium composition, and social media-optimized framing. Each version targets a slightly different audience appeal.`,
    ],
    "campaign-design": [
      `I've created ${enhanced.format.count} campaign visuals with a cohesive ${enhanced.format.style} direction. Each piece is designed to work across platforms while maintaining visual impact. The color palette and composition create a unified campaign identity.`,
    ],
    "photo-transform": [
      `I've transformed your reference into ${enhanced.format.count} new interpretations. Each applies a ${enhanced.format.style} artistic style while preserving the original composition's essence. The results blend familiar structure with fresh creative energy.`,
    ],
    "story-narrative": [
      `I've illustrated ${enhanced.format.count} scenes from your story. Each panel captures a key moment with ${enhanced.format.style} visual storytelling, vibrant colors, and engaging compositions that bring the narrative to life.`,
    ],
    "vision-board": [
      `Here's your vision board with ${enhanced.format.count} focus areas. Each tile represents a key aspiration with its own ${enhanced.format.style} color story and mood. The board creates a cohesive visual representation of your goals.`,
    ],
    "dream-visualization": [
      `I've visualized your dream as ${enhanced.format.count} ethereal scenes. The dreamlike quality uses ${enhanced.format.style} elements — soft edges, impossible geometry, and a palette that shifts between reality and fantasy.`,
    ],
    "emotional-landscape": [
      `I've created ${enhanced.format.count} abstract representations of your emotional landscape. Using ${enhanced.format.style} color theory and compositional flow, each piece captures a different facet of inner experience.`,
    ],
    "quote-poster": [
      `Here are ${enhanced.format.count} quote poster designs. Each features ${enhanced.format.style} typography with carefully balanced layouts that make the words visually striking while maintaining readability and emotional impact.`,
    ],
    "brand-artwork": [
      `I've created ${enhanced.format.count} brand-aligned artworks. Each piece incorporates your ${enhanced.format.style} aesthetic while maintaining brand consistency. The designs balance creative expression with strategic brand communication.`,
    ],
    "general-creative": [
      `I've brought your concept to life with ${enhanced.format.count} creative outputs. Each explores a different angle of your vision with ${enhanced.format.style} aesthetics and professional-grade composition.`,
      `Here are ${enhanced.format.count} interpretations of your creative brief. I applied ${enhanced.format.style} styling with attention to composition, color harmony, and visual storytelling to create compelling results.`,
    ],
  };

  const pool = responses[enhanced.intent] || responses["general-creative"] || [];
  return pool[Math.floor(Math.random() * pool.length)] || pool[0] || "Here's what I created for you.";
}
