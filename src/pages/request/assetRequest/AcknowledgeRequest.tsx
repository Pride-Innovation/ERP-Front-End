/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import {
    IAcknowledegeRequest,
    IRequestAxiosResponse
} from "../interface"
import { ICommodity } from "../../settings/commodity/interface";
import {
    acknowledgeRequestService,
    findAssetRequestByIDService
} from "./service";
import { AppDispatch, RootState } from "../../../store";
import { updateRequest } from "./slice";
import RequestActionLayout from "./RequestActionLayout";
import { statusIdByCode } from "../../../utils/helpers";

const PRIMARY = '#08796C';

const AcknowledgeRequest = ({
    request,
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText = "Acknowledge Request"
}: IAcknowledegeRequest) => {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const dispatch = useDispatch<AppDispatch>();

    const fetchRequestCommodities = async () => {
        setLoading(true);
        try {
            const response = (await findAssetRequestByIDService(
                request.id as number
            )) as IRequestAxiosResponse;

            if (
                response.status === 200 &&
                (response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>)?.length > 0
            ) {
                setRequestCommodities(response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>);
            } else {
                setRequestCommodities([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load commodities.");
            setRequestCommodities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestCommodities();
    }, []);

    const handleRequestAcknowledgement = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before approving.");
            return;
        }

        setSendingRequest(true);
        try {
            /**
             * The status id is resolved from the stable "unitAcknowledged" code (seeded ids vary
             * by environment). Only consumed by the backend legacy (non-workflow) path; in workflow
             * mode the engine sets the status itself.
             */
            const data = {
                requestId: request.id,
                statusId: statusIdByCode(statuses, 'unitAcknowledged'),
                comment
            }

            const response = await acknowledgeRequestService(data) as IRequestAxiosResponse;

            if (response.status === 201) {
                toast.success("Request acknowledged successfully.");
                dispatch(updateRequest(response.data));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to acknowledge request.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    return (
        <RequestActionLayout
            request={request}
            accent={PRIMARY}
            icon={<ThumbUpOffAltIcon />}
            kicker="Request acknowledgement"
            actingLabel="Current approver"
            loading={loading}
            commodities={requestCommodities}
            commentLabel="Acknowledgement comment"
            commentPlaceholder="Add a comment for acknowledging this request…"
            commentHelper="The comment is required and becomes part of the request's history."
            comment={comment}
            onCommentChange={setComment}
            footerNote="Review the request details before acknowledging."
            buttonText={buttonText}
            buttonIcon={<ThumbUpOffAltIcon />}
            sendingRequest={sendingRequest}
            onSubmit={handleRequestAcknowledgement}
            handleClose={handleClose}
        />
    );
};

export default AcknowledgeRequest;
