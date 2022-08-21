import {NodeProps} from "react-flow-renderer/dist/esm/types/nodes";
import {Markdown} from "../markdown/Markdown";
import './MarkdownNode.css';
import {useState} from "react";

export interface MarkdownData {
  content: string;
}

export function MarkdownNode({data: {content}}: Pick<NodeProps<MarkdownData>, 'data'>) {

  const trimmedContent = content.trim();
  const shortContent = trimmedContent.split("\n", 2)[0];

  const alwaysExpanded = shortContent === trimmedContent;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/*<Handle type="target" position={Position.Top} />*/}
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
      {/*<Handle type="source" position={Position.Bottom} id="a" />*/}
      {/*<Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />*/}
    </>
  );
}