/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { AppDispatch, RootState } from '../../store';
import { fetchRowsService } from '../../core/apis/globalService';
import { ROUTES } from '../../core/routes/routes';
import { crudStates } from '../../utils/constants';
import { ITableHeader } from '../../components/tables/interface';
import { MovementContext } from '../../context/movement/MovementContext';
import { loadAllMovements, removeMovement, updateMovement } from './slice';
import { findMovementByIdService } from './service';
import { IMovement, IMovementsAxiosResponse } from './interface';

const MovementUtills = () => {
    const endPoint = 'movements';
    const module = 'movement';
    const header = { plural: 'Movements', singular: 'Movement' };

    const [modalState, setModalState] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);
    const { currentMovement, setCurrentMovement, count, setCount } = useContext(MovementContext);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // ── Column headers for DataGrid ─────────────────────────────────────────
    const columnHeaders: Array<ITableHeader> = [
        { label: 'referenceNo', isText: true },
        { label: 'requestingOfficer', isText: true },
        { label: 'destination', isText: true },
        { label: 'destinationType', isText: true },
        { label: 'assetsCount', isText: true },
        { label: 'status', isStatus: true },
        { label: 'createDate', isText: true },
        {
            label: 'action',
            isAction: true,
            actionData: {
                label: 'action',
                options: [
                    { value: crudStates.read, label: 'View Details' },
                    { value: crudStates.update, label: 'Edit Movement' },
                    { value: crudStates.approve, label: 'Approve' },
                    { value: crudStates.reject, label: 'Reject' },
                    { value: 'release', label: 'Release Assets' },
                    { value: 'receive', label: 'Acknowledge Receipt' },
                    { value: crudStates.delete, label: 'Delete' },
                ],
            },
        },
    ];

    // ── Fetch paginated movements ────────────────────────────────────────────
    const fetchAllMovements = async (params?: Record<string, any>) => {
        setLoading(true);
        try {
            const response = (await fetchRowsService({
                pageNumber: 0,
                pageSize: params?.pageSize ?? 10,
                endPoint,
                params,
            })) as IMovementsAxiosResponse;

            if (response.status === 200) {
                dispatch(loadAllMovements(response.data.content));
                setCount(response.data.totalElements);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    // ── Table row shape ──────────────────────────────────────────────────────
    const buildMovementTableData = (items: IMovement[]) =>
        items.map(m => ({
            id: m.id,
            referenceNo: m.referenceNo ?? '—',
            requestingOfficer: m.requestingOfficer
                ? `${m.requestingOfficer.firstName} ${m.requestingOfficer.lastName}`
                : '—',
            destination: m.destination ?? '—',
            destinationType: m.destinationType ?? '—',
            assetsCount: m.assetsCount ?? 0,
            status: m.status?.name ?? '—',
            createDate: m.createDate
                ? new Date(m.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—',
            action: {
                label: 'action',
                options: [
                    { value: crudStates.read, label: 'View Details' },
                    { value: crudStates.update, label: 'Edit Movement' },
                    { value: crudStates.approve, label: 'Approve' },
                    { value: crudStates.reject, label: 'Reject' },
                    { value: 'release', label: 'Release Assets' },
                    { value: 'receive', label: 'Acknowledge Receipt' },
                    { value: crudStates.delete, label: 'Delete' },
                ],
            },
        }));

    // ── Option click handler (table popover) ─────────────────────────────────
    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        const movement = movements.find(m => m.id === moduleID);
        if (movement) setCurrentMovement(movement);

        switch (option) {
            case crudStates.read:
                navigate(`${ROUTES.READ_MOVEMENT}/${moduleID}`);
                break;
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_MOVEMENT}/${moduleID}`);
                break;
            case crudStates.approve:
                setModalState(crudStates.approve);
                handleOpen();
                break;
            case crudStates.reject:
                setModalState(crudStates.reject);
                handleOpen();
                break;
            case 'release':
                setModalState('release');
                handleOpen();
                break;
            case 'receive':
                setModalState('receive');
                handleOpen();
                break;
            case crudStates.delete:
                setModalState(crudStates.delete);
                handleOpen();
                break;
            default:
                break;
        }
    };

    // ── Delete from store ────────────────────────────────────────────────────
    const removeMovementFromStore = (movement: IMovement) => {
        dispatch(removeMovement(movement));
    };

    // ── Update in store ──────────────────────────────────────────────────────
    const updateMovementInStore = (movement: IMovement) => {
        dispatch(updateMovement(movement));
    };

    // ── Fetch single movement by ID ──────────────────────────────────────────
    const fetchMovementById = async (id: string | number): Promise<IMovement | null> => {
        try {
            const response = await findMovementByIdService(id) as any;
            if (response?.status === 200) return response.data as IMovement;
            return null;
        } catch {
            return null;
        }
    };

    return {
        endPoint,
        module,
        header,
        columnHeaders,
        modalState,
        setModalState,
        open,
        handleOpen,
        handleClose,
        loading,
        setLoading,
        sendingRequest,
        setSendingRequest,
        currentMovement,
        setCurrentMovement,
        count,
        movements,
        fetchAllMovements,
        buildMovementTableData,
        handleOptionClicked,
        removeMovementFromStore,
        updateMovementInStore,
        fetchMovementById,
    };
};

export default MovementUtills;
