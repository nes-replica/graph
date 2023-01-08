import React, {CSSProperties, FC, useState} from 'react';
import {EdgeProps, getBezierPath, EdgeLabelRenderer} from 'reactflow';
import "./label.css";

export type EditableProps = EdgeProps & {
  inEditMode: boolean;
  onLabelStartEditing: (id: string) => void;
  onLabelUpdate: (id: string, label: string) => void;
}

export const EditableEdge: FC<EditableProps> = ({
                                              id,
                                              sourceX,
                                              sourceY,
                                              targetX,
                                              targetY,
                                              sourcePosition,
                                              targetPosition,
                                              data,
                                              label,
                                              interactionWidth,
                                              onLabelUpdate,
                                              onLabelStartEditing,
                                              inEditMode,
  selected,
                                            }) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const labelText = label || (data && data.label);

  const [editValue, setEditValue] = useState(labelText || '');

  interactionWidth = interactionWidth || 10;

  const labelPositionStyle: CSSProperties = {
    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
  }

  return (
    <>
      <path id={id} className="react-flow__edge-path" d={edgePath}/>
      <path
          d={edgePath}
          fill="none"
          strokeOpacity={0}
          strokeWidth={interactionWidth}
          className="react-flow__edge-interaction"
          style={{pointerEvents: 'all', cursor: 'pointer'}}
          onDoubleClickCapture={() => {
            onLabelStartEditing(id);
          }}
      />
      {(inEditMode) ? (
        <EdgeLabelRenderer>
          <input
            style={labelPositionStyle}
            className="nodrag nopan"
            value={editValue} onChange={(e) => {
              setEditValue(e.target.value);
            }}
            autoFocus={true}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log('update label for', id, editValue);
                onLabelUpdate(id, editValue);
              }
            }}
            onClickCapture={(e) => {
              e.stopPropagation();
            }}
          />
        </EdgeLabelRenderer>
        ) : (
          labelText && <EdgeLabelRenderer>
              <div
                  style={labelPositionStyle}
                  className="label nodrag nopan"
                  onDoubleClickCapture={(e) => {
                    onLabelStartEditing(id);
                    e.stopPropagation();
                    e.preventDefault();
                  }}
              >
                {labelText}
              </div>
          </EdgeLabelRenderer>
        )
      }
    </>
  );
};
