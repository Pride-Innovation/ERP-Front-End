/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StoreViewPage from './StoreViewPage';

const DisposalStorePage = () => (
    <StoreViewPage
        storeType="disposal"
        title="Disposal Store"
        subtitle="Items awaiting disposal or write-off"
        Icon={DeleteOutlineOutlinedIcon}
        accentColor="#b45309"
    />
);

export default DisposalStorePage;
