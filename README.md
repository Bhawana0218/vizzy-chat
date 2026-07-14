# Vizzy Chat

**The conversational operating system for creativity.**

Vizzy Chat enables individuals and businesses to generate, iterate, and deploy visual, narrative, and experiential content through natural language conversations. Upload reference images, describe your vision, and watch Vizzy bring it to life — posters, product shots, storyboards, vision boards, and more.

---

## Features

- **Conversational AI Interface** — ChatGPT-style UI with real-time SSE streaming responses
- **Voice Input with Speech-to-Text** — Record voice commands that transcribe to text and generate images
- **Drag-and-Drop Reference Upload** — Drop, paste (Ctrl+V), or click to attach up to 4 reference images per prompt
- **Multi-Format Asset Generation** — Images, posters, storyboards, moodboards, and video concepts via Pollinations AI
- **6 Unique Variation Styles** — Each generation creates distinct aesthetic variations
- **Full-Screen Asset Viewer** — Zoom, pan, metadata, and format selection
- **Compare Side-by-Side** — Compare multiple assets with independent/synced zoom
- **Download & Export** — PNG, JPG, WebP format conversion with bulk download
- **Share Modal** — Copy link, copy prompt, or download in preferred format
- **Per-User Data Isolation** — Each account has completely separate data
- **Brand Settings** — Color palette, brand values, tone of voice, industry, target audience
- **Dashboard** — Stats, quick actions, and plan/usage overview
- **My Assets Gallery** — Filter and browse all generated assets across conversations
- **Conversation History** — Persistent sidebar with folders, pinning, archiving, and search
- **Command Palette** — Ctrl+K quick actions for rapid creative workflows
- **Credit System** — Usage tracking with plan-based limits and progress visualization
- **Google OAuth** — Secure authentication via Supabase Auth
- **Responsive Design** — Fully responsive dark theme optimized for all screen sizes
- **Production Architecture** — Zod validation, structured logging, rate limiting, audit trails

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│  Next.js App Router + React 19 + TypeScript + Tailwind CSS v4   │
│  ┌────────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐  │
│  │  Sidebar   │ │ ChatArea │ │ ChatInput  │ │  CommandPalette│  │
│  │  History   │ │ Messages │ │ Voice/DnD  │ │  Ctrl+K        │  │
│  │  Folders   │ │ Assets   │ │ Paste      │ │  Quick Actions │  │
│  └────────────┘ └──────────┘ └────────────┘ └────────────────┘  │
│  ┌────────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐  │
│  │  Asset     │ │ Compare  │ │  Canvas    │ │  Share Modal   │  │
│  │  Workspace │ │  Modal   │ │  Modal     │ │  Export        │  │
│  └────────────┘ └──────────┘ └────────────┘ └────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │  HTTP / SSE
┌──────────────────────────▼───────────────────────────────────────┐
│                     API ROUTES (Next.js)                         │
│  POST /api/chat     — Streaming chat (SSE)                       │
│  POST /api/generate — Asset generation with credit deduction     │
│  CRUD /api/conversations    — Conversation management            │
│  CRUD /api/assets           — Generated asset management         │
│  POST /api/auth/callback    — Google OAuth flow                  │
│  POST /api/auth/logout      — Session termination                │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                  VALIDATION + MIDDLEWARE                           │
│  Zod schemas — Input validation on all routes                    │
│  Rate limiter — DB-backed + in-memory fallback                   │
│  Auth middleware — JWT verification, session management           │
│  Structured logger — Request/response logging                    │
│  Custom error hierarchy — Typed error responses                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                     AI PROVIDER LAYER                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Provider Router (pluggable, factory pattern)        │       │
│  │  ┌─────────┐  ┌──────────────┐  ┌───────────────┐   │       │
│  │  │ OpenAI  │  │ Pollinations │  │  Future        │   │       │
│  │  │ GPT-4o  │  │ AI (images)  │  │  Providers     │   │       │
│  │  └─────────┘  └──────────────┘  └───────────────┘   │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    DATA + STORAGE LAYER                           │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐    │
│  │ Prisma ORM   │  │ PostgreSQL    │  │ Per-User localStorage│   │
│  │ Type-safe    │  │ (Supabase)    │  │ Data isolation      │   │
│  │ 8 models     │  │ RLS policies  │  │ Account-scoped keys │   │
│  └──────────────┘  └───────────────┘  └────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer            | Technology                                    |
|-----------------|-----------------------------------------------|
| Framework       | Next.js 16 (App Router, Turbopack)            |
| UI              | React 19, TypeScript, Tailwind CSS v4         |
| Database        | PostgreSQL via Supabase                       |
| ORM             | Prisma 6 (type-safe client)                   |
| Authentication  | Supabase Auth (Google OAuth)                  |
| Chat AI         | OpenAI API (GPT-4o)                           |
| Image AI        | Pollinations AI (no API key needed)           |
| Voice Input     | Web Speech API (SpeechRecognition)            |
| Validation      | Zod (runtime schema validation)               |
| Storage         | Per-user localStorage with user-scoped keys   |
| Deployment      | Vercel (frontend) + Supabase (backend)        |

