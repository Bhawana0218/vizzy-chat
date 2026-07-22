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
  const keywords = enhanced.keywords.slice(0, 3).join(", ") || "your concept";
  const responses: Partial<Record<CreativeIntent, string[]>> = {
    "image-generation": [
      `I explored ${keywords} through three distinct visual directions. Each features cinematic lighting, deliberate color grading, and professional art direction \u2014 ranging from bold and dramatic to soft and refined.`,
      `Here are my interpretations of ${keywords}. I paired ${enhanced.format.style} aesthetics with careful composition and premium lighting. Each variant takes a different creative angle while staying cohesive.`,
      `For ${keywords}, I crafted three unique compositions with ${enhanced.format.style} styling. Notice how each one plays with light, depth, and color to create a different emotional response.`,
    ],
    "poster-design": [
      `I designed ${enhanced.format.count} poster concepts for ${keywords}. Strong visual hierarchy meets ${enhanced.format.style} typography, optimized for the ${enhanced.format.aspectRatio} format. Each balances readability with artistic impact.`,
      `Here are poster designs for ${keywords} \u2014 each with a different layout approach. One emphasizes bold headline space, another focuses on imagery, and the third blends both. All print-ready at ${enhanced.format.aspectRatio}.`,
    ],
    "product-ad": [
      `Here are ${enhanced.format.count} product ad concepts for ${keywords}. Each uses ${enhanced.format.style} aesthetics with cinematic lighting, aspirational composition, and social-media-optimized framing.`,
      `I created ${enhanced.format.count} premium product shots for ${keywords}. Each targets a different audience appeal \u2014 one aspirational, one lifestyle-focused, one bold and direct.`,
    ],
    "campaign-design": [
      `I built ${enhanced.format.count} campaign visuals around ${keywords}. Each piece works across platforms while maintaining strong visual impact with ${enhanced.format.style} brand positioning.`,
      `Your ${keywords} campaign gets three visual directions \u2014 each with scroll-stopping composition, platform-native formatting, and a cohesive ${enhanced.format.style} identity.`,
    ],
    "photo-transform": [
      `I reimagined ${keywords} in ${enhanced.format.style} style. Each transformation preserves the original composition's essence while bringing a completely refreshed creative direction.`,
      `Here's ${keywords} transformed with ${enhanced.format.style} artistry \u2014 from the texture of brushstrokes to the color temperature. Each version offers a different emotional interpretation.`,
    ],
    "story-narrative": [
      `I illustrated ${enhanced.format.count} key moments from ${keywords}. Each panel captures a story beat with cinematic framing, ${enhanced.format.style} visual storytelling, and emotionally engaging compositions.`,
      `Here are the opening scenes for ${keywords} \u2014 each illustration brings a narrative moment to life with vibrant color, character-driven framing, and ${enhanced.format.style} mood.`,
    ],
    "vision-board": [
      `Your vision board for ${keywords} is ready \u2014 ${enhanced.format.count} curated tiles, each with its own ${enhanced.format.style} color story. Together they create a cohesive, aspirational representation of your goals.`,
      `I assembled ${enhanced.format.count} focus areas for ${keywords}. Each tile tells part of the story with ${enhanced.format.style} aesthetics and intentional mood. Ask me to refine any tile.`,
    ],
    "dream-visualization": [
      `I visualized ${keywords} as ethereal scenes \u2014 soft edges, impossible geometry, and ${enhanced.format.style} color shifts between reality and fantasy. Each piece captures a different layer of the dream.`,
      `Here's ${keywords} brought to life through ${enhanced.format.style} dream logic. The palette drifts between deep indigo and soft luminescence, creating an otherworldly atmosphere.`,
    ],
    "emotional-landscape": [
      `I created ${enhanced.format.count} abstract pieces representing ${keywords}. Using ${enhanced.format.style} color psychology and compositional flow, each captures a different facet of inner experience.`,
      `For ${keywords}, I explored emotion through ${enhanced.format.style} visual language \u2014 deep tones for introspection, lighter hues for expansion. Each piece resonates with a different emotional frequency.`,
    ],
    "quote-poster": [
      `Here are ${enhanced.format.count} designs for ${keywords}. Each uses ${enhanced.format.style} typography with layouts that make the words visually striking while maintaining readability and emotional weight.`,
      `I created ${enhanced.format.count} quote poster directions for ${keywords} \u2014 one clean and minimal, one bold and dramatic. Both are designed to look stunning as wall art or social content.`,
    ],
    "brand-artwork": [
      `I created brand-aligned pieces for ${keywords}. Each incorporates ${enhanced.format.style} aesthetics while maintaining brand consistency \u2014 balancing creative expression with strategic communication.`,
      `Here's ${keywords} as brand artwork \u2014 ${enhanced.format.count} directions that balance visual impact with ${enhanced.format.style} brand identity. Each feels distinctive yet cohesive.`,
    ],
    "general-creative": [
      `I explored ${keywords} through three creative directions. Each piece uses ${enhanced.format.style} aesthetics with cinematic lighting, deliberate color grading, and professional art direction.`,
      `Here's my interpretation of ${keywords} \u2014 three unique takes with ${enhanced.format.style} styling, strong composition, and emotional depth. Each explores a different angle of your vision.`,
      `For ${keywords}, I crafted three visuals with ${enhanced.format.style} flair. Notice how each one shifts in mood, from bold confidence to quiet elegance. Pick a favorite and I'll refine it.`,
      `I brought ${keywords} to life with three distinct approaches. One leans into drama, one into simplicity, and one into something unexpected. All are ${enhanced.format.style} and production-ready.`,
    ],
  };

  const pool = responses[enhanced.intent] || responses["general-creative"] || [];
  return pool[Math.floor(Math.random() * pool.length)] || pool[0] || "Here's what I created for you.";
}
