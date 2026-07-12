import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface TypewriterMarkdownProps {
  content: string;
  isLatest: boolean;
  onComplete?: () => void;
  components?: any;
}

export function TypewriterMarkdown({ content, isLatest, onComplete, components }: TypewriterMarkdownProps) {
  // If this is an older message, we don't want to type it; render instantly
  const [displayedText, setDisplayedText] = useState(() => (isLatest ? "" : content));
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(content);
      return;
    }

    // Guard to prevent multiple concurrent typing loops if component re-renders
    if (hasStarted.current) return;
    hasStarted.current = true;

    setDisplayedText("");
    
    // Split into words and whitespace to preserve token syntax perfectly
    const tokens = content.split(/(\s+)/);
    let currentTokenIndex = 0;
    let timer: NodeJS.Timeout;

    const typeNextToken = () => {
      if (currentTokenIndex >= tokens.length) {
        setDisplayedText(content);
        if (onComplete) onComplete();
        return;
      }

      currentTokenIndex++;
      setDisplayedText(tokens.slice(0, currentTokenIndex).join(""));
      
      // Speed factor: 10ms for a snappy but highly visible typewriter feel
      timer = setTimeout(typeNextToken, 10);
    };

    typeNextToken();

    return () => {
      clearTimeout(timer);
    };
  }, [content, isLatest, onComplete]);

  return (
    <ReactMarkdown components={components}>
      {displayedText}
    </ReactMarkdown>
  );
}