---

## Database Schema

8 models covering the full product lifecycle:

| Model            | Purpose                                           |
|-----------------|---------------------------------------------------|
| `users`          | User profiles, credits, plan tier                  |
| `conversations`  | Chat sessions with title and timestamps            |
| `messages`       | Individual messages with content type metadata     |
| `generated_assets` | AI-generated images, videos, posters, etc.       |
| `user_preferences` | Brand colors, fonts, voice, target audience      |
| `api_keys`       | Future programmatic API access                     |
| `rate_limits`    | Per-user, per-endpoint request throttling          |
| `audit_logs`     | Full audit trail of user actions                   |

Full SQL migration with row-level security policies is included in `prisma/migrations/0_init/migration.sql`.

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- npm or yarn
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI API key](https://platform.openai.com) (optional for chat completions)

### Installation

```bash
git clone https://github.com/your-username/vizzy-chat.git
cd vizzy-chat
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
# Supabase (required for auth + database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database (from Supabase dashboard > Settings > Database)
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# OpenAI (optional — needed for chat completions)
OPENAI_API_KEY=sk-...

# App URL (set to your Vercel deployment URL for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Image generation uses Pollinations AI (no API key needed). The app runs in mock mode for chat without OpenAI configured.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

Or run the SQL migration directly in the Supabase SQL Editor:
```bash
# Copy contents of prisma/migrations/0_init/migration.sql
```

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
5. In Supabase dashboard, add your Vercel URL to **Authentication > URL Configuration > Redirect URLs**

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── assets/route.ts           # CRUD for generated assets
│   │   ├── auth/
│   │   │   ├── callback/route.ts     # OAuth callback handler
│   │   │   ├── me/route.ts           # Current user profile
│   │   │   └── logout/route.ts       # Session termination
│   │   ├── chat/route.ts             # Streaming chat (SSE)
│   │   ├── conversations/
│   │   │   ├── route.ts              # List / create conversations
│   │   │   └── [id]/route.ts         # GET / PATCH / DELETE
│   │   └── generate/route.ts         # Asset generation endpoint
│   ├── assets/page.tsx               # My Assets gallery page
│   ├── dashboard/page.tsx            # Dashboard with stats
│   ├── login/page.tsx                # Google OAuth login page
│   ├── page.tsx                      # Main chat interface
│   ├── settings/page.tsx             # Brand settings page
│   ├── globals.css                   # Tailwind v4 theme + animations
│   └── layout.tsx                    # Root layout with providers
├── components/
│   ├── AssetCard.tsx                 # Asset card with context menu
│   ├── AssetGrid.tsx                 # Horizontal scrollable gallery
│   ├── AssetWorkspace.tsx            # Right-side asset panel
│   ├── CanvasModal.tsx               # Full-screen asset viewer
│   ├── ChatArea.tsx                  # Message list with auto-scroll
│   ├── ChatInput.tsx                 # Voice + DnD upload + paste
│   ├── CommandPalette.tsx            # Ctrl+K command palette
│   ├── CompareModal.tsx              # Side-by-side comparison
│   ├── CreditsBadge.tsx              # Credit usage indicator
│   ├── ErrorBoundary.tsx             # React error boundary
│   ├── MessageBubble.tsx             # User/assistant message rendering
│   ├── ShareModal.tsx                # Download/share/export modal
│   ├── Sidebar.tsx                   # Conversation history + folders
│   ├── Skeletons.tsx                 # Loading skeletons
│   ├── Toast.tsx                     # Toast notification system
│   ├── UserMenu.tsx                  # Profile dropdown menu
│   └── WelcomeScreen.tsx             # Empty state with suggestions
├── hooks/
│   └── useVoiceRecorder.ts           # Voice recording + STT transcription
├── lib/
│   ├── ai/
│   │   ├── openai.ts                 # OpenAI provider (chat only)
│   │   ├── pollinations.ts           # Pollinations AI (image URLs)
│   │   ├── prompt-engine.ts          # Professional prompt enhancement
│   │   └── router.ts                 # Multi-provider routing
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (resilient)
│   │   ├── server.ts                 # Server client (cookie-aware)
│   │   └── admin.ts                  # Service role admin client
│   ├── api.ts                        # Frontend API client
│   ├── auth.ts                       # Server-side auth helpers
│   ├── auth-context.tsx              # React auth context + OAuth
│   ├── download.ts                   # Image download + format conversion
│   ├── mock-data.ts                  # Mock responses + assets
│   ├── prisma.ts                     # Prisma client singleton
│   ├── storage.ts                    # Per-user localStorage persistence
│   ├── types.ts                      # TypeScript type definitions
│   └── validation.ts                 # Zod validation schemas
└── middleware.ts                      # Minimal pass-through middleware
prisma/
├── schema.prisma                     # 8-model database schema
└── migrations/
    └── 0_init/migration.sql          # SQL migration + RLS policies
```

---

## API Reference

### `POST /api/chat`
Streaming chat endpoint using Server-Sent Events.

```json
// Request
{ "message": "Create a luxury product ad", "conversationId": "optional-id" }

// SSE Events
event: chunk
data: {"content":"Here's what I created..."}

event: done
data: {"messageId":"msg-123","conversationId":"conv-456"}

event: error
data: {"error":"Rate limit exceeded"}
```

### `POST /api/generate`
Generate creative assets with credit deduction.

```json
// Request
{ "prompt": "Winter campaign poster", "assetType": "poster", "count": 3 }

// Response
{ "assets": [...], "creditsRemaining": 987 }
```

### `GET/POST /api/conversations`
List all conversations or create a new one.

### `GET/PATCH/DELETE /api/conversations/[id]`
Manage individual conversations.

### `GET/PATCH/DELETE /api/assets`
Query and manage generated assets.

---

## Key Features Deep Dive

### Voice Input with Speech-to-Text

Record voice commands that automatically transcribe and generate images:

- **Real-time Transcription** — Web Speech API transcribes as you speak
- **Live Waveform** — Visual feedback during recording with AnalyserNode
- **Pause/Resume** — Full control over recording sessions
- **Smart Fallback** — Uses typed text → voice transcript → generic fallback
- **Image Generation** — Transcribed text triggers image intent detection

### Drag-and-Drop Reference Upload

The chat input supports multiple ways to attach reference images:

- **Drag & Drop** — Drag images directly onto the chat area
- **Paste** — Ctrl+V / Cmd+V to paste from clipboard
- **File Picker** — Click the image icon to browse files
- **Inline Previews** — Thumbnail previews with remove buttons (up to 4 images)
- **Visual Feedback** — Violet glow overlay during drag-over state

### Per-User Data Isolation

Each account has completely separate data:

- **User-Scoped Keys** — localStorage keys include user ID: `vizzy-chat-conversations-{userId}`
- **No Cross-Contamination** — Switching accounts loads only that account's data
- **Migration Support** — Existing global data migrates to user-specific keys
- **All Data Isolated** — Conversations, folders, brand settings, assets all per-user

### Compare Side-by-Side

Compare multiple assets with precision:

- **Independent Zoom** — Zoom each image separately
- **Synced Zoom** — Toggle synchronized zoom across both images
- **Navigation** — Arrow keys and dot navigation between asset pairs
- **Format Download** — Download either image in PNG/JPG/WebP

### Brand Settings

Configure your brand identity for AI-generated content:

- **Brand Colors** — Up to 6 colors that influence AI visual generation
- **Brand Values** — Core values that define your brand personality
- **Tone of Voice** — Professional, casual, playful, luxurious, bold, minimal, warm, edgy
- **Industry** — Food & Beverage, Fashion, Technology, Health & Wellness, etc.
- **Target Audience** — Describe your ideal customer
- **Logo Description** — Describe your logo for AI to incorporate

### Streaming Responses

All AI responses stream in real-time via Server-Sent Events:
- Words appear one-by-one with a blinking cursor
- Graceful fallback to mock streaming when backend is unavailable
- Assets appear progressively after text completes

### Command Palette

Press **Ctrl+K** to open the command palette with quick actions:
- New conversation
- Pre-built creative prompts (luxury ads, renaissance art, vision boards, etc.)
- Keyboard-navigable with arrow keys

---

## Mock Mode

The application runs entirely in mock mode without any API keys configured. This enables:

- Full UI exploration and interaction
- Simulated streaming responses with realistic timing
- Generated mock asset data with category-specific gradients
- Conversation history persistence via localStorage
- Drag-and-drop upload with client-side preview

Perfect for demos, development, and evaluation without any external dependencies.

---

## Roadmap

- [x] Voice input with speech-to-text transcription
- [x] Pollinations AI for image generation (no API key)
- [x] Per-user data isolation
- [x] Compare side-by-side view
- [x] Download/export with format conversion
- [x] Brand settings page
- [x] Dashboard with stats
- [x] My Assets gallery
- [ ] Video generation support
- [ ] Real-time collaborative canvases
- [ ] Export to Figma / Canva integration
- [ ] Batch generation with queue management
- [ ] REST API access with API key authentication
- [ ] Webhook notifications for async generation
- [ ] Multi-language support (i18n)
- [ ] Mobile-optimized gesture interactions

---

## License

MIT

---

Built with Next.js 16, React 19, TypeScript, Supabase, Prisma, Pollinations AI