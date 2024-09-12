import { Grid } from '@mui/material'
import TableComponent from '../../components/tables/TableComponent'
import { usersMock } from '../../mocks/users';

const Users = () => {
  const { id, reportsTo, firstName, lastName, otherName, ...data } = usersMock[0];

  const columnHeaders: Array<string> = Object.keys(
    { name: `${usersMock[0].firstName} ${usersMock[0].lastName} ${usersMock[0].otherName}`, ...data });

  const users = usersMock.map((user, index) => {
    const { reportsTo, firstName, lastName, otherName, ...data } = usersMock[index];
    return (
      { name: `${user.firstName} ${user.lastName} ${user.otherName}`, ...data }
    )
  })
  return (
    <Grid xs={12} container>
      <TableComponent rows={users} columnHeaders={columnHeaders} />
    </Grid>
  )
}

export default Users