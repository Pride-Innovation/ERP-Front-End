/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import TableComponent from '../../../components/tables/TableComponent';
import IndividualRequestUtill from './utill';

const PersonalAssets = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { endPoint, columnHeaders, header } = IndividualRequestUtill();

    const fetchResources = async () => {
        setLoading(true)

        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={100}
            header={header}
            rows={[]}
            columnHeaders={columnHeaders}
            paginationMode='client'
        />
    )
}

export default PersonalAssets