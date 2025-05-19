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
import { IBranchesAxiosResponse, IUser, IUserTableData } from './interface';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { crudStates } from '../../utils/constants';
import { IFormData } from '../assets/interface';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { useSelector } from 'react-redux';
import { loadUsers } from './slice';
import { fetchRowsService } from '../../core/apis/globalService';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';

const UserUtils = () => {
    const endPoint: string = "users";
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [usersTableData, setUsersTableData] = useState<Array<IUserTableData>>([] as Array<IUserTableData>);
    const dispatch = useDispatch<AppDispatch>();

    const [optionsObject, setOptionsObject] = useState<{
        usersOptions: Array<IOptions>;
        rolesOptions: Array<IOptions>;
    }>({ usersOptions: [], rolesOptions: [] });

    const { users } = useSelector((state: RootState) => state.UserStore);
    const { setUsers } = useContext(UserContext);
    const navigate = useNavigate();

    const fetchAllUsers = async (params?: Record<string, any>) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint, params }) as IBranchesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadUsers(response.data.content))
            }

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const {
        id,
        title,
        department,
        profileImage,
        firstName,
        lastName,
        staffNumber,
        branch,
        otherName,
        available,
        lastModified,
        createdBy,
        ...data
    } = usersMock[0];

    const rowData = {
        image: usersMock[0]?.profileImage,
        name: `${usersMock[0].firstName} ${usersMock[0].lastName} ${(usersMock[0].otherName !== null ? usersMock[0].otherName : "")}`,
        staffNumber: usersMock[0].staffNumber,
        title: usersMock[0].title.name,
        dutyStation: usersMock[0].branch?.name,
        // available: usersMock[0].available,
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

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.deactivate:

                setModalState(option as string)
                // setUser(filterCurrentUser(users, moduleID as string))
                handleOpen();
                break;
            case crudStates.update:
                setModalState(option as string)
                // setUser(filterCurrentUser(users, moduleID as string))
                handleOpen();
                break;
            case crudStates.read:
                navigate(`${ROUTES.PROFILE}/${moduleID}`)
                break;
            default:
                break
        }
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);


    const handleUsersTableData = (users: Array<IUser>) => {
        const data: Array<IUserTableData> = users.map((user, index) => {
            const {
                branch,
                department,
                lastModifiedBy,
                title,
                createdBy,
                profileImage,
                ...fielsdata
            } = users[index];

            return (
                {
                    ...fielsdata,
                    image: user?.profileImage,
                    name: `${user.firstName} ${user.lastName} ${(user.otherName !== null ? user.otherName : "")}`,
                    staffNumber: user.staffNumber,
                    title: user.title.name,
                    dutyStation: (user.branch?.name) as string,
                }
            )
        })

        setUsersTableData(data);
    }

    useEffect(() => {
        if (users.length > 0) { handleUsersTableData(users) }
    }, [users]);

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
        userFields,
        fetchAllUsers,
        handleOptionClicked,
        usersTableData
    })
}

export default UserUtils