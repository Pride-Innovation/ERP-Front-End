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
        setActiveRoute(item.id)
        if (item?.subroutes?.length > 0) {
            setExpandedItemId(expandedItemId === item.id ? null : item.id);
        } else {
            navigate(item.route);
        }
    };


    const handleRouteChange = (route: string) => {
        if (route === ROUTES.ASSETS_MANAGEMENT) {
            handleClick(sideBarItems[0])
        }
        if (route === ROUTES.SETTINGS) {
            handleClick(sideBarItems[1])
        }
        if (route === ROUTES.PROFILE) {
            handleClick(sideBarItems[2])
        }
        if (route === ROUTES.USERS) {
            handleClick(sideBarItems[3])
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