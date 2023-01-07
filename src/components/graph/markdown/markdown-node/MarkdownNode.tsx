import {Markdown} from "../Markdown";
import './MarkdownNode.css';
import {useState} from "react";
import {CustomNodeProps} from "../../customNodeProps";

export interface MarkdownData {
  content: string;
}

export function MarkdownNode({data: {content}}: CustomNodeProps<MarkdownData>) {

  const trimmedContent = content.trim();
  const shortContent = trimmedContent.split("\n", 2)[0];

  const alwaysExpanded = shortContent === trimmedContent;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className={'markdown-node-container'}>
        <Markdown content={isExpanded ? trimmedContent : shortContent}></Markdown>
        {
          alwaysExpanded ? null : (
            (isExpanded)
              ? <img className={'collapse-button'} src={'up.svg'} alt={'collapse'} onClick={() => setIsExpanded(false)} />
              : <img className={'expand-button'} src={'down.svg'} alt={'expand'} onClick={() => setIsExpanded(true)} />
          )
        }
      </div>
    </>
  );
}