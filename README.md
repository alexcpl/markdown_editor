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

### State Management
- Local component state for editor content and UI
- History management for undo/redo functionality

## Data Flow

1. **Editor Interaction**: User types in Monaco Editor → Content updates trigger onChange → History tracking for undo/redo
2. **File Operations**: Load file → Read file content → Update editor content OR Save content → Create downloadable file
3. **Drag & Drop**: File dropped → Validate file type → Read content → Update editor
4. **API Ready**: Frontend configured with query client for future backend integration

The application is structured for easy deployment to platforms like Replit, Vercel, Netlify, or traditional VPS hosting, with clear separation between client and server build outputs.
