/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
    handleFileUpload,
    accept,
    multiple = true,
}: {
    inputRef: React.Ref<HTMLInputElement>;
    handleFileUpload: (files: FileList | null) => void;
    /** Restricts the OS picker, e.g. ".pdf,.jpg,.png". Omit to accept anything. */
    accept?: string;
    /** Defaults to true to preserve the behaviour of existing callers. */
    multiple?: boolean;
}) {
    return (
        <VisuallyHiddenInput
            ref={inputRef}
            type="file"
            onChange={(event) => handleFileUpload(event.target.files)}
            accept={accept}
            multiple={multiple}
        />
    );
}
