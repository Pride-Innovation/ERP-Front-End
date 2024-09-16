import { Grid } from '@mui/material'
import TableComponent from '../../components/tables/TableComponent';
import UserUtils from './utils';
import { UserContext } from '../../context/UserContext';
import { useContext, useState } from 'react';
import { crudStates } from '../../utils/constants';
import ModalComponent from '../../components/modal';
import CreateUser from './CreateUser';

const Users = () => {
  const { usersTableData } = useContext(UserContext);
  const header = { plural: 'Users', singular: 'User' };
  const { columnHeaders } = UserUtils();
  const [modalState, setModalState] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  const handleCreation = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  const handleImport = () => {
    console.log('Import users clicked');
  };

  const handleOptionClicked = (option: string | number) => {
    console.log(option, "options informations!!")
  }

  return (
    <Grid xs={12} container>
      {modalState === crudStates.create &&
        <ModalComponent title='Create User' open={open} handleClose={handleClose} width="60%">
          <CreateUser handleClose={handleClose} />
        </ModalComponent>
      }
      {columnHeaders.length > 0 &&
        <TableComponent
          handleOptionClicked={handleOptionClicked}
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