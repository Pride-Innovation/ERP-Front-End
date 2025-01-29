import { IRequest, ITransportRequest } from './interface';

const GlobalRequestUtill = () => {
    const isIRequest = (request: IRequest | ITransportRequest): request is IRequest => {
        return (request as IRequest).description !== undefined;
    };

    const isITransportRequest = (request: IRequest | ITransportRequest): request is ITransportRequest => {
        return (request as ITransportRequest).timeVehicleIsRequired !== undefined;
    };

    return ({ isIRequest, isITransportRequest })
}

export default GlobalRequestUtill;