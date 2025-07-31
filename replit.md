# Markdown Editor Application

## Overview

This is a web-based markdown editor application built with React and Express.js. The application provides a clean interface for editing markdown files with features like real-time syntax highlighting, file operations (load/save), undo/redo functionality, and word count tracking. The editor uses Monaco Editor for the text editing experience and includes drag-and-drop file support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Monaco Editor** for the markdown editing experience with syntax highlighting
- **Wouter** for client-side routing (lightweight React router)
- **TanStack Query** for state management and API interactions
- **Tailwind CSS** with **shadcn/ui** component library for styling

### Backend Architecture
- **Express.js** server with TypeScript
- **Node.js** runtime environment
- RESTful API structure (currently minimal, ready for expansion)
- In-memory storage implementation with interface for easy database migration

### UI Component System
- **shadcn/ui** components built on **Radix UI** primitives
- Comprehensive component library including forms, dialogs, tooltips, etc.
- Consistent design system with CSS variables for theming
- Mobile-responsive design considerations

## Key Components

### Editor Components
- **MarkdownEditor**: Monaco Editor wrapper with markdown syntax highlighting and custom theme
- **EditorToolbar**: Toolbar with formatting buttons and editing controls (bold, italic, code, etc.)
- **FileOperations**: File load/save functionality with local file system integration
- **useEditor hook**: Custom hook managing editor state, history, and file operations

### Database Layer
- **Drizzle ORM** configured for PostgreSQL
- **Neon Database** serverless PostgreSQL integration
- User schema defined with id, username, and password fields
- Memory storage implementation for development/testing

### State Management
- Local component state for editor content and UI
- History management for undo/redo functionality
- TanStack Query for server state management (prepared for future API calls)

## Data Flow

1. **Editor Interaction**: User types in Monaco Editor → Content updates trigger onChange → History tracking for undo/redo
2. **File Operations**: Load file → Read file content → Update editor content OR Save content → Create downloadable file
3. **Drag & Drop**: File dropped → Validate file type → Read content → Update editor
4. **API Ready**: Frontend configured with query client for future backend integration

## External Dependencies

### Core Framework Dependencies
- React ecosystem: react, react-dom, @vitejs/plugin-react
- Monaco Editor: monaco-editor for code editing experience
- Routing: wouter for lightweight routing

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible component foundation
- Lucide React for consistent iconography
- Class Variance Authority for component variant management

### Development Tools
- TypeScript for type safety
- ESBuild for production bundling
- PostCSS with Autoprefixer for CSS processing

### Database and Backend
- Drizzle ORM with PostgreSQL dialect
- Neon Database serverless driver
- Express.js with middleware for JSON parsing and logging

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend development
- tsx for running TypeScript server directly
- Drizzle Kit for database schema management and migrations

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild bundles Express server to `dist/index.js`
- Single-command build process creates both frontend and backend artifacts

### Database Management
- Environment variable `DATABASE_URL` required for database connection
- Drizzle migrations stored in `./migrations` directory
- Schema-first approach with TypeScript types generated from database schema

### Hosting Considerations
- Static frontend can be served from any CDN or static hosting
- Node.js server can be deployed to any platform supporting Express.js
- PostgreSQL database can be hosted on Neon or any PostgreSQL provider
- Environment variables needed: `DATABASE_URL`, `NODE_ENV`

The application is structured for easy deployment to platforms like Replit, Vercel, Netlify, or traditional VPS hosting, with clear separation between client and server build outputs.