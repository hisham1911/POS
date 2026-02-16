# KasserPro Client

React + TypeScript frontend for KasserPro POS system.

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Redux Toolkit** - State Management
- **RTK Query** - Data Fetching & Caching
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Vite** - Build Tool

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/           # RTK Query API definitions
├── components/    # Reusable UI components
│   ├── common/    # Generic components (Button, Input, etc.)
│   ├── layout/    # Layout components
│   ├── pos/       # POS-specific components
│   └── ...
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── store/         # Redux store configuration
│   └── slices/    # Redux slices
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=KasserPro
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
