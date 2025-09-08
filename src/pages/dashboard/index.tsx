import { useEffect, useState } from 'react';
import RoutesUtills from '../../core/routes/utills';
import AdminDashboard from './dashboardUsers/AdminDashBoard';
import { ITitle } from '../settings/titles/interface';
import BranchOperationsManager from './dashboardUsers/BranchOperationsManager';
import GeneralDashBoard from './dashboardUsers/GeneralDashBoard';

const SUPER_ADMIN = "SUPER_ADMIN";
const ADMIN_OFFICER = "Admin Officer";
const ADMIN_MANAGER = "Admin Manager";
const BRANCH_MANAGER = "Branch Manager";
const BRANCH_OPERATIONS_MANAGER = "Branch Operations Manager";

// const OFFICER = "Officer";
// const MANAGER = "Manager";

const Dashboard = () => {
  const { getCurrentUser } = RoutesUtills();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const title = getCurrentUser()?.title as unknown as ITitle;
    const role = title?.role?.name;
    setRole(role || "");
  }, []);

  return role === SUPER_ADMIN
    || role === ADMIN_MANAGER
    || role === ADMIN_OFFICER ? (
    <AdminDashboard />
  ) : role === BRANCH_OPERATIONS_MANAGER
    || role === BRANCH_MANAGER ? (
    <BranchOperationsManager />
  ) : <GeneralDashBoard />;
};

export default Dashboard;