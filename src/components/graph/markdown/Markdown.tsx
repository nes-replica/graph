import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown(props: {content: string}) {
  return <ReactMarkdown children={props.content} remarkPlugins={[remarkGfm]} />
}