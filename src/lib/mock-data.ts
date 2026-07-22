import { GeneratedAsset, Message } from "./types";

const MOCK_PLACEHOLDER_ASSETS: Record<string, { gradient: string; label: string; icon: string }[]> = {
  "luxury-product": [
    { gradient: "linear-gradient(135deg, #78350f 0%, #a16207 40%, #713f12 100%)", label: "Hero Shot", icon: "crown" },
    { gradient: "linear-gradient(135deg, #44403c 0%, #a16207 50%, #292524 100%)", label: "Lifestyle", icon: "star" },
    { gradient: "linear-gradient(135deg, #78350f 0%, #ca8a04 50%, #713f12 100%)", label: "Detail", icon: "diamond" },
  ],
  "renaissance-photo": [
    { gradient: "linear-gradient(135deg, #92400e 0%, #ca8a04 40%, #78350f 100%)", label: "Oil Painting", icon: "palette" },
    { gradient: "linear-gradient(135deg, #57534e 0%, #d97706 50%, #44403c 100%)", label: "Baroque Style", icon: "frame" },
  ],
  "emotional-landscape": [
    { gradient: "linear-gradient(135deg, #312e81 0%, #7c3aed 50%, #1e1b4b 100%)", label: "Serenity", icon: "waves" },
    { gradient: "linear-gradient(135deg, #1e3a5f 0%, #6366f1 50%, #312e81 100%)", label: "Reflection", icon: "cloud" },
    { gradient: "linear-gradient(135deg, #4c1d95 0%, #a855f7 40%, #2e1065 100%)", label: "Inner Peace", icon: "heart" },
    { gradient: "linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #1e1b4b 100%)", label: "Contemplation", icon: "moon" },
  ],
  "vision-board": [
    { gradient: "linear-gradient(135deg, #9f1239 0%, #ec4899 50%, #831843 100%)", label: "Career Goals", icon: "target" },
    { gradient: "linear-gradient(135deg, #065f46 0%, #10b981 50%, #064e3b 100%)", label: "Health & Wellness", icon: "leaf" },
    { gradient: "linear-gradient(135deg, #92400e 0%, #f59e0b 50%, #78350f 100%)", label: "Financial Growth", icon: "trending" },
    { gradient: "linear-gradient(135deg, #1e3a5f 0%, #818cf8 50%, #312e81 100%)", label: "Personal Growth", icon: "sun" },
    { gradient: "linear-gradient(135deg, #581c87 0%, #d946ef 50%, #701a75 100%)", label: "Travel Dreams", icon: "globe" },
    { gradient: "linear-gradient(135deg, #134e4a 0%, #34d399 50%, #0f766e 100%)", label: "Family & Home", icon: "home" },
  ],
  "dream-scene": [
    { gradient: "linear-gradient(135deg, #1e1b4b 0%, #a855f7 40%, #831843 100%)", label: "Dream Portal", icon: "portal" },
    { gradient: "linear-gradient(135deg, #581c87 0%, #f472b6 50%, #9f1239 100%)", label: "Ethereal Passage", icon: "star" },
    { gradient: "linear-gradient(135deg, #172554 0%, #6366f1 50%, #581c87 100%)", label: "Dream Realm", icon: "cloud" },
  ],
  "children-story": [
    { gradient: "linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 50%, #0284c7 100%)", label: "Chapter 1: The Meadow", icon: "sun" },
    { gradient: "linear-gradient(135deg, #16a34a 0%, #86efac 50%, #15803d 100%)", label: "Chapter 2: The Forest", icon: "leaf" },
    { gradient: "linear-gradient(135deg, #d97706 0%, #fcd34d 50%, #b45309 100%)", label: "Chapter 3: The Mountain", icon: "mountain" },
  ],
  "sale-poster": [
    { gradient: "linear-gradient(135deg, #dc2626 0%, #fb7185 50%, #be123c 100%)", label: "Premium Sale Banner", icon: "tag" },
    { gradient: "linear-gradient(135deg, #ea580c 0%, #fbbf24 50%, #c2410c 100%)", label: "Seasonal Offer", icon: "gift" },
  ],
  "winter-campaign": [
    { gradient: "linear-gradient(135deg, #bfdbfe 0%, #e0f2fe 50%, #93c5fd 100%)", label: "Winter Elegance", icon: "snow" },
    { gradient: "linear-gradient(135deg, #cbd5e1 0%, #bfdbfe 50%, #a5b4fc 100%)", label: "Frost Collection", icon: "crystal" },
    { gradient: "linear-gradient(135deg, #a5f3fc 0%, #d1fae5 50%, #99f6e4 100%)", label: "Holiday Warmth", icon: "sun" },
  ],
  "brand-artwork": [
    { gradient: "linear-gradient(135deg, #5b21b6 0%, #a78bfa 50%, #4c1d95 100%)", label: "Brand Essence", icon: "diamond" },
    { gradient: "linear-gradient(135deg, #1e3a5f 0%, #818cf8 50%, #312e81 100%)", label: "Core Values", icon: "star" },
  ],
  "quote-poster": [
    { gradient: "linear-gradient(135deg, #e7e5e4 0%, #fef3c7 50%, #d6d3d1 100%)", label: "Minimalist", icon: "text" },
    { gradient: "linear-gradient(135deg, #312e81 0%, #a855f7 50%, #1e1b4b 100%)", label: "Bold Dark", icon: "text" },
  ],
  "generic-creative": [
    { gradient: "linear-gradient(135deg, #4c1d95 0%, #ec4899 40%, #0ea5e9 100%)", label: "Creative Vision A", icon: "sparkle" },
    { gradient: "linear-gradient(135deg, #065f46 0%, #0ea5e9 50%, #5b21b6 100%)", label: "Creative Vision B", icon: "sparkle" },
    { gradient: "linear-gradient(135deg, #92400e 0%, #ec4899 50%, #1e3a5f 100%)", label: "Creative Vision C", icon: "sparkle" },
  ],
};

