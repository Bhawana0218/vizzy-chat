import { GeneratedAsset, Message } from "./types";

const MOCK_PLACEHOLDER_ASSETS: Record<string, { gradient: string; label: string }[]> = {
  "luxury-product": [
    { gradient: "from-amber-900 via-yellow-800 to-amber-950", label: "Hero Shot" },
    { gradient: "from-stone-800 via-amber-900 to-stone-900", label: "Lifestyle" },
    { gradient: "from-yellow-900 via-amber-800 to-yellow-950", label: "Detail" },
  ],
  "renaissance-photo": [
    { gradient: "from-amber-800 via-yellow-700 to-amber-900", label: "Oil Painting" },
    { gradient: "from-stone-700 via-amber-600 to-stone-800", label: "Baroque Style" },
  ],
  "emotional-landscape": [
    { gradient: "from-indigo-900 via-purple-800 to-violet-950", label: "Serenity" },
    { gradient: "from-blue-900 via-indigo-800 to-purple-900", label: "Reflection" },
    { gradient: "from-violet-900 via-purple-700 to-indigo-950", label: "Inner Peace" },
    { gradient: "from-slate-900 via-blue-900 to-indigo-950", label: "Contemplation" },
  ],
  "vision-board": [
    { gradient: "from-rose-800 via-pink-700 to-fuchsia-900", label: "Career Goals" },
    { gradient: "from-emerald-800 via-teal-700 to-cyan-900", label: "Health & Wellness" },
    { gradient: "from-amber-800 via-orange-700 to-yellow-900", label: "Financial Growth" },
    { gradient: "from-blue-800 via-indigo-700 to-violet-900", label: "Personal Growth" },
    { gradient: "from-violet-800 via-purple-700 to-fuchsia-900", label: "Travel Dreams" },
    { gradient: "from-teal-800 via-emerald-700 to-green-900", label: "Family & Home" },
  ],
  "dream-scene": [
    { gradient: "from-indigo-950 via-purple-800 to-pink-950", label: "The Dream Portal" },
    { gradient: "from-violet-950 via-fuchsia-800 to-rose-950", label: "Ethereal Passage" },
    { gradient: "from-blue-950 via-indigo-800 to-purple-950", label: "Dream Realm" },
  ],
  "children-story": [
    { gradient: "from-sky-400 via-blue-300 to-cyan-400", label: "Chapter 1: The Meadow" },
    { gradient: "from-green-400 via-emerald-300 to-teal-400", label: "Chapter 2: The Forest" },
    { gradient: "from-amber-400 via-yellow-300 to-orange-400", label: "Chapter 3: The Mountain" },
  ],
  "sale-poster": [
    { gradient: "from-red-600 via-rose-500 to-pink-600", label: "Premium Sale Banner" },
    { gradient: "from-orange-600 via-amber-500 to-yellow-600", label: "Seasonal Offer" },
  ],
  "winter-campaign": [
    { gradient: "from-blue-200 via-sky-100 to-cyan-200", label: "Winter Elegance" },
    { gradient: "from-slate-300 via-blue-200 to-indigo-300", label: "Frost Collection" },
    { gradient: "from-cyan-200 via-teal-100 to-emerald-200", label: "Holiday Warmth" },
  ],
  "brand-artwork": [
    { gradient: "from-violet-800 via-purple-700 to-indigo-900", label: "Brand Essence" },
    { gradient: "from-blue-800 via-indigo-700 to-violet-900", label: "Core Values" },
  ],
  "quote-poster": [
    { gradient: "from-stone-200 via-amber-100 to-stone-300", label: "Minimalist" },
    { gradient: "from-indigo-900 via-purple-800 to-violet-950", label: "Bold Dark" },
  ],
};

function createAsset(
  id: string,
  category: string,
  index: number,
  type: "image" | "video" | "poster" | "moodboard" | "storyboard" = "image"
): GeneratedAsset {
  const items = MOCK_PLACEHOLDER_ASSETS[category] || MOCK_PLACEHOLDER_ASSETS["emotional-landscape"];
  const item = items[index % items.length];
  const aspectRatio = type === "video" ? { width: 1280, height: 720 } : { width: 1024, height: 1024 };
  return {
    id,
    type,
    url: `mock://${category}/${index}`,
    title: item.label,
    prompt: item.label,
    ...aspectRatio,
  };
}

export interface MockResponse {
  text: string;
  assets?: { category: string; count: number; type?: GeneratedAsset["type"] }[];
}

