import { Grid } from '@mui/material'
import TableComponent from '../../components/tables/TableComponent';
import UserUtils from './utils';
import { UserContext } from '../../context/user/UserContext';
import { useContext, useEffect } from 'react';
import { crudStates } from '../../utils/constants';
import ModalComponent from '../../components/modal';
import CreateUser from './CreateUser';
import { IUser } from './interface';
import UpdateUsers from './UpdateUsers';
import { usersMock } from '../../mocks/users';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';

const Users = () => {
  const navigate = useNavigate();
  const { usersTableData } = useContext(UserContext);
  const header = { plural: 'Users', singular: 'User' };
  const {
    columnHeaders,
    handleCreation,
    setModalState,
    handleOpen,
    modalState,
    open,
    handleClose
  } = UserUtils();
  const { setUser, setUsers, users } = useContext(UserContext);

  useEffect(() => { setUsers(usersMock) }, [])

  const handleImport = () => {
    console.log('Import users clicked');
  };

  const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
    setModalState(option as string)
    const user = users?.find(user => user.id === moduleID) as IUser;
    setUser(user)
    handleOpen();

    if (option === crudStates.read) {
      navigate(`${ROUTES.PROFILE}/${user.id}`)
    }
  }

  return (
    <Grid xs={12} container>
      {modalState === crudStates.create &&
        <ModalComponent title='Create User' open={open} handleClose={handleClose} width="60%">
          <CreateUser handleClose={handleClose} />
        </ModalComponent>
      }
      {modalState === crudStates.update &&
        <ModalComponent title='Update User' open={open} handleClose={handleClose} width="60%">
          <UpdateUsers handleClose={handleClose} />
        </ModalComponent>
      }
      {columnHeaders.length > 0 &&
        <TableComponent
          createAction
          importData
          exportData
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