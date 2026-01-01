'use client';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  singleLine?: boolean;
}

export default function RichTextDisplay({
  content,
  className = '',
  singleLine = false,
}: RichTextDisplayProps) {
  if (!content) {
    return <p className={`text-sm text-zinc-500 dark:text-zinc-400 ${className}`}>No content</p>;
  }

  // If singleLine is true, extract text content and join all lines into one
  if (singleLine) {
    // Create a temporary element to parse HTML and extract text
    const temp = document.createElement('div');
    temp.innerHTML = content;
    const textContent = temp.innerText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join(' ');

    return (
      <span className={`text-sm text-zinc-900 dark:text-zinc-50 ${className}`}>
        {textContent || 'No content'}
      </span>
    );
  }

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert
        prose-p:m-0 prose-p:mb-2 prose-p:text-zinc-900 prose-p:dark:text-zinc-50
        prose-strong:font-bold prose-strong:text-zinc-900 prose-strong:dark:text-zinc-50
        prose-em:italic prose-em:text-zinc-900 prose-em:dark:text-zinc-50
        prose-ul:my-2 prose-ul:pl-4 prose-ul:text-zinc-900 prose-ul:dark:text-zinc-50
        prose-ol:my-2 prose-ol:pl-4 prose-ol:text-zinc-900 prose-ol:dark:text-zinc-50
        prose-li:m-0 prose-li:text-zinc-900 prose-li:dark:text-zinc-50
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
