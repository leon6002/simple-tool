# SimpleTool - Modern Online Utilities

A collection of modern, easy-to-use online tools built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎨 **Modern Design** - Sleek, minimal interface inspired by shadcn.com
- 🌓 **Dark Mode** - Full dark/light theme support with smooth transitions
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Fast** - Optimized with Next.js 16 and Turbopack
- 🎭 **Animated** - Smooth transitions with Framer Motion
- 🔍 **Searchable** - Quick search and category filtering
- ♿ **Accessible** - WCAG compliant components
- 🎯 **Type Safe** - Full TypeScript coverage

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd simple-tool

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

## 📦 Available Tools

### ✅ Implemented
- **Hex Calculator** - Convert between hexadecimal, decimal, binary, and octal

### 🚧 Coming Soon
- **Image Converter** - Convert between JPG, PNG, WebP formats
- **OCR Tool** - Extract text from images
- **3D Model Viewer** - View and interact with 3D models
- **Text Utilities** - Base64, hash generation, and more

## 📁 Project Structure

```
simple-tool/
├── app/                    # Next.js App Router
│   ├── tools/             # Tool pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── layout/            # Layout components
│   ├── tools/             # Tool components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── constants/         # App constants
│   ├── stores/            # Zustand stores
│   └── utils.ts           # Utilities
└── types/                 # TypeScript types
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

## 🎯 Adding a New Tool

1. Create a new page in `app/tools/[tool-name]/page.tsx`
2. Add tool definition to `lib/constants/tools.ts`
3. Implement the tool functionality
4. Add to navigation automatically via the tools array

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed guidelines.

## 🎨 Design System

- **Colors**: Blue to Purple gradient for primary actions
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: Based on shadcn/ui with custom styling
- **Animations**: Consistent motion design with Framer Motion

## 📝 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vercel](https://vercel.com/) - Deployment platform

## 📚 Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Detailed implementation notes
- [Project Structure](./PROJECT_STRUCTURE.md) - Architecture and guidelines

---

Built with ❤️ using Next.js 16
