import { assetStatus, requestStatus } from "../../utils/constants";

const TableUtills = () => {
    const determineTimeLineDotColor = (value: string) => {
        switch (value) {
            case requestStatus.approved:
            case assetStatus.use:
            case assetStatus.active:
                return 'green';
            case requestStatus.pending:
            case assetStatus.repair:
                return 'orange';
            case requestStatus.rejected:
            case assetStatus.disposed:
                return 'red';
            default:
                return 'blue';
        }
    };

    return {
        determineTimeLineDotColor,
    };
};

export default TableUtills;
