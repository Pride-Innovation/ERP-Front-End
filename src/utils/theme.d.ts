/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * MUI theme augmentation — extends the palette with our design tokens so
 * `theme.palette.brand[500]`, `theme.palette.surface.muted`, etc. are typed.
 */

import { Palette, PaletteOptions } from '@mui/material/styles';
import { brand, gold, border, surface } from './tokens';

declare module '@mui/material/styles' {
    interface BrandPaletteColor {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    }

    interface SurfacePaletteColor {
        page: string;
        card: string;
        muted: string;
        subtle: string;
        inverse: string;
    }

    interface BorderPaletteColor {
        subtle: string;
        default: string;
        strong: string;
    }

    interface Palette {
        brand: BrandPaletteColor;
        gold: BrandPaletteColor;
        surface: SurfacePaletteColor;
        border: BorderPaletteColor;
    }

    interface PaletteOptions {
        brand?: Partial<BrandPaletteColor>;
        gold?: Partial<BrandPaletteColor>;
        surface?: Partial<SurfacePaletteColor>;
        border?: Partial<BorderPaletteColor>;
    }
}

// Silence "unused import" — these are used by the declaration only.
type _Touch = typeof brand | typeof gold | typeof border | typeof surface | Palette | PaletteOptions;
export type {};
