import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
    zIndex: 10
});

export default function InputFileUpload({
    inputRef,
    handleFileUpload
}: {
    inputRef: React.Ref<HTMLInputElement>;
    handleFileUpload: (files: FileList | null) => void
}) {
    return (
        <VisuallyHiddenInput
            ref={inputRef}
            type="file"
            onChange={(event) => handleFileUpload(event.target.files)}
            multiple
        />
    );
}
