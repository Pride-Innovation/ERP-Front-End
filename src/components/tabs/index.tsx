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
import { useContext } from 'react';
import { StoreContext } from '../../context/store';
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

/** Legacy store-category → tab index map, retained for backward compatibility. */
const LEGACY_STATUS_TAB: Record<string, number> = {
    officeEquipment: 0,
    itEquipment: 1,
    stationery: 2,
    fleet: 3,
};

/**
 * TabComponent provides a tabbed interface with a clickable tab bar and
 * per-tab content panels.
 */
const TabComponent = ({
    headers,
    handleTabChange,
    sx,
    tabPadding,
    defaultTab = 0,
    variant = 'scrollable',
    scrollButtons = 'auto',
}: ITabComponent) => {
    const [value, setValue] = React.useState(defaultTab);
    const { selectedStatus } = useContext(StoreContext);

    const handleChange = (_event: React.SyntheticEvent | null, newValue: number) => {
        setValue(newValue);
        handleTabChange?.(newValue);
    };

    // Fire the default tab's onChange once when the headers first become available,
    // so consumers that lazily load the active tab's data (e.g. the store report)
    // get the first tab populated without a manual click — without resetting a
    // user's later selection.
    const initialised = React.useRef(false);
    React.useEffect(() => {
        if (!initialised.current && headers.length > 0) {
            initialised.current = true;
            handleChange(null, defaultTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headers.length]);

    // Backward-compat: some store views drive the active tab from a category
    // status held in StoreContext. Only switch when it maps to a real tab so
    // it never clobbers the default tab or a user's manual selection.
    React.useEffect(() => {
        if (headers.length === 0) return;
        const target = LEGACY_STATUS_TAB[selectedStatus as string];
        if (target !== undefined && target < headers.length) {
            handleChange(null, target);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStatus]);

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
