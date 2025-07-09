import DetailSection from "../../../assets/trails/DetailSection";
import { IRequest } from "../../interface";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import moment from "moment";
import { IAcknowledgeIssuanceReceipt, IIssue } from "../issue/interface";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

const OtherDetails = ({
    request,
    acknowledgeIssuance,
    acknowledgeRequest,
    issuanceApproval,
    issuance
}:
    { request: IRequest }
    & {
        acknowledgeIssuance?: IAcknowledgeIssuanceReceipt,
        acknowledgeRequest?: IAcknowledgeIssuanceReceipt,
        issuanceApproval?: IAcknowledgeIssuanceReceipt,
        issuance?: IIssue
    }) => {
    return (
        <>
            {request.requester && <DetailSection
                text={`${request.requester.firstName} ${request.requester.lastName}`}
                label="Requested By"
                icon={<AccountCircleOutlinedIcon />} />}
            {request.currentApprover && <DetailSection
                text={`${request.currentApprover?.firstName} ${request.currentApprover.lastName}`}
                label="Current Approver"
                icon={<SupervisedUserCircleOutlinedIcon />} />}
            {acknowledgeRequest?.user?.firstName && <DetailSection
                label="Request Acknowledged By (Admin)"
                icon={<ThumbUpOffAltIcon color="secondary" />}
                text={`${acknowledgeRequest.user.firstName} ${acknowledgeRequest.user.lastName}`} />
            }
            {issuance?.issuer?.firstName && <DetailSection
                label="Issued By (Admin)"
                icon={<ThumbUpOffAltIcon color="secondary" />}
                text={`${issuance.issuer.firstName} ${issuance.issuer.lastName}`} />
            }
            {issuanceApproval?.user?.firstName && <DetailSection
                label="Issuance Approved By (Admin)"
                icon={<ThumbUpOffAltIcon color="secondary" />}
                text={`${issuanceApproval.user.firstName} ${issuanceApproval.user.lastName}`} />
            }
            {acknowledgeIssuance?.user?.firstName && <DetailSection
                label="Issuance Acknowledged By"
                icon={<ThumbUpOffAltIcon color="primary" />}
                text={`${acknowledgeIssuance.user.firstName} ${acknowledgeIssuance.user.lastName}`} />
            }

            {request.createDate && <DetailSection text={
                moment(request.createDate).format('Do MMMM YYYY, h:mm')
            } label="Request Date" icon={<TodayOutlinedIcon />} />}
            {request.lastModified && <DetailSection text={
                moment(request.lastModified).format('Do MMMM YYYY, h:mm')
            } label="Last Updated Date" icon={<TodayOutlinedIcon />} />}
        </>
    )
};

export default OtherDetails;