/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Design tokens — the single source of truth for visual constants.
 *
 * Use these instead of inlining hex literals in components.
 *
 *  // Good
 *  import { tokens } from 'utils/tokens';
 *  sx={{ color: tokens.color.brand[600] }}
 *
 *  // Better — go through the theme so the value participates in palette modes & overrides
 *  sx={{ color: 'primary.main', bgcolor: 'surface.muted' }}
 *
 * Raw scales (brand/gold/neutral/semantic) describe *what* the colour is.
 * Aliases (text/surface/border) describe *what it's for*. Prefer aliases in product code.
 */

// ── Raw colour scales ──────────────────────────────────────────────────────

/** Pride teal — primary brand colour. 500 is the canonical hex (#08796C). */
export const brand = {
    50:  '#E6F2F0',
    100: '#C2DFDA',
    200: '#9CCCC4',
    300: '#73B8AB',
    400: '#3FA396',
    500: '#08796C', // primary.main
    600: '#06695D',
    700: '#065E54', // primary.dark
    800: '#05544B',
    900: '#03413A',
} as const;

/** Pride gold — secondary brand colour. 500 is the canonical hex (#BC892C). */
export const gold = {
    50:  '#FBF5E8',
    100: '#F5E5BF',
    200: '#EED394',
    300: '#E5C167',
    400: '#D5A946',
    500: '#BC892C', // secondary.main
    600: '#A4762450',
    700: '#9B7024', // secondary.dark
    800: '#7E5A1D',
    900: '#5F4316',
} as const;

/** Cool neutrals tuned for the light theme. Aligns to Tailwind slate. */
export const neutral = {
    0:   '#FFFFFF',
    50:  '#F9FAFB',
    100: '#F3F4F6',
    150: '#EEF1F5',
    200: '#E5E7EB',
    250: '#E5E9F0', // dividers / subtle borders
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
} as const;

/** Semantic status colours. */
export const status = {
    success: { main: '#10B981', soft: '#D1FAE5', strong: '#047857' },
    warning: { main: '#F59E0B', soft: '#FEF3C7', strong: '#B45309' },
    danger:  { main: '#D32F2F', soft: '#FEE2E2', strong: '#991B1B' },
    info:    { main: '#3B82F6', soft: '#DBEAFE', strong: '#1D4ED8' },
} as const;

// ── Semantic aliases (use these in product code) ───────────────────────────

/** Foreground (text/icon) colours. */
export const text = {
    /** Headings and high-emphasis text. */
    heading: neutral[900],
    /** Default body copy. */
    body:    neutral[700],
    /** Secondary/supporting text, captions. */
    muted:   neutral[500],
    /** Disabled or de-emphasized state. */
    subtle:  neutral[400],
    /** Text rendered on a brand-coloured surface. */
    onBrand: neutral[0],
} as const;

/** Background surface colours. */
export const surface = {
    /** App background — what sits behind cards. */
    page:    '#F1F5FB',
    /** Default card/paper background. */
    card:    neutral[0],
    /** Subtle highlighted surfaces — section banners, table stripes, hover. */
    muted:   neutral[50],
    /** Slightly stronger highlight — selected rows, info panels. */
    subtle:  neutral[100],
    /** Inverted surface — tooltips, popovers. */
    inverse: neutral[800],
} as const;

/** Border colours. */
export const border = {
    /** Default 1px divider. */
    subtle: neutral[250],
    /** Slightly stronger border for resting input/card edges. */
    default: neutral[200],
    /** Active/focused border. */
    strong: neutral[300],
} as const;

// ── Shape tokens ───────────────────────────────────────────────────────────

/** Border-radius scale. The theme's default `borderRadius: 10` corresponds to `md`. */
export const radii = {
    none: 0,
    sm:   6,
    md:   10,
    lg:   12,
    xl:   16,
    pill: 9999,
} as const;

// ── Elevation tokens ───────────────────────────────────────────────────────

/**
 * Box-shadow strings keyed by intent rather than raw elevation index.
 * Use these in `sx={{ boxShadow: elevation.card }}`.
 */
export const elevation = {
    /** No shadow — flat surfaces sitting on the page background. */
    flat:     'none',
    /** Resting card/paper. */
    card:     '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
    /** Slightly raised — hover state, sticky toolbars. */
    raised:   '0px 4px 6px -1px rgba(0, 0, 0, 0.07), 0px 2px 4px -1px rgba(0, 0, 0, 0.04)',
    /** Floating — short dropdowns. Zero spread, so the halo grows with the element's height. */
    floating: '0px 10px 30px rgba(0, 0, 0, 0.12)',
    /**
     * Popovers and any menu tall enough for {@link floating} to bloom — negative spread pulls the
     * shadow back against the edge, so the surface reads the same whether it holds three rows or ten.
     */
    popover:  '0px 6px 16px -6px rgba(15, 23, 42, 0.18), 0px 2px 6px -2px rgba(15, 23, 42, 0.08)',
    /** Overlay — modal/dialog. */
    overlay:  '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// ── Convenience root export ────────────────────────────────────────────────

export const tokens = {
    color: { brand, gold, neutral, status },
    text,
    surface,
    border,
    radii,
    elevation,
} as const;

export type Tokens = typeof tokens;
