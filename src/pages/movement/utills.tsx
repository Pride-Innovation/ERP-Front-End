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
import { MovementContext } from '../../context/movement/MovementContext';
import { loadAllMovements, removeMovement, updateMovement } from './slice';
import { findMovementByIdService } from './service';
import { IMovement, IMovementsAxiosResponse } from './interface';

/** Modal states for the movement lifecycle action dialogs. */
export const movementActions = {
    dispatch: 'dispatch',
    inTransit: 'in-transit',
    receive: 'receive',
    complete: 'complete',
    cancel: 'cancel',
} as const;

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

    // ── Fetch paginated movements ────────────────────────────────────────────
    const fetchAllMovements = async (params?: Record<string, any>) => {
        setLoading(true);
        try {
            const response = (await fetchRowsService({
                pageNumber: params?.pageNumber ?? 0,
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

    // ── Open a lifecycle action modal for a movement ─────────────────────────
    const openAction = (action: string, movement: IMovement) => {
        setCurrentMovement(movement);
        setModalState(action);
        handleOpen();
    };

    const viewMovement = (movement: IMovement) => {
        setCurrentMovement(movement);
        navigate(`${ROUTES.READ_MOVEMENT}/${movement.id}`);
    };

    const removeMovementFromStore = (movement: IMovement) => {
        dispatch(removeMovement(movement));
    };

    const updateMovementInStore = (movement: IMovement) => {
        dispatch(updateMovement(movement));
    };

    const fetchMovementById = async (id: string | number): Promise<IMovement | null> => {
        try {
            const response = (await findMovementByIdService(id)) as any;
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
        openAction,
        viewMovement,
        removeMovementFromStore,
        updateMovementInStore,
        fetchMovementById,
    };
};

export default MovementUtills;
