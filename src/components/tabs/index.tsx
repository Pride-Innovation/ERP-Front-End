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
import { SxProps, Theme, alpha } from '@mui/material';

// Brand colors
const PRIMARY_COLOR = '#08796C';

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
            {value === index && (
                <Box sx={{ p: padding }}>
                    {children}
                </Box>
            )}
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
 * Default styles for the tab component
 */
const defaultTabStyles: SxProps<Theme> = {
    '& .MuiTabs-indicator': {
        backgroundColor: PRIMARY_COLOR,
        height: 3,
    },
    '& .MuiTab-root': {
        textTransform: 'none',
        fontWeight: 600,
        color: 'text.secondary',
        '&.Mui-selected': {
            color: PRIMARY_COLOR,
        },
        '&:hover': {
            color: alpha(PRIMARY_COLOR, 0.8),
        },
    },
    width: '100%',
};

/**
 * TabComponent provides a tabbed interface with customizable headers and content
 */
const TabComponent = ({
    headers,
    handleTabChange,
    sx,
    tabPadding,
    defaultTab = 0,
    variant = "scrollable",
    scrollButtons = "auto"
}: ITabComponent) => {
    const [value, setValue] = React.useState(defaultTab);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        handleTabChange?.(newValue);
    };

    return (
        <Box sx={{ ...defaultTabStyles, ...(sx || {}) }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="tabs"
                    variant={variant}
                    scrollButtons={scrollButtons}
                    allowScrollButtonsMobile
                >
                    {headers.map(header => (
                        <Tab
                            key={`tab-${header.position}`}
                            label={header.label}
                            {...a11yProps(header.position)}
                            icon={header.icon && React.isValidElement(header.icon) ? header.icon : undefined}
                            iconPosition={header.iconPosition}
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