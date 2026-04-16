/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box } from '@mui/material';
import TableComponent from '../../components/tables/TableComponent';
import UserUtils from './utils';
import { UserContext } from '../../context/user/UserContext';
import { useContext, useEffect, useState } from 'react';
import { crudStates } from '../../utils/constants';
import ModalComponent from '../../components/modal';
import DisableUser from './DisableUser';
import UnblockUser from './UnblockUser';
import EnableUser from './EnableUser';
import Container from './Container';
import { IBulkUserData } from './interface';
import { toast } from 'react-toastify';
import { FileContext } from '../../context/file/FileContext';
import { bulkInsertUsersService } from './service';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';

const Users = () => {
  const header = { plural: 'Users', singular: 'User' };
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const { user } = useContext(UserContext);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { fileData } = useContext(FileContext);


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
    endPoint,
    count
  } = UserUtils();

  useEffect(() => { fetchAllUsers() }, []);

  const handleStatusChange = (status: string) => {
    let params = {};
    if (status === 'locked') {
      params = { blocked: true };
      fetchAllUsers(params);
      setSelectedStatus(status);
    } else if (status === 'active') {
      params = { isEnabled: true, blocked: false, isAccountNonLocked: true };
      fetchAllUsers(params);
      setSelectedStatus(status);
    } else if (status === 'disabled') {
      params = { isEnabled: false };
      fetchAllUsers(params);
      setSelectedStatus(status);
    } else {
      fetchAllUsers();
      setSelectedStatus('all');
    }
  }

  const bulkInsertUsers = async (users: Array<IBulkUserData>) => {
    try {
      const data = new FormData();
      data.append("users", JSON.stringify(users));

      const response = await bulkInsertUsersService(data);

      if (response.success === true) {
        toast.success("Bulk Insert Successful")
        fetchAllUsers();
      }

    } catch (error) {
      console.log("Bulk Insert Error", error);
    }
  }

  useEffect(() => {
    if (fileData?.jsonData?.length > 0) {
      bulkInsertUsers(fileData.jsonData as unknown as Array<IBulkUserData>);
    }
  }, [fileData]);

  return (
    <Box sx={{ width: '100%' }}>
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
      {
        modalState === crudStates.enable &&
        <ModalComponent title='Enable User Account' open={open} handleClose={handleClose} width="60%">
          <EnableUser sendingRequest={sendingRequest} user={user} handleClose={handleClose} setSendingRequest={setSendingRequest} buttonText='Enable' />
        </ModalComponent>
      }
      {columnHeaders.length > 0 &&
        <Container>
          <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={count}
            exportData
            createAction
            importData
            module="user"
            header={header}
            rows={usersTableData}
            columnHeaders={columnHeaders}
            onCreationHandler={handleCreation}
            handleOptionClicked={handleOptionClicked}
            paginationMode='server'
            refresh
            filterMode="server"
            status
            onStatusChange={handleStatusChange}
            selectedStatus={selectedStatus}
            columnFilters={[
              { key: 'firstName', label: 'First Name', type: 'text' },
              { key: 'lastName', label: 'Last Name', type: 'text' },
              { key: 'email', label: 'Email', type: 'text' },
              {
                key: 'status', label: 'Status', type: 'select', options: [
                  { value: 'active', label: 'Active' },
                  { value: 'disabled', label: 'Disabled' },
                  { value: 'locked', label: 'Locked' },
                ]
              },
              { key: 'createdAt', label: 'Date Created', type: 'dateRange' },
            ]}
            onApplyFilters={(filters) => fetchAllUsers(filters)}
            tableIcon={<PeopleOutlinedIcon sx={{ fontSize: 18, color: '#08796C' }} />}
          />
        </Container>
      }
    </Box>
  )
}

export default Users