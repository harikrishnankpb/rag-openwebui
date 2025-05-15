import { useState, useEffect, useRef } from 'react';
import { FaUpload, FaFile, FaSearch } from 'react-icons/fa';
import FileCard from '../components/FileCard';
import { fileApi } from '../utils/api';

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fileApi.getAllFiles();
      setFiles(response.data.files || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadError(null);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fileApi.uploadFile(formData);
      setFiles([response.data.file, ...files]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError('Failed to upload file. Please try again.');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await fileApi.deleteFile(fileId);
      setFiles(files.filter(file => file._id !== fileId));
      
      // Clear search results if they exist
      if (searchResults) {
        setSearchResults(searchResults.filter(result => result.id !== fileId));
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      setError(null);
      const response = await fileApi.searchFiles(searchQuery);
      setSearchResults(response.data.results || []);
    } catch (err) {
      console.error('Error searching files:', err);
      setError('Failed to search files. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Files</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex rounded-md shadow-sm w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="flex-1 rounded-l-md border-r-0 border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || searching}
              className={`inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 text-gray-500 ${
                !searchQuery.trim() || searching
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-gray-50 hover:bg-gray-100'
              } focus:outline-none dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200`}
            >
              {searching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
              ) : (
                <FaSearch />
              )}
            </button>
          </form>
          
          {/* Upload button */}
          <div>
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none cursor-pointer"
            >
              <FaUpload className="mr-2" /> Upload File
            </label>
          </div>
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{uploadError}</span>
        </div>
      )}

      {/* Search results */}
      {searchResults && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Search results for "{searchQuery}"
            </h2>
            <button
              onClick={clearSearch}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Clear search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No files found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result) => (
                <div key={result.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {result.file.filename}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Similarity: {(result.similarity * 100).toFixed(1)}%
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{result.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* File listing */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <FaFile className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading a file.</p>
          <div className="mt-6">
            <label
              htmlFor="file-upload-empty"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none cursor-pointer"
            >
              <FaUpload className="mr-2" /> Upload File
            </label>
            <input
              id="file-upload-empty"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <FileCard 
              key={file._id} 
              file={file} 
              onDelete={handleDeleteFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesPage; 