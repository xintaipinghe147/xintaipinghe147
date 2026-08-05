import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractHeadings } from "@/lib/utils";

export default function MarkdownView({ content }: { content: string }) {
  const headings = extractHeadings(content);
  let headingIndex = 0;

  const headingId = () => {
    const h = headings[headingIndex];
    headingIndex += 1;
    return h?.id ?? "";
  };

  return (
    <div className="prose-blog">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: (props) => <h2 id={headingId()} {...props} />,
          h3: (props) => <h3 id={headingId()} {...props} />,
          h4: (props) => <h4 id={headingId()} {...props} />,
          a: (props) => <a target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
