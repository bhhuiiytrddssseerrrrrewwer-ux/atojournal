import React, { useRef } from 'react';

type View = 'dashboard' | 'calendar' | 'journal' | 'analytics' | 'settings';

interface TopNavProps {
  activeView: View;
  onChangeView: (view: View) => void;
  onUploadFiles: (files: FileList) => void;
  isUploading: boolean;
  progress: number;
}

const TopNav: React.FC<TopNavProps> = ({ activeView, onChangeView, onUploadFiles, isUploading, progress }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const Link: React.FC<{ view: View; label: string } > = ({ view, label }) => (
    <button
      aria-current={activeView === view ? 'page' : undefined}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === view ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
      onClick={() => onChangeView(view)}
    >
      {label}
    </button>
  );

  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur bg-gray-900/80 border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-white font-semibold">Auto Trading Journal</div>
          <nav className="hidden md:flex items-center space-x-1">
            <Link view="dashboard" label="Dashboard" />
            <Link view="calendar" label="Calendar" />
            <Link view="journal" label="Journal" />
            <Link view="analytics" label="Analytics" />
            <Link view="settings" label="Settings" />
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="px-3 py-2 text-sm rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700"
            aria-label="Toggle theme"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            Theme
          </button>
          <button
            onClick={triggerFilePicker}
            className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
            disabled={isUploading}
          >
            {isUploading ? `Uploading ${Math.round(progress)}%` : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.csv"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUploadFiles(e.target.files);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopNav;


