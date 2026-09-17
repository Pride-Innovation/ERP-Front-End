/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
    assetRequestApprovalRejectionService,
    findAssetRequestByIDService
} from "./service";
import RoutesUtills from "../../../core/routes/utills";
import { ICommodity } from "../../settings/commodity/interface";
import { IApproveRequest, IRequestAxiosResponse } from "../interface";
import RequestActionLayout from "./RequestActionLayout";

const PRIMARY = '#08796C';

const ApproveRequest = ({
    setSendingRequest,
    handleClose,
    request,
    sendingRequest,
    buttonText = "Approve Request",
}: IApproveRequest) => {
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

    const handleRequestApproval = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before approving.");
            return;
        }

        const loggedInUser = getCurrentUser();
        if (
            loggedInUser?.id &&
            request.requester?.id &&
            String(loggedInUser.id) === String(request.requester.id)
        ) {
            toast.error("You cannot approve your own request.");
            return;
        }

        setSendingRequest(true);
        try {
            const data = {
                // The actor is whoever is signed in, not the request's `currentApprover`. The
                // backend records this id as the step actor and checks it against the requester
                // for self-approval, so sending the request's own field credited the wrong person
                // — and sent nothing at all when the request had no approver assigned.
                requestId: request.id,
                approverId: loggedInUser?.id,
                workflowAction: "APPROVED",
                comment
            }
            const response = await assetRequestApprovalRejectionService(data) as IRequestAxiosResponse;
            if (response.status === 201) {
                toast.success("Request has been Approved.");
                handleClose();
            } else {
                // Leave the modal open on failure so the typed comment survives and the user can
                // retry — closing regardless used to make a rejected call look like a success.
                toast.error("Failed to approve request. Please try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve request. Please try again.");
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <RequestActionLayout
            request={request}
            accent={PRIMARY}
            icon={<CheckCircleOutlineIcon />}
            kicker="Request approval"
            actingLabel="You are approving as"
            loading={loading}
            commodities={requestCommodities}
            commentLabel="Approval comment"
            commentPlaceholder="Add your comments regarding this approval…"
            commentHelper="The comment is required and becomes part of the approval trail."
            comment={comment}
            onCommentChange={setComment}
            footerNote="Review all details before approving."
            buttonText={buttonText}
            buttonIcon={<CheckCircleOutlineIcon />}
            sendingRequest={sendingRequest}
            onSubmit={handleRequestApproval}
            handleClose={handleClose}
        />
    );
};

export default ApproveRequest;
