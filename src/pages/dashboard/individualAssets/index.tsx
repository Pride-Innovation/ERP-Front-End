import { useContext, useEffect, useState } from 'react'
import RowContext from '../../../context/row/RowContext';
import { fetchRowsService } from '../../../core/apis/globalService';
import { GridRowsProp } from '@mui/x-data-grid';
import TableComponent from '../../../components/tables/TableComponent';
import IndividualRequestUtill from './utill';
import { itEquipmentMock } from '../../../mocks/itEquipment';
import { ErrorMessage } from '../../../core/apis/axiosInstance';

const PersonalAssets = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { endPoint, columnHeaders, header } = IndividualRequestUtill();
    const { setRows, rows } = useContext(RowContext);

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService(
                {
                    pageNumber: 1,
                    pageSize: 10,
                    endPoint
                }
            ) as unknown as GridRowsProp;

            console.log(response, "response!!");

            setRows([...itEquipmentMock]);
        } catch (error) {
            setRows([...itEquipmentMock]);
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
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

export default PersonalAssets