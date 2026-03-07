import { useLeaferEditor } from '../../../../../index';

const editor = useLeaferEditor();

let accepts = editor.options.imageFileTypes || []
if (!accepts || accepts.length === 0) {
    accepts = ['.png', '.jpg', '.jpeg']
}
export const handleUpload = (f: File) => {
    return editor.options.uploadImageCallback!(f, 'ImageFill')
}

export const onSuccess = (data: any) => {
    console.log('onSuccess', data);
}
export const onError = (errorr: Error) => {
    console.log('onError', errorr);
}
export const onDelete = () => {
    console.log('onRemove');
}
export const accept = accepts.join(',')
export const maxImageSize = editor.options.maxImageSize

