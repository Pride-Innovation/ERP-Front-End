/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { ITabComponent } from './interface';
import { alpha } from '@mui/material';
import { brand, neutral, border } from '../../utils/tokens';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    padding?: number | string;
}

/**
 * TabPanel component that displays content for the selected tab
 */
function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, padding = 3, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tab-panel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: padding }}>{children}</Box>}
        </div>
    );
}

/**
 * Generates accessibility properties for tabs
 */
function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tab-panel-${index}`,
    };
}

/**
 * TabComponent provides a tabbed interface with a clickable tab bar and
 * per-tab content panels.
 *
 * <h2>It no longer maps categories to positions</h2>
 * This held a `LEGACY_STATUS_TAB` table — `{officeEquipment: 0, itEquipment: 1, stationery: 2,
 * fleet: 3}` — read from `StoreContext.selectedStatus`, and moved the tab whenever that changed.
 * Two things had made it wrong and neither was visible from here:
 *
 * <ul>
 *   <li>`GET /asset-types` sorts **by name**, and the bank has **twelve** categories, not four. So
 *       index 0 is *Building & Construction*, 1 is *Cleaning & Hygiene*, 2 is *Computers* and 3 is
 *       *Equipment* — every entry in the table pointed at the wrong category. Asking for Stationery
 *       (really index 10) opened Computers.</li>
 *   <li>`selectedStatus` defaulted to `'officeEquipment'`, so the store page landed on index 0 on
 *       every visit whatever you had been looking at.</li>
 * </ul>
 *
 * <p>A positional map onto a server-ordered list cannot be kept correct — renaming a category
 * reorders it, and adding one shifts everything below. The store report now identifies its tab by
 * the category's **id** and passes the index in, so there is one fact instead of two.
 */
const TabComponent = ({
    headers,
    handleTabChange,
    sx,
    tabPadding,
    defaultTab = 0,
    activeTab,
    variant = 'scrollable',
    scrollButtons = 'auto',
}: ITabComponent) => {
    const [internalValue, setInternalValue] = React.useState(defaultTab);
    const controlled = activeTab !== undefined;
    const value = controlled ? activeTab : internalValue;

    const handleChange = (_event: React.SyntheticEvent | null, newValue: number) => {
        // A controlled caller owns the selection; moving it here as well would give the two copies
        // a chance to disagree, which is the whole fault this component used to have.
        if (!controlled) setInternalValue(newValue);
        handleTabChange?.(newValue);
    };

    // Fire the default tab's onChange once when the headers first become available,
    // so consumers that lazily load the active tab's data (e.g. the store report)
    // get the first tab populated without a manual click — without resetting a
    // user's later selection.
    const initialised = React.useRef(false);
    React.useEffect(() => {
        // A controlled caller has already decided which tab is active and loaded it; firing the
        // default here would override that with index 0.
        if (controlled) return;
        if (!initialised.current && headers.length > 0) {
            initialised.current = true;
            handleChange(null, defaultTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headers.length]);

    return (
        <Box sx={{ width: '100%', ...(sx || {}) }}>
            <Box sx={{ borderBottom: `1px solid ${border.subtle}`, bgcolor: alpha(brand[500], 0.025) }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="tabs"
                    variant={variant}
                    scrollButtons={scrollButtons}
                    allowScrollButtonsMobile
                    sx={{
                        px: 1.5,
                        minHeight: 50,
                        '& .MuiTab-root': {
                            minHeight: 50,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.83rem',
                            color: neutral[500],
                            gap: 0.75,
                            px: 2,
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': { color: brand[700], fontWeight: 700 },
                            '&:hover': { color: brand[600], bgcolor: alpha(brand[500], 0.04) },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: brand[500],
                            height: 3,
                            borderRadius: '3px 3px 0 0',
                        },
                        '& .MuiTabScrollButton-root': { color: brand[600] },
                    }}
                >
                    {headers.map(header => (
                        <Tab
                            key={`tab-${header.position}`}
                            label={header.label}
                            {...a11yProps(header.position)}
                            icon={header.icon && React.isValidElement(header.icon) ? header.icon : undefined}
                            iconPosition={header.iconPosition ?? 'start'}
                            disabled={header.disabled}
                        />
                    ))}
                </Tabs>
            </Box>

            {headers.map(header => (
                <CustomTabPanel
                    key={`panel-${header.position}`}
                    value={value}
                    index={header.position}
                    padding={tabPadding}
                >
                    {header.content}
                </CustomTabPanel>
            ))}
        </Box>
    );
};

export default TabComponent;
