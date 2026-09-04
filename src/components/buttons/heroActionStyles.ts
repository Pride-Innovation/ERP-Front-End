/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha } from '@mui/material';
import { brand } from '../../utils/tokens';

/**
 * The action buttons that sit in a detail page's hero card.
 *
 * <p>Every detail page in this application — asset, inventory, movement, request — opens with the
 * same card: a 40–56px brand-tinted icon tile, a heavy title, a row of brand chips, and one or two
 * actions on the right. Those actions kept being written as MUI `size="small"` outlined buttons,
 * which produces a ~30px control with a hairline border sitting beside the heaviest type on the
 * page. It reads as an afterthought, and it happened independently on at least two pages.
 *
 * <p>Shared rather than copied so the two cannot drift. A button treatment repeated by hand is a
 * button treatment that ends up subtly different per page, and nobody notices until the pages are
 * seen side by side.
 *
 * <h2>The treatment</h2>
 * Proportion first: 44px tall, so the control has the optical weight of the icon tile beside it
 * rather than disappearing next to it. Then idiom — the hero already speaks in soft brand tints with
 * 1px brand borders (the icon tile, the chips, the breadcrumb control), so the actions speak the
 * same way instead of introducing a fourth vocabulary.
 */
const HERO_ACTION_BASE = {
    height: 44,
    px: 2.5,
    borderRadius: '12px',
    textTransform: 'none' as const,
    fontWeight: 700,
    fontSize: '0.875rem',
    letterSpacing: '-0.1px',
    whiteSpace: 'nowrap' as const,
    transition: 'transform .16s ease, box-shadow .16s ease, background-color .16s ease, border-color .16s ease',
    '& .MuiButton-startIcon': { mr: 0.85, ml: -0.25 },
    // A press that actually lands, rather than a hover that goes nowhere.
    '&:active': { transform: 'translateY(0)' },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
};

/**
 * Secondary — soft-filled rather than outlined.
 *
 * <p>A hairline outline on white has almost no presence, which is what made these buttons vanish.
 * The tinted fill gives the control the same weight as the icon tile and the chips, so it belongs to
 * the hero instead of floating on it, while still yielding to a primary beside it.
 *
 * <p>Use with `variant="text"` — the fill and border come from here, and MUI's `outlined` would add
 * its own border on top.
 */
export const heroSecondarySx = {
    ...HERO_ACTION_BASE,
    color: brand[700],
    bgcolor: alpha(brand[500], 0.08),
    border: `1px solid ${alpha(brand[500], 0.22)}`,
    boxShadow: 'none',
    '&:hover': {
        bgcolor: alpha(brand[500], 0.14),
        borderColor: alpha(brand[500], 0.38),
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${alpha(brand[500], 0.14)}`,
    },
    // Disabled has to stay legible: these actions are often unavailable until a record finishes
    // loading, and a control that fades to nothing looks broken rather than temporarily inert.
    '&.Mui-disabled': {
        color: alpha(brand[700], 0.4),
        bgcolor: alpha(brand[500], 0.04),
        border: `1px solid ${alpha(brand[500], 0.12)}`,
    },
};

/**
 * Primary — solid brand, with the lift the hero card already implies.
 *
 * <p>The inset highlight along the top edge is the one flourish: it catches the same light as the
 * card's own shadow, so the button reads as a raised surface rather than a flat rectangle.
 */
export const heroPrimarySx = {
    ...HERO_ACTION_BASE,
    color: '#fff',
    bgcolor: brand[600],
    border: `1px solid ${alpha('#000', 0.06)}`,
    boxShadow: `0 1px 0 ${alpha('#fff', 0.18)} inset, 0 4px 12px ${alpha(brand[700], 0.28)}`,
    '&:hover': {
        bgcolor: brand[700],
        transform: 'translateY(-1px)',
        boxShadow: `0 1px 0 ${alpha('#fff', 0.2)} inset, 0 8px 20px ${alpha(brand[700], 0.34)}`,
    },
    '&.Mui-disabled': {
        color: alpha('#fff', 0.7),
        bgcolor: alpha(brand[600], 0.45),
        boxShadow: 'none',
    },
};

export default { heroSecondarySx, heroPrimarySx };
