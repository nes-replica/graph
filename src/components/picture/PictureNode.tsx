import {NodeProps} from "react-flow-renderer/dist/esm/types/nodes";
import './style.css';
import {ResizableBox, ResizeCallbackData} from "react-resizable";
import * as React from "react";
import {useEffect, useState} from "react";

export interface PictureData {
  picture_url: string;
  description?: string;
  preview: {
    width: number,
    height: number
  };
}

function useShiftHandler() {
  const [shiftHeld, setShiftHeld] = useState(false);

  function downHandler({key}: any) {
    if (key === 'Shift') {
      setShiftHeld(true);
    }
  }

  function upHandler({key}: any) {
    if (key === 'Shift') {
      setShiftHeld(false);
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  return shiftHeld;
}

export type OnNodeResize = (id: string, width: number, height: number) => void;

export interface Resizable {
  onResize?: OnNodeResize
}

export type PictureNodeProps = Pick<NodeProps<PictureData>, 'id' | 'data'> & Resizable

export function PictureNode({
                              id,
                              data: {
                                picture_url,
                                description,
                                preview: {
                                  width: preview_width,
                                  height: preview_height
                                }
                              },
                              onResize
                            }: PictureNodeProps) {

  const shiftHeld = useShiftHandler();

  return (
    <div className={'picture-node-container'}>
      {onResize ? (
        <ResizableBox width={preview_width} height={preview_height}
                      onResize={(e: React.SyntheticEvent, data: ResizeCallbackData) => {
                        onResize(id, data.size.width, data.size.height);
                      }}
                      lockAspectRatio={shiftHeld}
                      handle={<div className="handle rf-no-drag"/>}> // FIXME: this is a hack to prevent the handle from being draggable, but it's not working
          <img alt={description} src={picture_url} width={preview_width} height={preview_height}/>
        </ResizableBox>
      ) : (
        <img alt={description} src={picture_url} width={preview_width} height={preview_height}/>
      )}
    </div>
  );
}