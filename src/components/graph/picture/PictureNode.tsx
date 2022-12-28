import './style.css';
import {ResizableBox, ResizeCallbackData} from "react-resizable";
import * as React from "react";
import {useEffect, useState} from "react";
import {CustomNodeProps} from "../customNodeProps";

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

export type PictureNodeProps = CustomNodeProps<PictureData> & Resizable

export function PictureNode(props: PictureNodeProps) {
  const {
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
  } = props

  const shiftHeld = useShiftHandler();

  return (
    <div className={'picture-node-container'}>
      {onResize ? (
        <ResizableBox width={preview_width} height={preview_height}
                      onResize={(e: React.SyntheticEvent, data: ResizeCallbackData) => {
                        onResize(id, data.size.width, data.size.height);
                      }}
                      lockAspectRatio={shiftHeld}
                      handle={<div className="handle rf-no-drag"/>}>
          <img alt={description} src={picture_url} width={preview_width} height={preview_height}/>
        </ResizableBox>
      ) : (
        <img alt={description} src={picture_url} width={preview_width} height={preview_height}/>
      )}
    </div>
  );
}