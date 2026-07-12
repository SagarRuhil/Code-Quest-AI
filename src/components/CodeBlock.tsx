import React, { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import { Copy, Check } from "lucide-react";

// Ensure Tomorrow theme is loaded
import "prismjs/themes/prism-tomorrow.css";

// Set Prism globally so component plugins can attach correctly
if (typeof window !== "undefined") {
  (window as any).Prism = Prism;
}

// Dynamically load languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const language = className ? className.replace("language-", "") : "text";

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [children, language]);

  const handleCopy = async () => {
    const text = codeRef.current?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative group/code my-6 border border-slate-800 rounded-xl overflow-hidden shadow-lg bg-slate-950">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase select-none">
        <span className="text-slate-300 font-semibold tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-sans normal-case font-medium text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover/code:text-white transition-colors" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <pre className={`!p-4 !m-0 !bg-transparent overflow-x-auto language-${language}`}>
        <code
          ref={codeRef}
          className={`language-${language} !text-slate-100 !bg-transparent font-mono text-xs md:text-sm block`}
          style={{ whiteSpace: "pre" }}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}
