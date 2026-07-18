import { renderRichText } from "@/lib/rich-text";

export function RichText({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content.trim()) {
    return null;
  }

  return (
    <div className={className ? `rich-text ${className}` : "rich-text"}>
      {renderRichText(content)}
    </div>
  );
}
