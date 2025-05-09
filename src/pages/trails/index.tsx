/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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