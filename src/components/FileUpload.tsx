import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: FileList) => void;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isUploading,
  progress,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearError = () => {
    // This would need to be passed down from parent or handled in context
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Upload size={20} />
          <span>{isUploading ? 'Uploading...' : 'Upload MetaTrader Statement'}</span>
        </button>
      </div>
      
      {/* Progress Bar */}
      {isUploading && (
        <div>
          <div className="bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">Processing files...</p>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button
            onClick={handleClearError}
            className="text-red-400 hover:text-red-200 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
