/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IRequest, ITransportRequest } from './interface';

const GlobalRequestUtill = () => {
    const isIRequest = (request: IRequest | ITransportRequest): request is IRequest => {
        return (request as IRequest).commodities !== undefined;
    };

    const isITransportRequest = (request: IRequest | ITransportRequest): request is ITransportRequest => {
        return (request as ITransportRequest).timeVehicleIsRequired !== undefined;
    };

    return ({ isIRequest, isITransportRequest })
}

export default GlobalRequestUtill;