function getIconSvg(icon: string): string {
  const icons: Record<string, string> = {
    crown: '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    diamond: '<path d="M6 3h12l4 6-10 13L2 9z"/>',
    palette: '<circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    sparkle: '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>',
    portal: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/>',
    mountain: '<path d="M8 3l4 8 5-5 5 15H2z"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    snow: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M20 16l-4-4 4-4"/><path d="M4 8l4 4-4 4"/><path d="M16 4l-4 4-4-4"/><path d="M8 20l4-4 4 4"/>',
    crystal: '<polygon points="12 2 22 8.5 12 22 2 8.5 12 2"/>',
    text: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    frame: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  };
  return icons[icon] || icons.sparkle;
}

function createAsset(
  id: string,
  category: string,
  index: number,
  type: "image" | "video" | "poster" | "moodboard" | "storyboard" = "image"
): GeneratedAsset {
  const items = MOCK_PLACEHOLDER_ASSETS[category] || MOCK_PLACEHOLDER_ASSETS["generic-creative"];
  const item = items[index % items.length];
  const aspectRatio = type === "video" ? { width: 1280, height: 720 } : { width: 1024, height: 1024 };

  const iconPath = getIconSvg(item.icon);
  const svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'><defs><style>svg{background:${encodeURIComponent(item.gradient)};}</style></defs><rect width='1024' height='1024' fill='url(%23g)'/><g transform='translate(512,480)' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='2'><g transform='scale(3.5) translate(-12,-12)'>${iconPath.replace(/\/>/g, "/>").replace(/<(?!\/|g|path|circle|line|rect|polygon|polyline)/g, "&lt;")}</g></g><text x='512' y='680' text-anchor='middle' fill='rgba(255,255,255,0.5)' font-family='system-ui' font-size='28' font-weight='600'>${item.label.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;

  return {
    id,
    type,
    url: `data:image/svg+xml,${svgContent}`,
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
    text: "I've created some premium product visuals with a luxurious aesthetic. Each version uses warm amber tones and rich shadows to convey elegance. Would you like me to refine any of these or create variations for specific platforms?",
    assets: [{ category: "luxury-product", count: 3 }],
  },
  "renaissance": {
    text: "Here are your photos reimagined in Renaissance style. I've captured the rich color palettes, dramatic lighting (chiaroscuro), and compositional techniques typical of the Old Masters. Would you like me to try a different art period?",
    assets: [{ category: "renaissance-photo", count: 2 }],
  },
  "emotional": {
    text: "I've created an abstract visualization of your emotional landscape. These pieces use color theory and compositional flow to represent the complexity of inner experience. The deep indigos and soft violets suggest depth and contemplation.",
    assets: [{ category: "emotional-landscape", count: 4 }],
  },
  "vision board": {
    text: "Here's your vision board with six focus areas for the next three years. Each tile represents a key aspiration with its own color story and mood. You can ask me to regenerate individual tiles or add more areas.",
    assets: [{ category: "vision-board", count: 6, type: "moodboard" }],
  },
  "dream": {
    text: "I've visualized your dream as a series of ethereal scenes. The dreamlike quality comes from soft edges, impossible geometry, and a palette that shifts between reality and fantasy.",
    assets: [{ category: "dream-scene", count: 3 }],
  },
  "story": {
    text: "I've created the opening scenes for your storybook. Each illustration has been crafted to bring the narrative to life with vibrant colors and engaging compositions. Want me to continue with more chapters?",
    assets: [{ category: "children-story", count: 3, type: "storyboard" }],
  },
  "sale poster": {
    text: "Here are some sale poster designs that feel premium while clearly communicating the offer. I've avoided loud, discount-heavy aesthetics in favor of sophisticated typography and balanced compositions.",
    assets: [{ category: "sale-poster", count: 2, type: "poster" }],
  },
  "winter campaign": {
    text: "I've put together a cohesive winter campaign concept with three visual directions. Each brings a different mood \u2014 from crisp elegance to cozy warmth. These can be adapted across posters, social media, and digital displays.",
    assets: [{ category: "winter-campaign", count: 3 }],
  },
  "brand": {
    text: "I've created brand-aligned artwork incorporating your core values and color palette. Each piece maintains brand consistency while bringing creative freshness. Would you like variations for specific channels?",
    assets: [{ category: "brand-artwork", count: 2 }],
  },
  "quote poster": {
    text: "Here are two directions for your quote poster \u2014 a clean minimalist version and a bold dark variant. Both are designed to look stunning as wall art while maintaining readability and emotional impact.",
    assets: [{ category: "quote-poster", count: 2, type: "poster" }],
  },
  "make it more premium": {
    text: "I've refined the design with a more premium feel. The adjustments include: deeper shadows, more restrained color palette, increased negative space, and subtle gold accents. How does this feel?",
    assets: [{ category: "luxury-product", count: 2 }],
  },
  "variation": {
    text: "Here are some alternative variations. Each takes a slightly different creative direction while staying true to the original concept. You can mix elements from different versions or ask me to refine a specific one.",
    assets: [{ category: "emotional-landscape", count: 3 }],
  },
  "cinematic": {
    text: "I've reimagined this with a cinematic quality \u2014 wider aspect ratio, dramatic lighting, film grain, and color grading that evokes a sense of narrative. This would work beautifully for video content or large-format displays.",
    assets: [{ category: "dream-scene", count: 2, type: "video" }],
  },
};

