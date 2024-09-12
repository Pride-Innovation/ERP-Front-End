import { Grid } from '@mui/material'
import TableComponent from '../../components/tables/TableComponent'
import { usersMock } from '../../mocks/users';
import { useEffect, useState } from 'react';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { ITableHeader } from '../../components/tables/interface';

const Users = () => {
  const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
  const {
    id,
    reportsTo,
    firstName,
    lastName,
    otherName,
    ...data
  } = usersMock[0];

  const addName = {
    name: `${usersMock[0].firstName} ${usersMock[0].lastName} ${usersMock[0].otherName}`,
    ...data
  };

  useEffect(() => {
    setColumnHeaders(getTableHeaders(addName))
  }, [])

  const users = usersMock.map((user, index) => {
    const { reportsTo, firstName, lastName, otherName, ...data } = usersMock[index];
    return (
      { name: `${user.firstName} ${user.lastName} ${user.otherName}`, ...data }
    )
  })
  return (
    <Grid xs={12} container>
      {columnHeaders.length > 0 && <TableComponent rows={users} columnHeaders={columnHeaders} />}
    </Grid>
  )
}

export default Users