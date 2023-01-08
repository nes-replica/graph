import {CustomNodeProps} from "../customNodeProps";
import './GenericNode.css';
import {useState} from "react";

export interface GenericData {
  content?: any;
}

export function GenericNode({data: {content}}: CustomNodeProps<any>) {
  const contentLines = String(content).split("\n")

  const alwaysExpanded = contentLines.length <= 1;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className={'generic-node-container'}>
        <div>{isExpanded ? contentLines.map(line => (<div>{String(line)}</div>)) : String(content).slice(0, 20)}</div>
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