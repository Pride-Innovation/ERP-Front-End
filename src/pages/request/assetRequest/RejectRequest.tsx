/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {
    assetRequestApprovalRejectionService,
    findAssetRequestByIDService
} from "./service";
import RoutesUtills from "../../../core/routes/utills";
import { ICommodity } from "../../settings/commodity/interface";
import { IRejectRequest, IRequestAxiosResponse } from "../interface";
import RequestActionLayout from "./RequestActionLayout";

const DANGER = '#B91C1C';

const RejectRequest = ({
    setSendingRequest,
    handleClose,
    request,
    sendingRequest,
    buttonText = "Reject Request",
}: IRejectRequest) => {
    const { getCurrentUser } = RoutesUtills();
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);

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

    const handleRequestRejection = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before rejecting.");
            return;
        }

        const loggedInUser = getCurrentUser();
        if (
            loggedInUser?.id &&
            request.requester?.id &&
            String(loggedInUser.id) === String(request.requester.id)
        ) {
            toast.error("You cannot reject your own request.");
            return;
        }

        setSendingRequest(true);
        try {
            const data = {
                requestId: request.id,
                approverId: request.currentApprover?.id,
                workflowAction: "REJECTED",
                comment
            }
            const response = await assetRequestApprovalRejectionService(data) as IRequestAxiosResponse;
            if (response.status === 201) {
                toast.success("Request has been rejected.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject request. Please try again.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    return (
        <RequestActionLayout
            request={request}
            accent={DANGER}
            icon={<CancelOutlinedIcon />}
            kicker="Request rejection"
            actingLabel="You are rejecting as"
            banner={{
                severity: 'error',
                title: "You are about to reject this request.",
                body: "The requester will be notified with your reason, and this action cannot be undone.",
            }}
            loading={loading}
            commodities={requestCommodities}
            commentLabel="Rejection reason"
            commentPlaceholder="Explain why this request is being rejected…"
            commentHelper="The reason is required and will be visible to the requester."
            comment={comment}
            onCommentChange={setComment}
            footerNote="This action cannot be undone."
            buttonText={buttonText || "Reject Request"}
            buttonIcon={<CancelOutlinedIcon />}
            sendingRequest={sendingRequest}
            onSubmit={handleRequestRejection}
            handleClose={handleClose}
        />
    );
};

export default RejectRequest;
