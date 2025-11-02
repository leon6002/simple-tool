# SimpleTool - Project Structure & Guidelines

## 📁 Folder Structure

```
simple-tool/
├── app/                          # Next.js App Router
│   ├── tools/                    # Tool pages
│   │   ├── hex-converter/        # Hex calculator tool
│   │   ├── image-converter/      # Image format converter
│   │   ├── ocr/                  # OCR tool
│   │   ├── model-viewer/         # 3D model viewer
│   │   ├── text-utils/           # Text utilities
│   │   └── layout.tsx            # Tools layout with metadata
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/
│   ├── layout/                   # Layout components
│   │   ├── navbar.tsx            # Navigation bar
│   │   └── footer.tsx            # Footer
│   ├── providers/                # Context providers
│   │   └── theme-provider.tsx   # Theme provider
│   ├── tools/                    # Tool-specific components
│   │   └── tool-card.tsx         # Tool card component
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── ...
├── lib/
│   ├── constants/                # Constants and data
│   │   └── tools.ts              # Tool definitions
│   ├── stores/                   # Zustand stores
│   │   └── search-store.ts       # Search state management
│   └── utils.ts                  # Utility functions
├── types/
│   └── index.ts                  # TypeScript type definitions
└── public/                       # Static assets
```

## 🎯 Naming Conventions

### Tool Pages
- **Route**: `/tools/[tool-name]`
- **Folder**: `app/tools/tool-name/`
- **File**: `page.tsx`
- **Component**: `ToolNamePage` (PascalCase)

**Examples:**
- Hex Converter: `/tools/hex-converter` → `app/tools/hex-converter/page.tsx`
- Image Converter: `/tools/image-converter` → `app/tools/image-converter/page.tsx`
- OCR Tool: `/tools/ocr` → `app/tools/ocr/page.tsx`

### Components
- **Layout components**: `components/layout/component-name.tsx`
- **Tool components**: `components/tools/component-name.tsx`
- **UI components**: `components/ui/component-name.tsx` (from shadcn/ui)
- **Component names**: PascalCase (e.g., `ToolCard`, `Navbar`)

### Types
- **Interface names**: PascalCase (e.g., `Tool`, `ToolCategory`)
- **Type names**: PascalCase (e.g., `NumberSystem`)
- **File**: `types/index.ts` or `types/specific-type.ts`

### Constants
- **File**: `lib/constants/name.ts`
- **Export**: UPPER_SNAKE_CASE for arrays/objects (e.g., `TOOLS`, `CATEGORIES`)

### Stores (Zustand)
- **File**: `lib/stores/name-store.ts`
- **Hook**: `useName` (e.g., `useSearchStore`)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Theme**: next-themes
- **Package Manager**: pnpm

## 🎨 Design Principles

1. **Minimal & Professional**: Clean, modern interface inspired by shadcn.com
2. **Responsive**: Mobile-first design approach
3. **Accessible**: WCAG compliant components
4. **Performant**: Optimized animations and lazy loading
5. **Dark Mode**: Full dark/light theme support

## 📝 Adding a New Tool

1. **Create the tool page**:
   ```bash
   mkdir -p app/tools/new-tool
   touch app/tools/new-tool/page.tsx
   ```

2. **Add tool to constants** (`lib/constants/tools.ts`):
   ```typescript
   {
     id: 'new-tool',
     name: 'New Tool',
     description: 'Description of the tool',
     category: 'converter', // or 'image', 'text', '3d', 'developer'
     icon: '🔧',
     href: '/tools/new-tool',
     featured: false, // set to true for homepage highlight
   }
   ```

3. **Create the page component**:
   ```typescript
   "use client";
   
   import { motion } from "framer-motion";
   import { Card } from "@/components/ui/card";
   
   export default function NewToolPage() {
     return (
       <div className="container py-8 md:py-12 lg:py-16">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           {/* Tool content */}
         </motion.div>
       </div>
     );
   }
   ```

4. **Add tool-specific components** (if needed):
   ```bash
   touch components/tools/new-tool-component.tsx
   ```

## 🎭 Animation Guidelines

- Use `framer-motion` for all animations
- Standard page transition: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- Card hover: `whileHover={{ y: -4, scale: 1.02 }}`
- Button tap: `whileTap={{ scale: 0.98 }}`
- Stagger children with `staggerChildren: 0.1`

## 🎨 Color Scheme

The project uses Tailwind CSS with shadcn/ui theming:
- Primary: Blue to Purple gradient
- Background: Adaptive (light/dark)
- Muted: For secondary text
- Border: Subtle borders with hover effects

## 📦 Available Scripts

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Add shadcn/ui component
pnpm dlx shadcn@latest add [component-name]
```

## 🔧 Configuration Files

- `components.json`: shadcn/ui configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `next.config.ts`: Next.js configuration

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://zustand-demo.pmnd.rs)

