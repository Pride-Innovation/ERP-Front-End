import { useState } from 'react'
import { ISideBarItem } from './interface';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';
import { sideBarItems } from './sideBarElements';

const HandleRoutes = () => {
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
    const [activeRoute, setActiveRoute] = useState<number | null>(null)
    const navigate = useNavigate()

    const handleClick = (item: ISideBarItem) => {
        if (item?.subroutes?.length > 0) {
            setExpandedItemId(expandedItemId === item.id ? null : item.id);
        } else {
            navigate(item.route);
        }
    };

    const handleActiveRoute = (item: ISideBarItem) => {
        setActiveRoute(item.id)
    }

    const handleRouteChange = (route: string) => {
        if (route === ROUTES.ASSETS_MANAGEMENT) {
            handleClick(sideBarItems[0]);
            handleActiveRoute(sideBarItems[0])
        }
        if ([ROUTES.LIST_ASSETS].includes(route)) {
            handleClick(sideBarItems[1])
            handleActiveRoute(sideBarItems[1])
        }
        if (route.indexOf(ROUTES.LIST_ASSETS) !== -1) {
            handleActiveRoute(sideBarItems[1])
        }
        if (route === ROUTES.USERS) {
            handleClick(sideBarItems[2])
            handleActiveRoute(sideBarItems[2])
        }
        if (route === ROUTES.REQUEST) {
            handleClick(sideBarItems[3])
            handleActiveRoute(sideBarItems[3])
        }
        if (route.indexOf(ROUTES.REQUEST) !== -1) {
            handleActiveRoute(sideBarItems[3])
        }
        if (route === ROUTES.SETTINGS) {
            handleClick(sideBarItems[4])
            handleActiveRoute(sideBarItems[4])
        }
        if (route === ROUTES.AUDIT_TRAILS) {
            handleClick(sideBarItems[5])
            handleActiveRoute(sideBarItems[5])
        }
    }

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