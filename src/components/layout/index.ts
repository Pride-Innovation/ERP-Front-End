/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Layout primitives — page shells, sections, form grids, empty states, stat tiles.
 *
 * Import from this barrel:
 *   import { PageShell, PageSection, FormGrid, FormRow, EmptyState, StatTile } from 'components/layout';
 */

export { default as PageShell } from './PageShell';
export type { IPageShellProps, IPageShellBreadcrumb } from './PageShell';

export { default as PageSection } from './PageSection';
export type { IPageSectionProps } from './PageSection';

export { default as FormGrid, FormRow } from './FormGrid';
export type { IFormGridProps, IFormRowProps } from './FormGrid';

export { default as EmptyState } from './EmptyState';
export type { IEmptyStateProps } from './EmptyState';

export { default as StatTile } from './StatTile';
export type { IStatTileProps, IStatTileTrend } from './StatTile';

export { default as StatusChip } from './StatusChip';
export type { IStatusChipProps, StatusTone } from './StatusChip';

export { default as PageHero } from './PageHero';
export type { IPageHeroProps, IPageHeroStat } from './PageHero';
