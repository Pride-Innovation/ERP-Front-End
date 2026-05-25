/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Rotating palette used to tint settings cards (Branch / Department /
 * Supplier / Title / Commodity / Region) so adjacent cards on the same
 * grid are visually distinct without drifting from the brand palette.
 *
 * Mirrors the palette used by the Asset Category screen so all settings
 * pages share the same visual language.
 */
export const CARD_COLORS = [
    '#08796C', '#1976D2', '#7B1FA2', '#C62828', '#E65100',
    '#2E7D32', '#00838F', '#558B2F', '#4527A0', '#283593',
    '#AD1457', '#6D4C41',
];

export const getCardColor = (index: number): string =>
    CARD_COLORS[index % CARD_COLORS.length];
