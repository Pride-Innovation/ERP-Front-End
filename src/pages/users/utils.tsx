/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { usersMock } from '../../mocks/users';
import { useContext, useEffect, useState } from 'react';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { IOptions, ITableHeader } from '../../components/tables/interface';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { UserContext } from '../../context/user/UserContext';
import { IBranchesAxiosResponse, IUser } from './interface';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { crudStates } from '../../utils/constants';
import { IFormData } from '../assets/interface';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { useSelector } from 'react-redux';
import { loadUsers } from './slice';
import { fetchRowsService } from '../../core/apis/globalService';

const UserUtils = () => {
    const endPoint: string = "users";
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const [optionsObject, setOptionsObject] = useState<{
        usersOptions: Array<IOptions>;
        rolesOptions: Array<IOptions>;
    }>({ usersOptions: [], rolesOptions: [] });
    const { users, rolesList } = useSelector((state: RootState) => state.UserStore);
    const { setUsers } = useContext(UserContext);

    const fetchAllUsers = async (params?: Record<string, any>) => {
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint, params }) as IBranchesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadUsers(response.data.content))
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        // setOptionsObject({
        // })
    }, [])

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const {
        id,
        ...data
    } = usersMock[0];

    const rowData = {
        // name,
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.deactivate, label: "Deactivate", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    const removeUserFromTable = (id: string | number) => {
        setUsers(() => users.filter(user => user.id !== id))
    };

    const replaceUpdatedUser = (id: string | number, updatedUser: IUser) => {
        setUsers(() => users.map(user => user?.id === id ? updatedUser : user))
    }

    // const handleUsers = (users: Array<IUser>) => {
    //     const data: Array<IUsersTableData> = users.map((user, index) => {
    //         const {
    //             reportsTo,
    //             firstName,
    //             lastName,
    //             otherName,
    //             ...data
    //         } = users[index];

    //         return (
    //             { ...data }
    //         )
    //     })

    //     setUsersTableData(data)

    // }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);




    const userFields: Array<IFormData<IUser>> = [
        {
            value: "firstName",
            label: 'First Name',
            type: "input"
        },
        {
            value: "lastName",
            label: 'Last Name',
            type: "input"
        },

        {
            value: "email",
            label: 'Email address',
            type: "input"
        },
        {
            value: "title",
            label: 'Title',
            type: "input"
        },

        {
            value: "gender",
            label: 'Gender',
            type: "select",
            options: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
            ]
        },
        {
            value: "staffNumber",
            label: 'Staff Number',
            type: "input"
        },
        {
            value: "available",
            label: 'Availability',
            type: "select",
            options: [
                { label: "Present", value: "present" },
                { label: "Absent", value: "absent" },
            ]
        },

    ]

    return ({
        columnHeaders,
        handleCreation,
        setModalState,
        handleOpen,
        modalState,
        open,
        handleClose,
        removeUserFromTable,
        userFields,
        replaceUpdatedUser,
        fetchAllUsers
    })
}

export default UserUtils