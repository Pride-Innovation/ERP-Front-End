import { Route } from 'react-router'
import Inventory from '../../../pages/inventory'

const InventoryRoutes = () => {
  return (
    <Route>
      <Route index element={<Inventory />} />
    </Route>
  )
}

export default InventoryRoutes