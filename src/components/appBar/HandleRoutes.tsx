/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react'
import { ISideBarItem } from './interface';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';
import SideBarElements from './sideBarElements';

const HandleRoutes = () => {
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
    const [activeRoute, setActiveRoute] = useState<number | null>(null)
    const navigate = useNavigate();
    const { sideBarList } = SideBarElements();

    const handleClick = (item: ISideBarItem) => {
        if (item?.subroutes?.length > 0) {
            setExpandedItemId(expandedItemId === item.id ? null : item.id);
        } else {
            navigate(item.route);
        }
    };

    /**
     * Maps the current URL to the sidebar item that should be highlighted.
     *
     * Looked up by `route` (not array position), so adding or reordering
     * sidebar entries no longer shifts which item gets highlighted for a
     * given URL. Each mapping is "is the current pathname this exact route,
     * or a descendant of it?" — the more specific routes are listed first
     * so that, for example, `/assets-mgt/approval-workflows` highlights
     * "Approval Workflows" and not "Assets" (which would also match by
     * substring under the old logic).
     */
    const handleRouteChange = (route: string) => {
        // Exact-match routes — must come before any substring/prefix rules
        // below, because some of these URLs are prefixes of others.
        const exactMatches: Array<string> = [
            ROUTES.NOTIFICATIONS,
            ROUTES.APPROVAL_WORKFLOWS,
            ROUTES.AUDIT_TRAILS,
            ROUTES.PROFILE,
        ];

        // Prefix-match routes (in order of specificity — deepest first).
        // A `route` matches `prefix` when it equals `prefix` exactly OR
        // begins with `prefix + "/"`. This avoids false positives like
        // "/assets-mgt/approval-workflows" matching "/assets-mgt".
        const prefixMatches: Array<string> = [
            ROUTES.NOTIFICATIONS,
            ROUTES.APPROVAL_WORKFLOWS,
            ROUTES.AUDIT_TRAILS,
            ROUTES.SETTINGS,
            ROUTES.REPORTS,
            ROUTES.STORE,
            ROUTES.MOVEMENT,
            ROUTES.INVENTORY,
            ROUTES.TRANSPORT_REQUEST,
            ROUTES.REQUEST,
            ROUTES.USERS,
            ROUTES.LIST_ASSETS,
        ];

        // Dashboard is a special case: only exact "/assets-mgt", because
        // every other route in the app starts with that prefix.
        if (route === ROUTES.ASSETS_MANAGEMENT) {
            highlightByRoute(ROUTES.ASSETS_MANAGEMENT);
            return;
        }

        for (const r of exactMatches) {
            if (route === r) {
                highlightByRoute(r);
                return;
            }
        }

        for (const prefix of prefixMatches) {
            if (route === prefix || route.startsWith(prefix + '/')) {
                highlightByRoute(prefix);
                return;
            }
        }
    };

    /**
     * Highlights the sidebar item whose `route` matches the given path.
     * Look up by `route` so reorderings of `sideBarList` can't break us.
     */
    const highlightByRoute = (route: string) => {
        const item = sideBarList.find((entry) => entry.route === route);
        if (item) setActiveRoute(item.id);
    };

    return (
        {
            handleClick,
            expandedItemId,
            setExpandedItemId,
            activeRoute,
            setActiveRoute,
            handleRouteChange
        }
    )
}

export default HandleRoutes
