/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import StoreViewPage, { STORE_ACCENT } from './StoreViewPage';

const AdminStore = () => (
    <StoreViewPage
        storeType="admin"
        title="Admin Store"
        subtitle="Administrative supplies & office materials"
        Icon={AdminPanelSettingsOutlinedIcon}
        accentColor={STORE_ACCENT.admin}
    />
);

export default AdminStore;
