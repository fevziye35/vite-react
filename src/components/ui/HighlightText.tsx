import { cn } from '../../utils/cn';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
  highlightClassName?: string;
}

export function HighlightText({ text, highlight, className, highlightClassName }: HighlightTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => (
        regex.test(part) ? (
          <mark
            key={i}
            className={cn(
              "bg-blue-400/20 text-blue-400 rounded-sm px-0.5 font-bold transition-all animate-search-flash",
              highlightClassName
            )}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </span>
  );
}
