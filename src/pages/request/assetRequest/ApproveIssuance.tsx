/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { approveIssueRequestService, findAssetRequestByIDService } from "./service";
import { ICommodity } from "../../settings/commodity/interface";
import { IApproveIssuance, IRequestAxiosResponse } from "../interface";
import RequestUtills from "./utills";
import { RequestContext } from "../../../context/request/RequestContext";
import { AppDispatch, RootState } from "../../../store";
import { updateRequest } from "./slice";
import RequestActionLayout from "./RequestActionLayout";
import { statusIdByCode } from "../../../utils/helpers";

const PRIMARY = '#08796C';

const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const ApproveIssuance = ({
    setSendingRequest,
    handleClose,
    request,
    sendingRequest,
    buttonText = "Approve Issuance",
}: IApproveIssuance) => {
    const { fetchIssuanceByRequestId } = RequestUtills();
    const { currentIssuance } = useContext(RequestContext);
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const dispatch = useDispatch<AppDispatch>();
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

    useEffect(() => {
        if (request?.id) {
            fetchIssuanceByRequestId(request.id as number);
        }
    }, [request]);

    const handleIssuanceApproval = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before approving.");
            return;
        }

        setSendingRequest(true);
        try {
            /**
             * The status id is resolved from the stable "issuanceApproved" code (seeded ids vary
             * by environment). Only consumed by the backend legacy (non-workflow) path; in workflow
             * mode the engine sets the status itself.
             */
            const data = {
                requestId: request.id,
                statusId: statusIdByCode(statuses, 'issuanceApproved'),
                comment,
                issuanceId: currentIssuance?.id,
            }

            const response = await approveIssueRequestService(data) as IRequestAxiosResponse;
            if (response.status === 201) {
                toast.success("Issuance approved successfully.");
                dispatch(updateRequest(response.data));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve issuance. Please try again.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    const issueDate = formatDate(currentIssuance?.createDate);
    const issuerName = currentIssuance?.issuer
        ? `${currentIssuance.issuer.firstName} ${currentIssuance.issuer.lastName}`
        : 'Unknown';

    return (
        <RequestActionLayout
            request={request}
            accent={PRIMARY}
            icon={<LocalShippingOutlinedIcon />}
            kicker="Issuance approval"
            metaLines={[
                { label: 'Issued', value: issueDate },
                { label: 'By', value: issuerName },
            ]}
            banner={{
                severity: 'info',
                title: "Confirm that all items have been properly issued.",
                body: "This approval will allow the requester to acknowledge receipt of the items.",
            }}
            loading={loading}
            commodities={requestCommodities}
            itemsSectionTitle="Issued Items"
            additionalNote={currentIssuance?.comment ? { label: 'Issuer comment', body: currentIssuance.comment } : null}
            commentLabel="Approval comment"
            commentPlaceholder="Add your comments regarding this issuance approval…"
            commentHelper="The comment is required and becomes part of the approval trail."
            comment={comment}
            onCommentChange={setComment}
            footerNote="Verify all items were correctly issued before approving."
            buttonText={buttonText}
            buttonIcon={<CheckCircleOutlineIcon />}
            sendingRequest={sendingRequest}
            onSubmit={handleIssuanceApproval}
            handleClose={handleClose}
        />
    );
};

export default ApproveIssuance;
