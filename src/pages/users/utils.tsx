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
import { IUsersAxiosResponse, IUser, IUserTableData } from './interface';
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
import { AutocompleteContext } from '../../context/autocomplete';
import { UserContext } from '../../context/user/UserContext';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

const UserUtils = () => {
    const endPoint: string = "users";
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [count, setCount] = useState<number>(0)
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [usersTableData, setUsersTableData] = useState<Array<IUserTableData>>([] as Array<IUserTableData>);
    const dispatch = useDispatch<AppDispatch>();
    const { titles } = useSelector((state: RootState) => state.TitleStore);
    const { branches } = useSelector((state: RootState) => state.BranchStore);
    const { departments } = useSelector((state: RootState) => state.DepartmentStore)
    const { selectedItemDetails, value, setDisplayDepartment, displayDepartment } = useContext(AutocompleteContext)
    const { setUser, setTotalUsers } = useContext(UserContext);

    const [optionsObject, setOptionsObject] = useState<{
        titlesOptions: Array<IOptions>;
        branchesOptions: Array<IOptions>;
        departmentsOptions: Array<IOptions>;
    }>({
        titlesOptions: [],
        branchesOptions: [],
        departmentsOptions: [],
    });

    const { users } = useSelector((state: RootState) => state.UserStore);
    const navigate = useNavigate();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (titles.length > 0) {
            setOptionsObject({
                titlesOptions: titles?.map(title => ({ label: title.name, value: title.id as number })) || [],
                branchesOptions: branches?.map(branch => ({ label: branch.name, value: branch.id as number })) || [],
                departmentsOptions: departments?.map(department => ({ label: department.name, value: department.id as number })) || [],
            });
        }
    }, [titles, branches, departments]);

    useEffect(() => {
        if (selectedItemDetails.item === 'branch') {
            if (value?.value === 1) { setDisplayDepartment(true) }
            if (value?.value !== 1) { setDisplayDepartment(false) }
        }
    }, [selectedItemDetails]);


    const fetchAllUsers = async (params?: Record<string, any>) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IUsersAxiosResponse;
            if (response.status === 200) {
                setTotalUsers(response?.data?.totalElements as number)
                dispatch(loadUsers(response.data.content));
                setCount(response.data.totalElements)
            }

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const findUser = (id: number): IUser => {
        return users.find(user => user.id === id) as IUser;
    }


    const handleCreation = () => {
        navigate(ROUTES.CREATE_USER);
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
        email,
        otherName,
        availability,
        lastModified,
        enabled,
        createdBy,
        accountNonLocked,
        blocked,
        ...data
    } = usersMock[0];

    const rowData = {
        image: usersMock[0]?.profileImage,
        name: `${usersMock[0].firstName} ${usersMock[0].lastName} ${(usersMock[0].otherName !== null ? usersMock[0].otherName : "")}`,
        staffNumber: usersMock[0].staffNumber,
        email: usersMock[0].email,
        title: usersMock[0].title?.name,
        dutyStation: usersMock[0].branch?.name,
        availability: usersMock[0].availability,
        ...data,
        status: "",
        action: {
            label: "options",
            options: [
                { value: crudStates.disable, label: "Disable Account", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> },
                { value: crudStates.unblock, label: "Unblock", icon: <LockPersonOutlinedIcon fontSize='small' color='warning' /> },
                { value: crudStates.enable, label: "Enable", icon: <VpnKeyOutlinedIcon fontSize='small' color='success' /> },
            ]
        },
    };

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.disable:
                setModalState(option as string)
                setUser(findUser(moduleID as number))
                handleOpen();
                break;
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_USER}/${moduleID}`);
                break;
            case crudStates.read:
                navigate(`${ROUTES.PROFILE}/${moduleID}`)
                break;
            case crudStates.unblock:
                setModalState(option as string)
                setUser(findUser(moduleID as number))
                handleOpen();
                break;
            case crudStates.enable:
                setModalState(option as string)
                setUser(findUser(moduleID as number))
                handleOpen();
                break;
            default:
                break
        }
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    const determineUserStatus = (user: IUser): string => {
        let status: string;
        if (user.enabled === false) {
            return status = 'disabled'
        }
        if (user.accountNonLocked === false) {
            return status = "locked";
        }
        if (user.blocked) {
            return status = 'blocked'
        }
        if (user.enabled) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return status = 'active'
        }
        return "";
    }

    const determineDutyStation = (user: IUser) => {
        if (user.branch?.name === "Head Office") {
            return user.department?.name || "";
        } else {
            return user.branch?.name || "";
        }
    }


    /**
 * Determines if a user is available ('present') in the system
 * A user is considered 'present' only when ALL of the following conditions are met:
 * 1. Account is enabled (user.enabled === true)
 * 2. Account is not blocked (user.blocked === false)
 * 3. Account is not locked (user.accountNonLocked === true)
 * 
 * @param user The user object to evaluate
 * @returns 'present' if all conditions are met, otherwise 'absent'
 */
const determineUserAvailability = (user: IUser): string => {
    // Handle edge case of null/undefined user
    if (!user) return 'absent';
    
    const isEnabled = Boolean(user.enabled);
    const isNotBlocked = user.blocked === false || user.blocked === undefined;
    const isNotLocked = Boolean(user.accountNonLocked);
    
    // User is present only when all conditions are met
    return (isEnabled && isNotBlocked && isNotLocked) ? 'present' : 'absent';
};


    const handleUsersTableData = (users: Array<IUser>) => {
        const data: Array<IUserTableData> = users.map((user, index) => {
            const {
                branch,
                department,
                lastModifiedBy,
                title,
                createdBy,
                profileImage,
                ...fieldsData
            } = users[index];

            return (
                {
                    ...fieldsData,
                    image: user?.profileImage,
                    name: `${user.firstName} ${user.lastName} ${(user.otherName !== null ? user.otherName : "")}`,
                    staffNumber: user.staffNumber,
                    email: user.email,
                    title: user.title?.name as string,
                    dutyStation: determineDutyStation(user),
                    availability: determineUserAvailability(user),
                    // availability: user.availability, Update this value from the backend if user goes on leave, account is blocked or disabled
                    status: determineUserStatus(user)
                }
            )
        })

        setUsersTableData(data);
    }

    useEffect(() => {
        if (users.length > 0) { handleUsersTableData(users) }
    }, [users]);

    const generateUserFields = (): Array<IFormData<IUser>> => {

        const fields: Array<IFormData<IUser>> = [
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
                value: "otherName",
                label: 'Other Name',
                type: "input",
                required: false
            },
            {
                value: "email",
                label: 'Email address',
                type: "input"
            },
            {
                value: "title",
                label: 'Title',
                type: "autocomplete",
                options: optionsObject.titlesOptions
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
                value: "availability",
                label: 'Availability',
                type: "select",
                options: [
                    { label: "Present", value: "present" },
                    { label: "Absent", value: "absent" },
                ]
            },
            {
                value: "branch",
                label: 'Duty Station / Branch',
                type: "autocomplete",
                options: optionsObject.branchesOptions
            }

        ]

        if (displayDepartment) {
            fields.push({
                value: "department",
                label: 'Department',
                type: "autocomplete",
                options: optionsObject.departmentsOptions
            });
        }

        return fields;
    };

    return ({
        columnHeaders,
        handleCreation,
        setModalState,
        handleOpen,
        modalState,
        open,
        handleClose,
        userFields: generateUserFields(),
        fetchAllUsers,
        handleOptionClicked,
        usersTableData,
        loading,
        endPoint,
        count
    })
}

export default UserUtils;