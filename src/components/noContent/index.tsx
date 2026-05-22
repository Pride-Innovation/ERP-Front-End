/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { alpha, Box, Stack, Typography } from "@mui/material";
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';


interface NoContentProps {
    item: string;
    items: string;
    /**
     * When true, swap the copy/icon to reflect "no matches for the active filters"
     * instead of the default "no records yet" message.
     */
    filtered?: boolean;
}

const NoContent = ({ item, items, filtered = false }: NoContentProps) => {
    const Icon = filtered ? SearchOffOutlinedIcon : FolderOffOutlinedIcon;
    const accent = filtered ? '#08796C' : '#BC892C';
    const title = filtered ? `No ${items} match these filters` : `No ${items} found`;
    const body = filtered
        ? 'Try a different combination, or clear the filters above to see the full list again.'
        : `Get started by creating your first ${item}. It will appear here once added.`;

    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            sx={{ py: 10, px: 4 }}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha(accent, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                }}
            >
                <Icon sx={{ fontSize: 40, color: accent, opacity: 0.8 }} />
            </Box>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    textAlign: 'center',
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    maxWidth: 360,
                    lineHeight: 1.6,
                }}
            >
                {body}
            </Typography>
        </Stack>
    );
};

export default NoContent;
