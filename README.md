# RAG Chat Application with Ollama and ChromaDB

A full-stack RAG (Retrieval Augmented Generation) application allowing users to:
- Upload, manage, and search documents (PDF, DOCX, TXT)
- Chat with Ollama models with DeepSeek Coder as the default model
- Use document knowledge to enhance chat responses with RAG
- Manage documents and conversations in a user-friendly interface

## Project Structure

```
rag-openwebui/
├── backend/           # Backend Node.js application
│   ├── src/           # Source code
│   ├── uploads/       # Uploaded files directory
│   └── package.json   # Backend dependencies
├── frontend/          # React frontend application
│   ├── public/        # Public assets
│   ├── src/           # Source code
│   └── package.json   # Frontend dependencies
└── package.json       # Root package.json with scripts
```

## Features

### Backend
- Upload files (PDF, DOCX, TXT, JPEG, PNG)
- List all uploaded files
- Delete files
- Extract text content from files (PDF, DOCX, TXT)
- Vector storage with ChromaDB
- Ollama integration for LLM access
- RAG capabilities for enhanced responses

### Frontend
- Modern React UI with Tailwind CSS
- Chat interface with conversation history
- File management system
- Document content viewer
- Vector search capabilities
- Light/dark mode support

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote)
- ChromaDB (running on localhost:8000)
- Ollama (running on localhost:11434 with DeepSeek Coder model)

## Getting Started

### Installing Ollama

1. Download and install Ollama from [https://ollama.com/](https://ollama.com/)
2. Pull the DeepSeek Coder model:
   ```bash
   ollama pull deepseek-coder
   ```

### Installing ChromaDB

Using Docker:
```bash
docker run -p 8000:8000 chromadb/chroma
```

Or install locally following [ChromaDB documentation](https://docs.trychroma.com/getting-started)

### Setting up the application

1. Clone the repository
```bash
git clone <repository-url>
cd rag-openwebui
```

2. Install all dependencies
```bash
npm run install:all
```

3. Configure environment variables:
   - Backend `.env` is already set up in the backend directory
   - You can modify settings as needed in `backend/.env`

## Running the Application

### Development mode (backend and frontend)
```bash
npm run dev:full
```

This will start:
- Backend on http://localhost:3000
- Frontend on http://localhost:3001

### Backend only
```bash
npm run backend:dev
```

### Frontend only
```bash
npm run frontend:dev
```

## API Endpoints

### Chat API
- `GET /api/chat` - List all chats
- `POST /api/chat` - Create a new chat
- `GET /api/chat/:id` - Get a specific chat
- `PUT /api/chat/:id` - Update chat settings
- `DELETE /api/chat/:id` - Delete a chat
- `POST /api/chat/:id/messages` - Send a message and get AI response
- `GET /api/chat/models` - List available Ollama models

### File API
- `POST /api/files/upload` - Upload a file
- `GET /api/files` - List all files
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete a file
- `GET /api/files/:id/content` - Get extracted content
- `GET /api/files/search` - Search for similar content across files

## Future Enhancements

- Authentication and authorization
- Improved vector search capabilities
- File content chunking for better RAG performance
- Support for more file types
- User-specific file management

## License

ISC 