function extractSubject(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/^(create|generate|make|design|draw|illustrate|show|give|i want|i need|can you|please|help me)\s*/i, "")
    .replace(/\s*(for me|for my|for|please)\s*/i, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
  const words = cleaned.split(/\s+/).filter((w) => w.length > 2).slice(0, 5);
  return words.join(" ") || "your vision";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getMockResponse(userMessage: string): MockResponse {
  const lower = userMessage.toLowerCase();

  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  if (lower.includes("premium") || lower.includes("elegant") || lower.includes("luxury")) return MOCK_RESPONSES["make it more premium"];
  if (lower.includes("variation") || lower.includes("alternative") || lower.includes("different version")) return MOCK_RESPONSES["variation"];
  if (lower.includes("cinematic") || lower.includes("movie") || lower.includes("film")) return MOCK_RESPONSES["cinematic"];
  if (lower.includes("campaign") || lower.includes("marketing") || lower.includes("social media")) return MOCK_RESPONSES["winter campaign"];
  if (lower.includes("poster") || lower.includes("banner") || lower.includes("flyer")) return MOCK_RESPONSES["sale poster"];
  if (lower.includes("product") || lower.includes("ad ") || lower.includes("advertisement")) return MOCK_RESPONSES["luxury product"];
  if (lower.includes("story") || lower.includes("book") || lower.includes("chapter")) return MOCK_RESPONSES["story"];
  if (lower.includes("board") || lower.includes("collage")) return MOCK_RESPONSES["vision board"];
  if (lower.includes("dream") || lower.includes("fantasy") || lower.includes("ethereal")) return MOCK_RESPONSES["dream"];
  if (lower.includes("feel") || lower.includes("emotion") || lower.includes("mood")) return MOCK_RESPONSES["emotional"];
  if (lower.includes("quote") || lower.includes("typography")) return MOCK_RESPONSES["quote poster"];
  if (lower.includes("brand") || lower.includes("identity")) return MOCK_RESPONSES["brand"];
  if (lower.includes("photo") || lower.includes("transform") || lower.includes("restyle") || lower.includes("turn")) return MOCK_RESPONSES["renaissance"];

  const subject = extractSubject(userMessage);

  const genericResponses = [
    `I've brought "${subject}" to life with a fresh creative direction. Each version explores a different mood and composition while staying true to your concept. The results balance visual impact with professional polish.`,
    `Here's my take on "${subject}" \u2014 I explored three distinct angles: one bold and eye-catching, one refined and elegant, and one with an unexpected twist. Let me know which direction resonates.`,
    `I explored "${subject}" through multiple creative lenses. Each piece has its own personality \u2014 from dramatic lighting to soft, approachable tones. Which feeling speaks to you?`,
    `Working on "${subject}" was a blast. I played with composition, color, and mood to create something that stands out. These are designed to grab attention while feeling polished and intentional.`,
    `Your vision for "${subject}" inspired some bold choices. I leaned into strong visual hierarchy, intentional negative space, and a color palette that pops. Want me to push further in any direction?`,
    `I took "${subject}" in a direction that balances creativity with clarity. Each version tells a slightly different story through its visual language. Pick a favorite and I'll refine it further.`,
    `Here are three fresh interpretations of "${subject}" \u2014 each with a unique composition and mood. I focused on making them visually striking while keeping them versatile enough for any platform.`,
    `I channeled "${subject}" into visuals that feel both modern and timeless. The interplay of light, texture, and color creates depth across each variation. Which one catches your eye?`,
  ];

  return {
    text: pickRandom(genericResponses),
    assets: [{ category: "generic-creative", count: 3 }],
  };
}

export function generateAssetId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function buildAssets(category: string, count: number, type?: GeneratedAsset["type"]): GeneratedAsset[] {
  return Array.from({ length: count }, (_, i) => createAsset(generateAssetId(), category, i, type));
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
