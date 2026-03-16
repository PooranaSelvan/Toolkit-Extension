import { useCallback } from 'react';
import { isVsCodeWebview, saveFile } from '../vscodeApi';

/**
 * Custom hook to trigger file downloads from text content.
 * Uses VS Code save dialog when running inside webview.
 *
 * @returns {{ downloadFile: Function }}
 */
export default function useDownloadFile() {
  const downloadFile = useCallback((content, filename, mimeType = 'text/markdown') => {
    try {
      if (content == null) {
        console.warn('useDownloadFile: No content provided for download.');
        return false;
      }

      // Use VS Code save dialog inside webview
      if (isVsCodeWebview()) {
        saveFile(content, filename);
        return true;
      }

      // Browser fallback
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Download failed:', error?.message || error);
      return false;
    }
  }, []);

  return { downloadFile };
}
