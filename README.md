# Vizzy Chat

**The conversational operating system for creativity.**

Vizzy Chat enables individuals and businesses to generate, iterate, and deploy visual, narrative, and experiential content through natural language conversations. Upload reference images, describe your vision, and watch Vizzy bring it to life — posters, product shots, storyboards, vision boards, and more.

---

## Features

- **Conversational AI Interface** — ChatGPT-style UI with real-time SSE streaming responses
- **Drag-and-Drop Reference Upload** — Drop, paste (Ctrl+V), or click to attach up to 4 reference images per prompt
- **Multi-Format Asset Generation** — Images, posters, storyboards, moodboards, and video concepts
- **Asset Viewer Modal** — Full-screen canvas view for inspecting and acting on generated assets
- **Conversation History** — Persistent sidebar with date-grouped history and search
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
│  │  History   │ │ Messages │ │ DnD Upload │ │  Ctrl+K        │  │
│  │  Search    │ │ Assets   │ │ Paste      │ │  Quick Actions │  │
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
│  │  ┌─────────┐  ┌──────────┐  ┌───────────────────┐   │       │
│  │  │ OpenAI  │  │  Flux    │  │  Future Providers │   │       │
│  │  │ GPT-4o  │  │  Schnell │  │  Claude, Gemini   │   │       │
│  │  └─────────┘  └──────────┘  └───────────────────┘   │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    DATA + STORAGE LAYER                           │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐    │
│  │ Prisma ORM   │  │ PostgreSQL    │  │ Supabase Storage   │    │
│  │ Type-safe    │  │ (Supabase)    │  │ Asset buckets      │    │
│  │ 8 models     │  │ RLS policies  │  │ Public + private   │    │
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
| AI Integration  | OpenAI API (GPT-4o + DALL-E)                  |
| Validation      | Zod (runtime schema validation)               |
| Storage         | Supabase Storage Buckets (image assets)       |
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

Full SQL migration with row-level security policies is included in `prisma/migrations/001_init.sql`.

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- npm or yarn
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI API key](https://platform.openai.com) (optional for mock mode)

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

# OpenAI (optional — app runs in mock mode without this)
OPENAI_API_KEY=sk-...
```

> **Note:** The app runs fully in mock mode without any environment variables configured. The UI, streaming, drag-and-drop, and all interactions work with generated mock responses.

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
# Copy contents of prisma/migrations/001_init.sql
```

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── assets/route.ts           # CRUD for generated assets
│   │   ├── auth/
│   │   │   ├── callback/route.ts     # OAuth callback handler
│   │   │   └── logout/route.ts       # Session termination
│   │   ├── chat/route.ts             # Streaming chat (SSE)
│   │   ├── conversations/
│   │   │   ├── route.ts              # List / create conversations
│   │   │   └── [id]/route.ts         # GET / PATCH / DELETE
│   │   └── generate/route.ts         # Asset generation endpoint
│   ├── login/page.tsx                # Google OAuth login page
│   ├── page.tsx                      # Main chat interface
│   ├── globals.css                   # Tailwind v4 theme + animations
│   └── layout.tsx                    # Root layout with providers
├── components/
│   ├── AssetCard.tsx                 # Individual asset preview card
│   ├── AssetGrid.tsx                 # Horizontal scrollable gallery
│   ├── CanvasModal.tsx               # Full-screen asset viewer
│   ├── ChatArea.tsx                  # Message list with auto-scroll
│   ├── ChatInput.tsx                 # DnD upload + paste + streaming
│   ├── CommandPalette.tsx            # Ctrl+K command palette
│   ├── CreditsBadge.tsx              # Credit usage indicator
│   ├── ErrorBoundary.tsx             # React error boundary
│   ├── MessageBubble.tsx             # User/assistant message rendering
│   ├── Sidebar.tsx                   # Conversation history
│   ├── Skeletons.tsx                 # Loading skeletons
│   ├── Toast.tsx                     # Toast notification system
│   ├── UserMenu.tsx                  # Profile dropdown menu
│   └── WelcomeScreen.tsx             # Empty state with suggestions
├── lib/
│   ├── ai/
│   │   ├── openai.ts                 # OpenAI provider (chat + images)
│   │   ├── router.ts                 # Multi-provider routing
│   │   └── types.ts                  # Provider interfaces
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (resilient)
│   │   ├── server.ts                 # Server client (cookie-aware)
│   │   └── admin.ts                  # Service role admin client
│   ├── api.ts                        # Frontend API client
│   ├── auth.ts                       # Server-side auth helpers
│   ├── auth-context.tsx              # React auth context + OAuth
│   ├── errors.ts                     # Custom error classes
│   ├── logger.ts                     # Structured logging
│   ├── mock-data.ts                  # Mock responses + assets
│   ├── prisma.ts                     # Prisma client singleton
│   ├── rate-limit.ts                 # DB + in-memory rate limiter
│   ├── storage.ts                    # localStorage persistence
│   ├── types.ts                      # TypeScript type definitions
│   └── validation.ts                 # Zod validation schemas
└── middleware.ts                      # Auth guard for protected routes
prisma/
├── schema.prisma                     # 8-model database schema
└── migrations/
    └── 001_init.sql                  # SQL migration + RLS policies
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
{ "prompt": "Winter campaign poster", "type": "poster", "count": 3 }

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

### Drag-and-Drop Reference Upload

The chat input supports multiple ways to attach reference images:

- **Drag & Drop** — Drag images directly onto the chat area
- **Paste** — Ctrl+V / Cmd+V to paste from clipboard
- **File Picker** — Click the image icon to browse files
- **Inline Previews** — Thumbnail previews with remove buttons (up to 4 images)
- **Visual Feedback** — Violet glow overlay during drag-over state

Attached images appear as thumbnails above the user's message in the conversation history.

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

- [ ] Voice input (Web Speech API)
- [ ] Video generation support
- [ ] Real-time collaborative canvases
- [ ] Brand profile management with style presets
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

Built with Next.js 16, React 19, TypeScript, Supabase, Prisma, and OpenAI.
