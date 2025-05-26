import DetailSection from "../../../assets/trails/DetailSection";
import { IRequest } from "../../interface";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import moment from "moment";

const OtherDetails = ({ request }: { request: IRequest }) => {
    console.log(request, "request details!!")
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