/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

/**
 * Interface defining the properties for each tab header
 */
export interface ITabHeader {
    /** The text label for the tab */
    label: string;
    
    /** The position/index of the tab (used for ordering) */
    position: number;
    
    /** The content to render when this tab is active */
    content: ReactNode;
    
    /** Optional unique identifier for the tab */
    id?: number | string;
    
    /** Optional icon to display in the tab */
    icon?: React.ReactNode;
    
    /** Position of the icon relative to the label */
    iconPosition?: 'start' | 'end' | 'top' | 'bottom';
    
    /** Whether the tab is disabled */
    disabled?: boolean;
}

/**
 * Interface defining the properties for the TabComponent
 */
export interface ITabComponent {
    /** Array of tab headers with their content */
    headers: Array<ITabHeader>;
    
    /** Optional callback when tab changes */
    handleTabChange?: (value: string | number) => void;
    
    /** Optional styles to apply to the tab component */
    sx?: SxProps<Theme>;
    
    /** Padding for the tab content panels */
    tabPadding?: number | string;
    
    /** The initially active tab index, for a caller that does not track the selection itself */
    defaultTab?: number;

    /**
     * The active tab index, when the caller owns the selection.
     *
     * <p>Supply it and the component becomes controlled: it renders what it is told and never moves
     * on its own. The store report needs that, because the tab and the category being fetched are
     * two facts that must not be allowed to disagree — and they did, silently, for as long as this
     * component chose its own index.
     *
     * <p>Omit it and the previous uncontrolled behaviour is unchanged.
     */
    activeTab?: number;
    
    /** How tabs should be displayed */
    variant?: 'standard' | 'scrollable' | 'fullWidth';
    
    /** How scroll buttons behave (for scrollable tabs) */
    scrollButtons?: 'auto' | true | false;
    
    /** Optional className for additional styling */
    className?: string;
}