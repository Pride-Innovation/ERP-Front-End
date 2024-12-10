import { usersMock } from '../../mocks/users';
import { useContext, useEffect, useState } from 'react';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { ITableHeader } from '../../components/tables/interface';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { UserContext } from '../../context/user/UserContext';
import { IUser, IUsersTableData } from './interface';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { crudStates } from '../../utils/constants';
import { IFormData } from '../assets/interface';

const UserUtils = () => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };


    const { setUsersTableData, users, setUsers } = useContext(UserContext);

    const {
        id,
        reportsTo,
        firstName,
        lastName,
        otherName,
        role,
        name,
        email,
        department,
        unit,
        image,
        ...data
    } = usersMock[0];

    const rowData = {
        image: usersMock[0].image,
        name,
        email,
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

    const handleUsers = (users: Array<IUser>) => {
        const data: Array<IUsersTableData> = users.map((user, index) => {
            const {
                reportsTo,
                firstName,
                lastName,
                otherName,
                ...data
            } = users[index];

            return (
                { ...data }
            )
        })

        setUsersTableData(data)

    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);


    const formatName = (name: string): Array<string> => {
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts[1];
        const otherNames = nameParts.slice(1, nameParts.length).join(" ");
        return [firstName, lastName, otherNames];
    }

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
            value: "otherName",
            label: 'Other Name',
            type: "input"
        },
        {
            value: "role",
            label: 'Role',
            type: "select",
            options: [
                { label: "Super Admin", value: "super_admin" },
                { label: "Admin", value: "admin" },
            ]
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
            value: "reportsTo",
            label: 'Reports To',
            type: "input"
        },
        {
            value: "department",
            label: 'Department',
            type: "select",
            options: [
                { label: "Business Technology", value: "1" },
                { label: "Legal Department", value: "2" },
                { label: "Credit Department", value: "3" },
            ]
        },
        {
            value: "unit",
            label: 'Unit',
            type: "select",
            options: [
                { label: "Innovation", value: "1" },
                { label: "Security", value: "2" },
            ]
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
            type: "input"
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
        handleUsers,
        removeUserFromTable,
        userFields,
        formatName
    })
}

export default UserUtils