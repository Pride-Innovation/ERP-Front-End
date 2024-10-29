import { useContext, useEffect, useState } from 'react'
import RowContext from '../../../context/row/RowContext';
import { fetchRowsService } from '../../../core/apis/globalService';
import { GridRowsProp } from '@mui/x-data-grid';
import TableComponent from '../../../components/tables/TableComponent';
import IndividualRequestUtill from './utill';
import { itEquipmentMock } from '../../../mocks/itEquipment';

const PersonalRequest = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { endPoint, columnHeaders, header } = IndividualRequestUtill();
    const { setRows, rows } = useContext(RowContext);

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService(
                {
                    page: 1,
                    size: 10,
                    endPoint
                }
            ) as unknown as GridRowsProp;

            console.log(response, "response!!");

            setRows([...itEquipmentMock]);
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={100}
            header={header}
            rows={rows}
            columnHeaders={columnHeaders}
            paginationMode='client'
        />
    )
}

export default PersonalRequest