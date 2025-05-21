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
import UpdateUsers from './UpdateUsers';
import DisableUser from './DisableUser';
import UnblockUser from './UnblockUser';

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
      {modalState === crudStates.disable &&
        <ModalComponent title='Disable User Account' open={open} handleClose={handleClose} width="40%">
          <DisableUser setSendingRequest={setSendingRequest} user={user} handleClose={handleClose} buttonText='Disable' sendingRequest={false} />
        </ModalComponent>
      }
      {
        modalState === crudStates.unblock &&
        <ModalComponent title='Unblock User Account' open={open} handleClose={handleClose} width="40%">
          <UnblockUser sendingRequest={sendingRequest} user={user} handleClose={handleClose} setSendingRequest={setSendingRequest} buttonText='Unblock' />
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