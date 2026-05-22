/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Grid } from '@mui/material';

export interface IFormGridProps {
    /** Grid spacing — defaults to 3 (24px), the project's form rhythm. */
    spacing?: number;
    children: ReactNode;
}

/**
 * Form layout primitive. Wraps a `<Grid container>` with consistent spacing.
 *
 *   <FormGrid>
 *     <FormRow><InputComponent label="Name" .../></FormRow>
 *     <FormRow><InputComponent label="Email" .../></FormRow>
 *     <FormRow span="full"><InputComponent label="Notes" multiline .../></FormRow>
 *   </FormGrid>
 */
export const FormGrid = ({ spacing = 3, children }: IFormGridProps) => (
    <Grid container spacing={spacing}>
        {children}
    </Grid>
);

export interface IFormRowProps {
    /**
     * Field width on `md` screens and up. Defaults to `half` (the project's
     * two-column form layout). Mobile is always full-width.
     *
     * - `quarter` — 3/12 (four-up)
     * - `third`   — 4/12 (three-up)
     * - `half`    — 6/12 (default, two-up)
     * - `twoThirds` — 8/12 (asymmetric pair)
     * - `full`    — 12/12 (one per row)
     */
    span?: 'quarter' | 'third' | 'half' | 'twoThirds' | 'full';
    children: ReactNode;
}

const SPAN_TO_MD: Record<NonNullable<IFormRowProps['span']>, number> = {
    quarter:   3,
    third:     4,
    half:      6,
    twoThirds: 8,
    full:      12,
};

/** A field cell inside a `<FormGrid>`. Mobile = full row; `md+` = sized via `span`. */
export const FormRow = ({ span = 'half', children }: IFormRowProps) => (
    <Grid item xs={12} md={SPAN_TO_MD[span]}>
        {children}
    </Grid>
);

export default FormGrid;
