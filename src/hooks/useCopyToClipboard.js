import { useState, useCallback } from 'react';
import { copyToClipboard as vscodeCopy } from '../vscodeApi';

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
        // vscodeCopy (from vscodeApi.js) already includes a textarea fallback,
        // so no duplicate fallback is needed here.
        const success = await vscodeCopy(text);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), resetDelay);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
      }
    },
    [resetDelay]
  );

  return { copied, copyToClipboard };
}
