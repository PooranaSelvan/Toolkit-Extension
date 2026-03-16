import { useState, useCallback } from 'react';
import { copyToClipboard as vscodeCopy, isVsCodeWebview } from '../vscodeApi';

/**
 * Custom hook for clipboard operations with feedback state.
 * Uses VS Code clipboard API when running inside webview.
 *
 * @param {number} resetDelay - ms before resetting copied state (default: 2000)
 * @returns {{ copied: boolean, copyToClipboard: Function }}
 */
export default function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text) => {
      try {
        const success = await vscodeCopy(text);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), resetDelay);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), resetDelay);
          return true;
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
          return false;
        }
      }
    },
    [resetDelay]
  );

  return { copied, copyToClipboard };
}
