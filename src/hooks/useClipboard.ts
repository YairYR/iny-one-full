'use client';

import { useState } from "react"

const useClipboard = () => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error('Error copying to clipboard:', err);
          }
    }

    return {
        copied,
        copyToClipboard,
    }
}

export default useClipboard;