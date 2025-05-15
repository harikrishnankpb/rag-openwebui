import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaDownload, FaTrash, FaArrowLeft } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fileApi } from '../utils/api';

const FileDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFile();
  }, [id]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fileApi.getFileById(id);
      setFile(response.data.file);
      
      // If file has extractable content, load it
      if (['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(response.data.file.mimetype)) {
        fetchContent();
      }
    } catch (err) {
      console.error('Error fetching file:', err);
      setError('Failed to load file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      setContentLoading(true);
      const response = await fileApi.getFileContent(id);
      setContent(response.data.content);
    } catch (err) {
      console.error('Error fetching file content:', err);
      // Don't set error for content - just show it's not available
    } finally {
      setContentLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await fileApi.deleteFile(id);
      navigate('/files');
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Helper to determine file type label
  const getFileTypeLabel = (mimetype) => {
    switch (mimetype) {
      case 'application/pdf':
        return 'PDF Document';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'Word Document';
      case 'text/plain':
        return 'Text File';
      case 'image/jpeg':
        return 'JPEG Image';
      case 'image/png':
        return 'PNG Image';
      default:
        return 'File';
    }
  };

  // Check if file is an image
  const isImage = (mimetype) => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimetype);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
        <button
          onClick={() => navigate('/files')}
          className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
        >
          <FaArrowLeft className="mr-1" /> Back to Files
        </button>
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* File header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/files')}
            className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {file.originalname}
          </h1>
        </div>
        <div className="flex space-x-2">
          <a
            href={`/uploads/${file.filename}`}
            download={file.originalname}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
          >
            <FaDownload className="mr-2" /> Download
          </a>
          <button
            onClick={handleDeleteFile}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            <FaTrash className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* File metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">File Information</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">File Type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{getFileTypeLabel(file.mimetype)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Size</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatFileSize(file.size)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(file.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">MIME Type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{file.mimetype}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* File preview/content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">File Content</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {/* Image preview */}
          {isImage(file.mimetype) ? (
            <div className="flex justify-center">
              <img
                src={`/uploads/${file.filename}`}
                alt={file.originalname}
                className="max-w-full h-auto max-h-96 rounded-md"
              />
            </div>
          ) : contentLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : content ? (
            <div className="markdown-content bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-auto max-h-96">
              <ReactMarkdown
                children={content}
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, '')}
                        style={dracula}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.mimetype)
                  ? 'No content could be extracted from this file.'
                  : 'Content preview is not available for this file type.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDetailPage;