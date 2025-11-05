

# 🛠️ SimpleTool - Modern Online Utilities

A collection of modern, easy-to-use online tools built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**, featuring a sleek interface powered by **shadcn/ui**.

-----

## ✨ Key Features

  * **Modern UI/UX**: Sleek, minimal design inspired by shadcn/ui.
  * **Theming**: Full **Dark/Light** mode support with smooth transitions.
  * **Performance**: Optimized with **Next.js 16** and Turbopack for speed.
  * **Animations**: Smooth interactions using **Framer Motion**.
  * **Responsiveness**: Flawless display on **mobile, tablet, and desktop**.
  * **Accessibility**: Components aim for **WCAG compliance**.

-----

## 🚀 Tech Stack

| Category             | Technology              | Link                                            |
| :------------------- | :---------------------- | :---------------------------------------------- |
| **Framework**        | Next.js 16 (App Router) | [Next.js](https://nextjs.org/)                  |
| **Language**         | TypeScript              | [TypeScript](https://www.typescriptlang.org/)   |
| **Styling**          | Tailwind CSS v4         | [Tailwind CSS](https://tailwindcss.com/)        |
| **UI Components**    | shadcn/ui               | [shadcn/ui](https://ui.shadcn.com/)             |
| **State Management** | Zustand                 | [Zustand](https://zustand-demo.pmnd.rs/)        |
| **Animations**       | Framer Motion           | [Framer Motion](https://www.framer.com/motion/) |
| **Package Manager**  | pnpm (recommended)      | [pnpm](https://pnpm.io/)                        |

-----

## 🔧 Getting Started (Development)

### Prerequisites

  * Node.js 18+
  * **pnpm** (recommended package manager)

### Installation & Running

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd simple-tool

# 2. Install dependencies
pnpm install

# 3. Run development server
pnpm dev
```

Open **http://localhost:3000** to view the application.

### Production Build

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

-----

## 📦 Available Tools

The project currently implements the following utilities:

  * **Hex Calculator**: Convert between **Hexadecimal, Decimal, Binary, and Octal**.
  * *More tools are planned in the **Future Enhancements** section.*

-----

## 🏠 Homepage & UI Overview

The main page features a clean layout for discovering tools:

  * **Hero Section**: Gradient title ("Modern Online Tools") with smooth animations.
  * **Category Filtering**: Interactive badge filters (e.g., **Converters, Image Tools, Text Tools**).
  * **Tool Cards**: Responsive grid displaying tool icons, names, and descriptions with engaging hover effects (lift, scale).
  * **Navigation Bar**: Sticky header with a global **Search Bar** and **Theme Toggle**.

-----

## ⚙️ Project Structure & Guidelines

This section outlines the project architecture for contributors.

### Folder Structure

```
simple-tool/
├── app/                    # Next.js App Router
│   ├── tools/              # Tool pages (e.g., hex-converter)
│   ├── layout.tsx
│   └── page.tsx            # Homepage
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── tools/              # Tool-specific components
│   └── ui/                 # Custom shadcn/ui components
├── lib/
│   ├── constants/          # Tool definitions, constants
│   ├── stores/             # Zustand state management
│   └── utils.ts
└── types/                  # TypeScript definitions
```

### Adding a New Tool

1.  Create a new folder in `app/tools/` (e.g., `app/tools/new-tool/page.tsx`).
2.  Add the tool definition to `lib/constants/tools.ts`.
3.  Implement the tool logic and UI components within `components/tools/`.

-----

## 🚢 Deployment & Operations Guide

### ⬇️ Docker Deployment (Recommended)

To deploy the application using Docker:

1.  **Build Image**:
    ```bash
    docker build -t simple-tool:latest .
    ```
2.  **Run Container**:
    ```bash
    docker run -d --name simple-tool -p 3000:3000 simple-tool:latest
    ```
    *For production, it is highly recommended to use a **Docker Compose** setup, especially for managing environment variables and Nginx reverse proxy.*

### 🔐 Environment Variables

Sensitive configurations (like **AUTH\_SECRET**) must be managed via environment variables, not hardcoded.

```env
# Example for .env.production
AUTH_SECRET=your-random-production-secret-key
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### ⚠️ Fixing `UntrustedHost` Error

If you encounter the `UntrustedHost` error during authentication after deployment:

  * **Ensure `AUTH_TRUST_HOST` is set to `true`** in your container's environment variables.
  * Set the correct **`NEXTAUTH_URL`** to your public domain (e.g., `https://yourdomain.com`).

-----

## 🔮 Future Enhancements

  * [ ] User accounts and favorites
  * [ ] Tool usage history
  * [ ] Keyboard shortcuts
  * [ ] PWA support (Offline mode)
  * [ ] More tools (QR Code generator, Color Picker, JSON Formatter, etc.)

-----

## 📜 License & Acknowledgments

Licensed under the **MIT License**.

Thanks to the creators of **Next.js**, **shadcn/ui**, **Tailwind CSS**, and **Zustand** for making this project possible.
