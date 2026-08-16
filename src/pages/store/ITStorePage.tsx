/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import LaptopChromebookOutlinedIcon from '@mui/icons-material/LaptopChromebookOutlined';
import StoreViewPage, { STORE_ACCENT } from './StoreViewPage';

const ITStorePage = () => (
    <StoreViewPage
        storeType="it"
        title="IT Store"
        subtitle="Technology equipment & digital assets"
        Icon={LaptopChromebookOutlinedIcon}
        accentColor={STORE_ACCENT.it}
    />
);

export default ITStorePage;
