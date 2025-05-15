import { FaFile, FaFilePdf, FaFileWord, FaFileAlt, FaImage, FaTrash, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FileCard = ({ file, onDelete }) => {
  // Helper to determine file icon based on mimetype
  const getFileIcon = (mimetype) => {
    switch (mimetype) {
      case 'application/pdf':
        return <FaFilePdf className="h-6 w-6 text-red-500" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FaFileWord className="h-6 w-6 text-blue-500" />;
      case 'text/plain':
        return <FaFileAlt className="h-6 w-6 text-gray-500" />;
      case 'image/jpeg':
      case 'image/png':
        return <FaImage className="h-6 w-6 text-green-500" />;
      default:
        return <FaFile className="h-6 w-6 text-gray-500" />;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center">
          {getFileIcon(file.mimetype)}
          <div className="ml-3 flex-1 truncate">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white truncate">{file.originalname}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Uploaded: {formatDate(file.createdAt)}</p>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between">
        <Link 
          to={`/files/${file._id}`}
          className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-100 dark:bg-primary-800 dark:hover:bg-primary-700"
        >
          <FaEye className="mr-1" /> View
        </Link>
        <button
          onClick={() => onDelete(file._id)}
          className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-100 dark:bg-red-800 dark:hover:bg-red-700"
        >
          <FaTrash className="mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};

export default FileCard; 