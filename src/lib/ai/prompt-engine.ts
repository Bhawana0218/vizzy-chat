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

const COMPOSITION_STYLES = [
  "rule of thirds composition",
  "centered symmetrical composition",
  "diagonal dynamic composition",
  "golden ratio spiral composition",
  "leading lines guiding the eye",
  "framing within framing",
  "negative space emphasis",
  "asymmetric balanced composition",
];

const LIGHTING_SETUPS = [
  "golden hour warm directional lighting",
  "dramatic Rembrandt chiaroscuro lighting",
  "soft diffused overcast ambient light",
  "high-key bright even studio lighting",
  "low-key moody dramatic rim lighting",
  "backlit silhouette with lens flare",
  "neon-lit cyberpunk atmospheric glow",
  "natural window light with soft shadows",
  "volumetric god rays cutting through haze",
  "studio three-point lighting setup",
];

const CAMERA_SETTINGS = [
  "shot on 85mm f/1.4 shallow depth of field",
  "wide angle 24mm f/2.8 deep focus",
  "macro 100mm f/2.8 extreme close-up detail",
  "telephoto 200mm f/2 compressed perspective",
  "tilt-shift miniature effect selective focus",
  "fisheye ultra-wide dramatic distortion",
  "medium format 50mm f/3.5 natural perspective",
  "anamorphic 40mm f/2 cinematic bokeh",
];

const COLOR_GRADINGS = [
  "warm teal and orange color grading",
  "cool desaturated muted earth tones",
  "high saturation vivid pop art palette",
  "monochromatic with single accent color",
  "vintage faded film color treatment",
  "complementary color harmony scheme",
  "split-toned shadows and highlights",
  "cross-processed experimental color shift",
  "analog film emulation with grain texture",
  "pastel dreamy soft gradient palette",
];

const ART_DIRECTIONS = [
  "editorial magazine quality art direction",
  "cinematic widescreen film still aesthetic",
  "gallery-worthy fine art photography style",
  "commercial product photography standard",
  "street photography candid documentary feel",
  "fashion editorial high-concept styling",
  "architectural visualization precision",
  "digital matte painting concept art quality",
  "anime-influenced cel-shaded illustration",
  "watercolor organic textured hand-painted feel",
];

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

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function buildEnhancedPrompt(original: string, style: string, assetType: AssetType, intent: CreativeIntent, keywords: string[]): string {
  const seed = original.toLowerCase().replace(/[^\w]/g, "");
  const rand = seededRandom(seed);

  const composition = pick(COMPOSITION_STYLES, rand);
  const lighting = pick(LIGHTING_SETUPS, rand);
  const camera = pick(CAMERA_SETTINGS, rand);
  const color = pick(COLOR_GRADINGS, rand);
  const artDir = pick(ART_DIRECTIONS, rand);

  const styleDesc = (STYLE_MODIFIERS[style] || ["modern", "clean"]).join(", ");

  const qualityTier = ["product-ad", "campaign-design", "brand-artwork"].includes(intent)
    ? "ultra-premium commercial grade"
    : ["photo-transform", "artistic"].includes(style)
      ? "gallery-quality fine art"
      : "professional production quality";

  const intentSpecific = getIntentEnhancement(intent);

  const parts = [
    original.trim(),
    `${styleDesc} aesthetic`,
    composition,
    lighting,
    camera,
    color,
    artDir,
    qualityTier,
    intentSpecific,
    "8K ultra high resolution",
    "masterful execution",
  ];

  return parts.filter(Boolean).join(". ");
}

function getIntentEnhancement(intent: CreativeIntent): string {
  switch (intent) {
    case "product-ad":
      return "product hero shot with aspirational lifestyle context, clean negative space for text overlay, premium brand positioning";
    case "campaign-design":
      return "social media optimized, bold visual hierarchy, platform-native formatting, scroll-stopping impact";
    case "poster-design":
      return "strong typographic space, print-ready quality, poster layout optimized, bold headline area";
    case "brand-artwork":
      return "brand identity system, consistent visual language, trademark quality, recognition optimized";
    case "photo-transform":
      return "artistic style transfer, preserving core composition, transforming aesthetic direction, creative reinterpretation";
    case "dream-visualization":
      return "surreal impossible geometry, dream logic physics, ethereal atmosphere, otherworldly beauty";
    case "emotional-landscape":
      return "abstract emotional resonance, color psychology applied, atmospheric depth, introspective mood";
    case "quote-poster":
      return "elegant typography-focused, readable text space, inspirational layout, print poster quality";
    case "story-narrative":
      return "sequential narrative panel, visual storytelling beat, character-driven moment, cinematic framing";
    case "vision-board":
      return "collage grid layout, aspirational imagery, cohesive collection, inspirational curation";
    default:
      return "visually compelling, creative excellence";
  }
}

