import { useState } from 'react';
import { Trade } from '../types/trade';
import { parseMetaTraderHTML } from '../utils/tradeParser';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const uploadFiles = async (files: FileList): Promise<Trade[]> => {
    if (!files || files.length === 0) {
      throw new Error('No files selected');
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const fileArray = Array.from(files);
      const allTrades: Trade[] = [];
      let processedFiles = 0;

      for (const file of fileArray) {
        try {
          const content = await readFileContent(file);
          const trades = parseMetaTraderHTML(content, file.name);
          allTrades.push(...trades);
          
          processedFiles++;
          setProgress((processedFiles / fileArray.length) * 100);
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          setError(`Error processing ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }

      setIsUploading(false);
      return allTrades;
    } catch (error) {
      setIsUploading(false);
      setError(error instanceof Error ? error.message : 'Upload failed');
      throw error;
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    isUploading,
    progress,
    error,
    uploadFiles,
    reset
  };
};
