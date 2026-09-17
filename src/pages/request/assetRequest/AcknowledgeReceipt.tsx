/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { IAcknowledegeReceipt, IRequestAxiosResponse } from "../interface";
import { ICommodity } from "../../settings/commodity/interface";
import { acknowledgeIssuanceService, findAssetRequestByIDService } from "./service";
import { AppDispatch, RootState } from "../../../store";
import { updateRequest } from "./slice";
import RequestActionLayout from "./RequestActionLayout";
import { statusIdByCode } from "../../../utils/helpers";

const PRIMARY = '#08796C';

const AcknowledgeReceipt = ({
    request,
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText = "Acknowledge Receipt"
}: IAcknowledegeReceipt) => {
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
            toast.error("Please provide a comment before acknowledging receipt.");
            return;
        }

        setSendingRequest(true);
        try {
            /**
             * The status id is resolved from the stable "receiptAcknowledged" code (seeded ids vary
             * by environment). Only consumed by the backend legacy (non-workflow) path; in workflow
             * mode the engine sets the status itself.
             */
            const data = {
                requestId: request.id,
                statusId: statusIdByCode(statuses, 'receiptAcknowledged'),
                comment
            }

            const response = await acknowledgeIssuanceService(data) as IRequestAxiosResponse;
            if (response.status === 201) {
                toast.success("Item Receipt Acknowledged Successfully.");
                dispatch(updateRequest(response.data));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to acknowledge receipt. Please try again.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    return (
        <RequestActionLayout
            request={request}
            accent={PRIMARY}
            icon={<DoneAllIcon />}
            kicker="Receipt acknowledgement"
            banner={{
                severity: 'success',
                title: "Confirm that you've received all requested items.",
                body: "Acknowledging marks this request as completed in the system.",
            }}
            loading={loading}
            commodities={requestCommodities}
            commentLabel="Receipt comment"
            commentPlaceholder="Add any comments about the received items…"
            commentHelper="The comment is required to confirm receipt of the items."
            comment={comment}
            onCommentChange={setComment}
            footerNote="Confirm all items have been received as requested."
            buttonText={buttonText || "Acknowledge Receipt"}
            buttonIcon={<CheckCircleOutlineIcon />}
            sendingRequest={sendingRequest}
            onSubmit={handleRequestAcknowledgement}
            handleClose={handleClose}
        />
    );
};

export default AcknowledgeReceipt;
