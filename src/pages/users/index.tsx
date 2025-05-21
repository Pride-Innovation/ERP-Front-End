/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from '@mui/material';
import TableComponent from '../../components/tables/TableComponent';
import UserUtils from './utils';
import { UserContext } from '../../context/user/UserContext';
import { useContext, useEffect, useState } from 'react';
import { crudStates } from '../../utils/constants';
import ModalComponent from '../../components/modal';
import CreateUser from './CreateUser';
import { IResponseData } from './interface';
import UpdateUsers from './UpdateUsers';
import Deactivate from './Deactivate';
import { deleteUserService } from './service';

const Users = () => {
  const header = { plural: 'Users', singular: 'User' };
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const { user } = useContext(UserContext);

  const {
    columnHeaders,
    handleCreation,
    modalState,
    open,
    handleClose,
    usersTableData,
    fetchAllUsers,
    handleOptionClicked,
    loading,

  } = UserUtils();

  useEffect(() => { fetchAllUsers() }, []);

  const deactivateUser = async (id: string | number) => {
    const response = await deleteUserService(id as string) as IResponseData;

    handleClose()
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
          <UpdateUsers user={user} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} handleClose={handleClose} />
        </ModalComponent>
      }
      {modalState === crudStates.deactivate &&
        <ModalComponent title='Deactivate User' open={open} handleClose={handleClose} width="40%">
          <Deactivate handleDeactivate={deactivateUser} user={user} handleClose={handleClose} buttonText='Deactivate' sendingRequest={false} />
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
          loading={loading}
          rows={usersTableData}
          columnHeaders={columnHeaders}
        />}
    </Grid>
  )
}

export default Users