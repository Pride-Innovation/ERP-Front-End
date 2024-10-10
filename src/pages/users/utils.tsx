import { usersMock } from '../../mocks/users';
import { useContext, useEffect, useState } from 'react';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { ITableHeader } from '../../components/tables/interface';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { UserContext } from '../../context/user/UserContext';
import { IUsersTableData } from './interface';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { crudStates } from '../../utils/constants';

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


    const { setUsersTableData } = useContext(UserContext);

    const {
        id,
        reportsTo,
        firstName,
        lastName,
        otherName,
        email,
        image,
        ...data
    } = usersMock[0];

    const rowData = {
        image: usersMock[0].image,
        name: `${usersMock[0].firstName} ${usersMock[0].lastName} ${usersMock[0].otherName}`,
        ...data,
        action: {
            label: "options",
            options: [
                { value: "deactivate", label: "Deactivate", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: "read", label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    const handleUsers = () => {
        const data: Array<IUsersTableData> = usersMock.map((user, index) => {
            const {
                reportsTo,
                firstName,
                lastName,
                otherName,
                ...data
            } = usersMock[index];

            return (
                {
                    name: `${user.firstName} ${user.lastName} ${user.otherName}`,
                    ...data
                }
            )
        })

        setUsersTableData(data)

    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
        handleUsers();
    }, []);


    return ({
        columnHeaders,
        handleCreation,
        setModalState,
        handleOpen,
        modalState,
        open,
        handleClose
    })
}

export default UserUtils