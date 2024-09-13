import { Grid } from '@mui/material'
import TableComponent from '../../components/tables/TableComponent';
import UserUtils from './utils';
import { UserContext } from '../../context/UserContext';
import { useContext } from 'react';

const Users = () => {
  const { usersTableData } = useContext(UserContext);
  const {
    columnHeaders,
    handleCreation,
    handleImport,
    header
  } = UserUtils();

  return (
    <Grid xs={12} container>
      {columnHeaders.length > 0 && <TableComponent
        onCreationHandler={handleCreation}
        onImportHandler={handleImport}
        header={header}
        rows={usersTableData}
        columnHeaders={columnHeaders}
      />}
    </Grid>
  )
}

export default Users