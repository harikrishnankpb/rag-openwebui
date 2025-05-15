# RAG Chat Frontend

A modern React-based frontend for the RAG Chat application, providing:
- Chat interface with Ollama models including DeepSeek Coder
- RAG-based responses with document retrieval 
- File management system with upload, view, and search capabilities
- Full text extraction and vector search integration

## Prerequisites

- Node.js (v16+)
- Backend server running (see main README)

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

This will start the frontend on port 3001 with proxy to backend on port 3000.

## Features

### Chat Interface
- Create new chats
- Choose Ollama models
- Toggle RAG mode on/off
- View relevant document sources
- Rich markdown and code formatting

### File Management
- Upload various file types (PDF, DOCX, TXT, images)
- View file details and extracted content
- Search across file contents
- Delete files

## Configuration

The frontend connects to the backend via proxy configuration in `vite.config.js`. If your backend is running on a different port, update the proxy settings accordingly.

## Building for Production

To build the frontend for production:

```bash
npm run build
```

This will create optimized production files in the `dist` directory.

## Technologies Used

- React 18
- React Router 6
- Tailwind CSS
- Vite
- Axios for API calls
- React Markdown for content rendering 