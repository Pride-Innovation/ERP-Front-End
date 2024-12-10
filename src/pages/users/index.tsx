import { Grid } from '@mui/material';
import TableComponent from '../../components/tables/TableComponent';
import UserUtils from './utils';
import { UserContext } from '../../context/user/UserContext';
import { useContext, useEffect } from 'react';
import { crudStates } from '../../utils/constants';
import ModalComponent from '../../components/modal';
import CreateUser from './CreateUser';
import { IResponseData, IUser } from './interface';
import UpdateUsers from './UpdateUsers';
import Deactivate from './Deactivate';
import { deleteUserService, fetchUsersService } from './service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';

const Users = () => {
  const { usersTableData } = useContext(UserContext);
  const header = { plural: 'Users', singular: 'User' };
  const { user, users, setUsers, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const {
    columnHeaders,
    handleCreation,
    setModalState,
    handleOpen,
    modalState,
    open,
    handleClose,
    handleUsers,
    filterCurrentUser,
    removeUserFromTable
  } = UserUtils();

  const fetchUsers = async () => {
    try {
      const response = await fetchUsersService() as unknown as Array<IUser>;
      setUsers(response)
    } catch (error) {
      console.log(error, "response Error")
    }
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { if (users?.length > 0) handleUsers(users) }, [users])

  const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
    switch (option) {
      case crudStates.deactivate:
        const response = await deleteUserService(moduleID as string) as IResponseData;
        if (response.status === "success") removeUserFromTable(moduleID as string)
        toast.success(response?.data?.message);
        break;
      case crudStates.update:
        setModalState(option as string)
        setUser(filterCurrentUser(users, moduleID as string))
        handleOpen();
        break;
      case crudStates.read:
        navigate(`${ROUTES.PROFILE}/${moduleID}`)
        break;
      default:
        break
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
      {modalState === crudStates.deactivate &&
        <ModalComponent title='Deactivate User' open={open} handleClose={handleClose} width="40%">
          <Deactivate user={user} handleClose={handleClose} buttonText='Deactivate' sendingRequest={false} />
        </ModalComponent>
      }
      {columnHeaders.length > 0 &&
        <TableComponent
          createAction
          importData
          exportData
          handleOptionClicked={handleOptionClicked}
          onCreationHandler={handleCreation}
          module='user'
          header={header}
          rows={usersTableData}
          columnHeaders={columnHeaders}
        />}
    </Grid>
  )
}

export default Users