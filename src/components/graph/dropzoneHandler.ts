import {PictureUploadAction} from "./graphState";
import {XYPosition} from "react-flow-renderer";

export function handleDropzoneFile(file: File, position: XYPosition, dispatch: (action: PictureUploadAction) => void) {
  dispatch({
    type: 'pictureUploadStart',
    position: position,
  })
  const reader = new FileReader();
  reader.addEventListener("error", function () {
    dispatch({
      type: 'pictureUploadFinished',
      error: reader.error || new Error('unknown error when uploading file'),
    })
  })
  reader.addEventListener("abort", function () {
    dispatch({
      type: 'pictureUploadFinished',
      error: reader.error || new Error('file upload aborted'),
    })
  })
  reader.addEventListener("load", function () {
    const result = reader.result
    if (result !== null && !(result instanceof ArrayBuffer)) {
      dispatch({
        type: 'pictureUploadFinished',
        url: result as string,
      })
    } else {
      console.error("reader result is not string", typeof result);
      dispatch({
        type: 'pictureUploadFinished',
        error: reader.error || new Error('file upload aborted'),
      })
    }
  })
  reader.readAsDataURL(file);
}
