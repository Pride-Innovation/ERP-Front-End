import { useContext, useEffect, useState } from 'react'
import RowContext from '../../context/row/RowContext';
import { fetchRowsService } from '../../core/apis/globalService';
import { GridRowsProp } from '@mui/x-data-grid';
import { Grid } from '@mui/material';
import TableComponent from '../../components/tables/TableComponent';
import AssetUtills from './utils';
import { assetsMock } from '../../mocks/assets';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';
import { crudStates } from '../../utils/constants';

const AssetsManagement = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { setRows, rows } = useContext(RowContext);
    const { columnHeaders, endPoint, header } = AssetUtills();
    const navigate = useNavigate();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ page: 1, size: 10, endPoint }) as unknown as GridRowsProp;
            console.log(response, "response!!")
            setRows([...assetsMock]);
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources()
    }, []);

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        if (option === crudStates.update) {
            navigate(`${ROUTES.UPDATE_ASSET}/${moduleID}`)
        }
    }

    return (
        <>
            {rows?.length > 0 && <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        createAction
                        importData
                        header={header}
                        rows={rows}
                        columnHeaders={columnHeaders}
                        onCreationHandler={() => navigate(ROUTES.CREATE_ASSET)}
                        handleOptionClicked={handleOptionClicked}
                    />
                }
            </Grid>}
        </>
    )
}

export default AssetsManagement