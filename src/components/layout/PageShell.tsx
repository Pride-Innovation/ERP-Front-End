/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, Breadcrumbs, Link, Stack, Typography, alpha } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { brand, neutral } from '../../utils/tokens';

export interface IPageShellBreadcrumb {
    label: string;
    href?: string;
}

export interface IPageShellProps {
    /** Primary page title (large). */
    title: string;
    /** Optional subtitle under the title — one sentence describing the page. */
    subtitle?: string;
    /** Optional icon shown in a teal-gradient tile to the left of the title. */
    icon?: ReactNode;
    /** Breadcrumb trail rendered above the title. Last entry is the current page (no link). */
    breadcrumbs?: IPageShellBreadcrumb[];
    /** Right-side slot for buttons, counts or filters. */
    actions?: ReactNode;
    /** Page body. */
    children: ReactNode;
    /** Override horizontal padding. Defaults to responsive 2/3 spacing units. */
    contentPx?: number | { xs?: number; sm?: number; md?: number };
}

const PageShell = ({
    title,
    subtitle,
    icon,
    breadcrumbs,
    actions,
    children,
    contentPx,
}: IPageShellProps) => (
    <Box sx={{ px: contentPx ?? { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" sx={{ color: neutral[400] }} />}
                aria-label="breadcrumb"
                sx={{ mb: 1.5, fontSize: '0.75rem' }}
            >
                {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    if (isLast || !crumb.href) {
                        return (
                            <Typography
                                key={`${crumb.label}-${idx}`}
                                variant="caption"
                                sx={{
                                    color: isLast ? neutral[700] : neutral[500],
                                    fontWeight: isLast ? 600 : 500,
                                }}
                            >
                                {crumb.label}
                            </Typography>
                        );
                    }
                    return (
                        <Link
                            key={`${crumb.label}-${idx}`}
                            href={crumb.href}
                            underline="hover"
                            sx={{
                                color: neutral[500],
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                '&:hover': { color: brand[600] },
                            }}
                        >
                            {crumb.label}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        )}

        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 3 }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                {icon && (
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[700]} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#fff',
                            boxShadow: `0 4px 12px ${alpha(brand[500], 0.25)}`,
                            '& .MuiSvgIcon-root': { color: '#fff', fontSize: 22 },
                        }}
                    >
                        {icon}
                    </Box>
                )}
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.3 }}
                        noWrap
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="body2"
                            sx={{ color: neutral[500], mt: 0.25 }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Stack>
            {actions && (
                <Box
                    sx={{
                        flexShrink: 0,
                        width: { xs: '100%', sm: 'auto' },
                        display: 'flex',
                        gap: 1,
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {actions}
                </Box>
            )}
        </Stack>

        {children}
    </Box>
);

export default PageShell;