export function enhancePrompt(original: string, hasReferenceImage: boolean): EnhancedPrompt {
  const intent = detectIntent(original);
  const style = detectStyle(original);
  const aspectRatio = detectAspectRatio(original);
  const assetType = detectAssetType(intent, original);
  const assetCount = detectAssetCount(original);
  const keywords = extractKeywords(original);

  const enhanced = buildEnhancedPrompt(original, style, assetType, intent, keywords);

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
      `I've generated ${enhanced.format.count} stunning images with a ${enhanced.format.style} aesthetic. Each piece features cinematic lighting, deliberate color grading, and professional art direction that brings your vision to life.`,
      `Here are ${enhanced.format.count} creative interpretations. I applied ${enhanced.format.style} styling with careful composition, premium lighting, and a distinctive color palette. Each variant explores a different creative angle.`,
    ],
    "poster-design": [
      `I've designed ${enhanced.format.count} poster concepts with strong visual hierarchy and ${enhanced.format.style} typography. Each layout is optimized for the ${enhanced.format.aspectRatio} format, balancing readability with artistic impact and print-quality production.`,
    ],
    "product-ad": [
      `Here are ${enhanced.format.count} premium product advertisement concepts with ${enhanced.format.style} aesthetics. Each features cinematic lighting, aspirational composition, and social media-optimized framing targeting different audience appeals.`,
    ],
    "campaign-design": [
      `I've created ${enhanced.format.count} campaign visuals with a cohesive ${enhanced.format.style} direction. Each piece is designed to work across platforms while maintaining visual impact with strong brand positioning and scroll-stopping composition.`,
    ],
    "photo-transform": [
      `I've transformed your reference into ${enhanced.format.count} new interpretations. Each applies a ${enhanced.format.style} artistic style while preserving the original composition's essence. The results blend familiar structure with a completely refreshed creative direction.`,
    ],
    "story-narrative": [
      `I've illustrated ${enhanced.format.count} key narrative moments. Each panel captures a story beat with ${enhanced.format.style} visual storytelling, cinematic framing, and emotionally engaging compositions that bring the narrative to life.`,
    ],
    "vision-board": [
      `Here's your vision board with ${enhanced.format.count} curated focus areas. Each tile represents a key aspiration with its own ${enhanced.format.style} color story and mood. The board creates a cohesive, aspirational visual representation of your goals.`,
    ],
    "dream-visualization": [
      `I've visualized your dream as ${enhanced.format.count} ethereal scenes. The dreamlike quality uses ${enhanced.format.style} elements — soft edges, impossible geometry, and a palette that shifts between reality and fantasy.`,
    ],
    "emotional-landscape": [
      `I've created ${enhanced.format.count} abstract representations of your emotional landscape. Using ${enhanced.format.style} color psychology and compositional flow, each piece captures a different facet of inner experience.`,
    ],
    "quote-poster": [
      `Here are ${enhanced.format.count} quote poster designs. Each features ${enhanced.format.style} typography with carefully balanced layouts that make the words visually striking while maintaining readability and emotional impact.`,
    ],
    "brand-artwork": [
      `I've created ${enhanced.format.count} brand-aligned artworks. Each incorporates your ${enhanced.format.style} aesthetic while maintaining brand consistency. The designs balance creative expression with strategic brand communication.`,
    ],
    "general-creative": [
      `I've brought your concept to life with ${enhanced.format.count} creative outputs. Each explores a different angle with ${enhanced.format.style} aesthetics, cinematic lighting, and professional-grade art direction.`,
      `Here are ${enhanced.format.count} interpretations of your creative brief. I applied ${enhanced.format.style} styling with attention to composition, color harmony, and visual storytelling to create compelling, production-ready results.`,
    ],
  };

  const pool = responses[enhanced.intent] || responses["general-creative"] || [];
  return pool[Math.floor(Math.random() * pool.length)] || pool[0] || "Here's what I created for you.";
}
