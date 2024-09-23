import { Grid } from "@mui/material"
import AuditUtils from "./utils"
import TableComponent from "../../components/tables/TableComponent";
import { auditTrailsMock } from "../../mocks/trails";

const AuditTrails = () => {
    const { columnHeaders } = AuditUtils();
    const header = { plural: 'Audit Trails', singular: 'Audit Trail' };

    return (
        <Grid xs={12} container>
            {columnHeaders.length > 0 &&
                <TableComponent
                    exportData
                    header={header}
                    rows={auditTrailsMock}
                    columnHeaders={columnHeaders}
                />}
        </Grid>
    )
}

export default AuditTrails