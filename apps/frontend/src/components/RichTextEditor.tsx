'use client';

import { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showCharCount?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  showCharCount = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    // Initialize editor content from value prop
    if (editorRef.current && !isFocused && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
      updateCharCount();
    }
  }, [value, isFocused]);

  const updateCharCount = () => {
    if (editorRef.current) {
      // Get text content and remove extra whitespace from empty paragraphs
      const text = editorRef.current.innerText.trim();
      setCharCount(text.length);
    }
  };

  const applyFormat = (command: string, commandValue?: string) => {
    // Ensure editor is focused before applying format
    editorRef.current?.focus();
    
    // Small delay to ensure focus is set
    setTimeout(() => {
      try {
        document.execCommand(command, false, commandValue);
        editorRef.current?.focus();
        handleInput();
      } catch (error) {
        console.error(`Failed to apply ${command}:`, error);
      }
    }, 0);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateCharCount();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Allow paste but preserve formatting
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
    handleInput();
  };

  return (
    <div className={`border border-zinc-300 dark:border-zinc-600 rounded-md overflow-hidden bg-white dark:bg-zinc-950 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('bold');
          }}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('italic');
          }}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('underline');
          }}
          className="h-8 w-8 p-0"
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat('removeFormat');
          }}
          className="h-8 w-8 p-0 text-xs"
          title="Clear Formatting"
        >
          C
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        className={`min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert
          prose-p:m-0 prose-p:mb-2
          prose-ul:my-2 prose-ul:pl-4
          prose-ol:my-2 prose-ol:pl-4
          prose-li:m-0
          prose-strong:font-bold
          prose-em:italic
          text-zinc-900 dark:text-zinc-50
          [&:empty::before]:content-[attr(data-placeholder)]
          [&:empty::before]:text-zinc-400
          [&:empty::before]:dark:text-zinc-500`}
        data-placeholder={placeholder}
      />

      {/* Character count helper */}
      {showCharCount && (
        <div className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-700">
          {charCount} {charCount === 1 ? 'character' : 'characters'}
        </div>
      )}
    </div>
  );
}