const MOCK_RESPONSES: Record<string, MockResponse> = {
  "luxury product": {
    text: "I've created some premium product visuals with a luxurious aesthetic. Each version uses warm amber tones and rich shadows to convey elegance without feeling ostentatious. Would you like me to refine any of these, adjust the color palette, or create variations for specific platforms?",
    assets: [{ category: "luxury-product", count: 3 }],
  },
  "renaissance": {
    text: "Here are your photos reimagined in Renaissance style. I've captured the rich color palettes, dramatic lighting (chiaroscuro), and compositional techniques typical of the Old Masters. Would you like me to try a different art period or adjust the style?",
    assets: [{ category: "renaissance-photo", count: 2 }],
  },
  "emotional": {
    text: "I've created an abstract visualization of your emotional landscape. These pieces use color theory and compositional flow to represent the complexity of inner experience. The deep indigos and soft violets suggest depth and contemplation. Would you like me to explore different emotional tones?",
    assets: [{ category: "emotional-landscape", count: 4 }],
  },
  "vision board": {
    text: "Here's your vision board with six focus areas for the next three years. Each tile represents a key aspiration with its own color story and mood. You can rearrange, ask me to regenerate individual tiles, or add more areas. What would you like to adjust?",
    assets: [{ category: "vision-board", count: 6, type: "moodboard" }],
  },
  "dream": {
    text: "I've visualized your dream as a series of ethereal scenes. The dreamlike quality comes from soft edges, impossible geometry, and a palette that shifts between reality and fantasy. Would you like me to create a narrative sequence or adjust the atmosphere?",
    assets: [{ category: "dream-scene", count: 3 }],
  },
  "story": {
    text: "I've created the opening scenes for your storybook. Each illustration has been crafted to bring the narrative to life with vibrant colors and engaging compositions. Want me to continue with more chapters, adjust the art style, or modify any character designs?",
    assets: [{ category: "children-story", count: 3, type: "storyboard" }],
  },
  "sale poster": {
    text: "Here are some sale poster designs that feel premium while clearly communicating the offer. I've avoided loud, discount-heavy aesthetics in favor of sophisticated typography and balanced compositions. Should I tweak the messaging, colors, or create versions for different sizes?",
    assets: [{ category: "sale-poster", count: 2, type: "poster" }],
  },
  "winter campaign": {
    text: "I've put together a cohesive winter campaign concept with three visual directions. Each brings a different mood \u2014 from crisp elegance to cozy warmth. These can be adapted across posters, social media, and digital displays. Which direction resonates most?",
    assets: [{ category: "winter-campaign", count: 3 }],
  },
  "brand": {
    text: "I've created brand-aligned artwork incorporating your core values and color palette. Each piece maintains brand consistency while bringing creative freshness. Would you like variations for specific channels, or adjustments to better match your brand guidelines?",
    assets: [{ category: "brand-artwork", count: 2 }],
  },
  "quote poster": {
    text: "Here are two directions for your quote poster \u2014 a clean minimalist version and a bold dark variant. Both are designed to look stunning as wall art while maintaining readability. Want me to try different layouts, fonts, or color schemes?",
    assets: [{ category: "quote-poster", count: 2, type: "poster" }],
  },
  "make it more premium": {
    text: "I've refined the design with a more premium feel. The adjustments include: deeper shadows, more restrained color palette, increased negative space, and subtle gold accents. The overall tone is now more sophisticated and editorial. How does this feel?",
    assets: [{ category: "luxury-product", count: 2 }],
  },
  "variation": {
    text: "Here are some alternative variations. Each takes a slightly different creative direction while staying true to the original concept. You can mix elements from different versions or ask me to combine specific aspects. Which elements resonate with you?",
    assets: [{ category: "emotional-landscape", count: 3 }],
  },
  "cinematic": {
    text: "I've reimagined this with a cinematic quality \u2014 wider aspect ratio, dramatic lighting, film grain, and color grading that evokes a sense of narrative. This would work beautifully for video content or large-format displays. Want me to adjust the mood or create a sequence?",
    assets: [{ category: "dream-scene", count: 2, type: "video" }],
  },
};

export function getMockResponse(userMessage: string): MockResponse {
  const lower = userMessage.toLowerCase();

  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (lower.includes(key)) {
      return response;
    }
  }

  if (lower.includes("more premium") || lower.includes("more elegant") || lower.includes("more luxury")) {
    return MOCK_RESPONSES["make it more premium"];
  }
  if (lower.includes("variation") || lower.includes("alternative") || lower.includes("different version")) {
    return MOCK_RESPONSES["variation"];
  }
  if (lower.includes("cinematic") || lower.includes("movie") || lower.includes("film")) {
    return MOCK_RESPONSES["cinematic"];
  }

  return {
    text: `I understand what you're looking for. Let me create something special based on your description. I've generated a few options for you to consider. Each takes a different creative approach to your prompt. Would you like me to refine any of these, adjust the style, or create additional variations?`,
    assets: [{ category: "emotional-landscape", count: 2 }],
  };
}

export function generateAssetId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function buildAssets(category: string, count: number, type?: GeneratedAsset["type"]): GeneratedAsset[] {
  return Array.from({ length: count }, (_, i) =>
    createAsset(generateAssetId(), category, i, type)
  );
}

export const INITIAL_MESSAGES: Message[] = [];

export const SUGGESTED_PROMPTS = [
  { icon: "\u2728", text: "Create a luxury product ad for Instagram", category: "business" },
  { icon: "\uD83C\uDFA8", text: "Turn this photo into a renaissance-style artwork", category: "home" },
  { icon: "\uD83C\uDF19", text: "Show me how I feel right now", category: "home" },
  { icon: "\uD83D\uDCCB", text: "Create a vision board with my goals for the next 3 years", category: "home" },
  { icon: "\u2744\uFE0F", text: "Design a premium winter campaign for my store", category: "business" },
  { icon: "\uD83D\uDCD6", text: "Generate a story for my kids, then visualize it scene by scene", category: "home" },
  { icon: "\uD83D\uDCF8", text: "Create signage for a slow-moving product", category: "business" },
  { icon: "\uD83D\uDCDD", text: "Design a quote poster for my living room", category: "home" },
];
