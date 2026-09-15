/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box } from '@mui/material';
import TableComponent from '../../components/tables/TableComponent';
import useAccessScope from '../../core/permissions/useAccessScope';
import UserUtils from './utils';
import { UserContext } from '../../context/user/UserContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { crudStates } from '../../utils/constants';
import ModalComponent from '../../components/modal';
import DisableUser from './DisableUser';
import UnblockUser from './UnblockUser';
import EnableUser from './EnableUser';
import BlockUserAccount from './BlockUser';
import { IBulkUserData, IUser } from './interface';
import { toast } from 'react-toastify';
import { FileContext } from '../../context/file/FileContext';
import { bulkInsertUsersService } from './service';
import BulkImportResult, { IBulkImportResult } from './BulkImportResult';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { PERMISSIONS } from '../../core/permissions/constants';
import usePermissions from '../../core/permissions/usePermissions';
import { PageHero } from '../../components/layout';
import {
  fetchAllBranches,
  fetchAllDepartments,
  fetchAllRoles,
  fetchAllTitles,
  ReferenceOption,
} from './service/referenceData';
import { fetchRowsService } from '../../core/apis/globalService';
import TableUtills from '../../components/tables/utills';

/**
 * Hard cap for filter-aware export. Anything larger than this should be
 * narrowed via the filter UI before exporting — otherwise the browser
 * (and the resulting PDF/Excel) will choke.
 */
const EXPORT_MAX_ROWS = 10_000;

const Users = () => {
  /*
   * Whether this viewer reaches beyond their own duty station — the same question the server asks
   * before it narrows the directory. If the two drift, the page either hides a control somebody is
   * entitled to or offers one that answers differently than it reads.
   */
  const { scopeFor } = useAccessScope();
  const seesEveryBranch = scopeFor('ASSETS', 'VIEW') === 'ALL';

  /** Whether the Role filter can be offered at all — `GET /roles` answers to `READ_ROLE`. */
  const { has } = usePermissions();
  const canReadRoles = has(PERMISSIONS.READ_ROLE);

  const header = { plural: 'Users', singular: 'User' };
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const { user, totalUsers } = useContext(UserContext);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { fileData, setFileData } = useContext(FileContext);

  /** Result summary shown after a bulk import completes (success, partial, or all-failed). */
  const [importResult, setImportResult] = useState<IBulkImportResult | null>(null);

  /** Latest filter object that has been applied (already in backend-param shape). */
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  /** Reference data for filter dropdowns. Fetched once on mount. */
  const [titles, setTitles] = useState<ReferenceOption[]>([]);
  const [branches, setBranches] = useState<ReferenceOption[]>([]);
  const [departments, setDepartments] = useState<ReferenceOption[]>([]);
  const [roles, setRoles] = useState<ReferenceOption[]>([]);

  const {
    columnHeaders,
    handleCreation,
    modalState,
    open,
    handleClose,
    usersTableData,
    fetchAllUsers,
    handleOptionClicked,
    loading,
    endPoint,
    count,
    transformUsersForExport,
  } = UserUtils();

  const { generateExcelFromRows, generatePDFFromRows } = TableUtills({ moduleName: 'user', tableKey: 'users' });

  useEffect(() => { fetchAllUsers() }, []);

  /*
   * Four independent lookups, settled independently.
   *
   * This was `Promise.all`, which rejects on the **first** failure — so a 403 on `/roles` meant
   * titles, branches and departments were never set either, and every filter on the page came up
   * empty with nothing but a `console.warn` to say why. One refused call emptied four dropdowns.
   *
   * `/roles` is the one that refuses in practice: it needs `READ_ROLE`, which somebody granted
   * `READ_USER` to browse the directory has no reason to hold. The Role filter is simply not offered
   * to them now — see `columnFilters` — but the settle-independently change stands on its own: these
   * four have nothing to do with each other, and one being unavailable should cost only itself.
   */
  useEffect(() => {
    let cancelled = false;

    const load = async <T,>(
      fetcher: () => Promise<T[]>,
      apply: (value: T[]) => void,
      what: string,
    ) => {
      try {
        const value = await fetcher();
        if (!cancelled) apply(value);
      } catch (e) {
        // Not fatal, and not silent either: the filter it feeds is simply absent, and the reason is
        // in the console for whoever is wondering which permission is missing.
        console.warn(`Could not load ${what} for the filters`, e);
      }
    };

    load(fetchAllTitles, setTitles, 'titles');
    load(fetchAllBranches, setBranches, 'branches');
    load(fetchAllDepartments, setDepartments, 'departments');
    // Only asked for when the viewer may read roles — otherwise this is a guaranteed 403 for a
    // filter they will not be shown.
    if (canReadRoles) load(fetchAllRoles, setRoles, 'roles');

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReadRoles]);

  /**
   * Runs a query and remembers it, so turning a page can reissue the same one.
   *
   * Without this, paging rebuilt its request from scratch through the shared pagination path and
   * lost whatever the page had derived — here, the status chip's boolean flags.
   */
  const runQuery = (params: Record<string, any>) => {
    setActiveFilters(params);
    fetchAllUsers(params);
  };

  const handleStatusChange = (status: string) => {
    if (status === 'locked') {
      runQuery({ blocked: true });
      setSelectedStatus(status);
    } else if (status === 'active') {
      runQuery({ isEnabled: true, blocked: false, isAccountNonLocked: true });
      setSelectedStatus(status);
    } else if (status === 'disabled') {
      runQuery({ isEnabled: false });
      setSelectedStatus(status);
    } else {
      runQuery({});
      setSelectedStatus('all');
    }
  };

  /**
   * Translates the toolbar's flat filter object into params the backend understands.
   * - "status" column filter (active/disabled/locked) → boolean fields
   * - Date ranges arrive already flattened as createdAtFrom / createdAtTo ISO strings
   */
  const handleApplyFilters = (filters: Record<string, any>) => {
    const params: Record<string, any> = { ...filters };
    if (params.status) {
      const s = params.status as string;
      delete params.status;
      if (s === 'active') {
        params.isEnabled = true;
        params.blocked = false;
        params.isAccountNonLocked = true;
      } else if (s === 'disabled') {
        params.isEnabled = false;
      } else if (s === 'locked') {
        params.isAccountNonLocked = false;
      }
    }
    runQuery(params);
  };

  const bulkInsertUsers = async (users: Array<IBulkUserData>) => {
    try {
      const data = new FormData();
      data.append('users', JSON.stringify(users));

      const payload: any = await bulkInsertUsersService(data);

      if (!payload || typeof payload !== 'object' || !('inserted' in payload)) {
        toast.error('Bulk import request failed. Please try again.');
        return;
      }

      // Tolerate older payloads that returned `errors: string[]` by upgrading to
      // the structured shape the modal expects.
      const rawErrors = Array.isArray(payload.errors) ? payload.errors : [];
      const normalizedErrors = rawErrors.map((e: any, idx: number) =>
        typeof e === 'string'
          ? { row: idx + 1, error: e }
          : {
            row: typeof e.row === 'number' ? e.row : idx + 1,
            name: e.name ?? null,
            staffNumber: e.staffNumber ?? null,
            email: e.email ?? null,
            error: e.error ?? 'Unknown error',
          }
      );

      const result: IBulkImportResult = {
        success: Boolean(payload.success),
        total: Number(payload.total ?? users.length),
        inserted: Number(payload.inserted ?? 0),
        failed: Number(payload.failed ?? normalizedErrors.length),
        errors: normalizedErrors,
      };

      setImportResult(result);

      if (result.inserted > 0) {
        toast.success(
          result.failed === 0
            ? `Imported ${result.inserted} user${result.inserted === 1 ? '' : 's'} successfully.`
            : `Imported ${result.inserted} of ${result.total} users. ${result.failed} failed — see details.`
        );
        fetchAllUsers();
      } else {
        toast.error('Bulk import failed — no users were created. See details.');
      }
    } catch (error) {
      console.error('Bulk Insert Error', error);
      toast.error('Bulk import request failed. Please try again.');
    } finally {
      // Clear the FileContext so re-uploading the same file re-runs the import.
      setFileData({} as any);
    }
  };

  useEffect(() => {
    if (fileData?.jsonData?.length > 0 && fileData?.module === 'user') {
      bulkInsertUsers(fileData.jsonData as unknown as Array<IBulkUserData>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData]);

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    []
  );

  /**
   * Builds the "Applied Filters" list shown on the export cover/header.
   * Resolves IDs (titleId/branchId/etc.) back to labels via the reference
   * lookups loaded on mount.
   */
  const buildFilterSummary = (): Array<{ label: string; value: string }> => {
    const out: Array<{ label: string; value: string }> = [];
    const f = activeFilters;
    if (f.firstName) out.push({ label: 'First Name', value: String(f.firstName) });
    if (f.lastName) out.push({ label: 'Last Name', value: String(f.lastName) });
    if (f.email) out.push({ label: 'Email', value: String(f.email) });
    if (f.staffNumber) out.push({ label: 'Staff Number', value: String(f.staffNumber) });
    if (f.gender) out.push({ label: 'Gender', value: String(f.gender) });
    if (f.titleId != null) {
      const t = titles.find(x => x.value === Number(f.titleId));
      out.push({ label: 'Title', value: t?.label ?? `#${f.titleId}` });
    }
    if (f.branchId != null) {
      const b = branches.find(x => x.value === Number(f.branchId));
      out.push({ label: 'Duty Station', value: b?.label ?? `#${f.branchId}` });
    }
    if (f.departmentId != null) {
      const d = departments.find(x => x.value === Number(f.departmentId));
      out.push({ label: 'Department', value: d?.label ?? `#${f.departmentId}` });
    }
    if (f.roleId != null) {
      const r = roles.find(x => x.value === Number(f.roleId));
      out.push({ label: 'Role', value: r?.label ?? `#${f.roleId}` });
    }
    if (f.isEnabled === true && f.blocked === false && f.isAccountNonLocked === true) {
      out.push({ label: 'Status', value: 'Active' });
    } else if (f.isEnabled === false) {
      out.push({ label: 'Status', value: 'Disabled' });
    } else if (f.isAccountNonLocked === false || f.blocked === true) {
      out.push({ label: 'Status', value: 'Locked' });
    }
    if (f.createdAtFrom || f.createdAtTo) {
      const from = f.createdAtFrom ? new Date(f.createdAtFrom).toLocaleDateString('en-GB') : '…';
      const to = f.createdAtTo ? new Date(f.createdAtTo).toLocaleDateString('en-GB') : '…';
      out.push({ label: 'Date Created', value: `${from} → ${to}` });
    }
    return out;
  };

  /**
   * Filter-aware export. When at least one filter is active, fetches the FULL
   * filtered result-set from the backend (one round-trip capped at
   * EXPORT_MAX_ROWS) and exports that. Otherwise falls back to the rows
   * currently displayed in the table.
   */
  const handleExport = async (format: 'pdf' | 'excel') => {
    const hasFilters = Object.keys(activeFilters).length > 0;
    const meta = { filters: buildFilterSummary() };

    if (!hasFilters) {
      if (format === 'excel') generateExcelFromRows(usersTableData, meta);
      else generatePDFFromRows(usersTableData, meta);
      return;
    }

    try {
      const response: any = await fetchRowsService({
        pageNumber: 0,
        pageSize: EXPORT_MAX_ROWS,
        endPoint,
        params: activeFilters,
      });

      const content: IUser[] = response?.data?.content ?? [];
      if (content.length === 0) {
        toast.info('No records match the current filters.');
        return;
      }
      if (content.length >= EXPORT_MAX_ROWS) {
        toast.warning(`Export capped at ${EXPORT_MAX_ROWS.toLocaleString()} rows — narrow your filters for the full set.`);
      }

      const rows = transformUsersForExport(content);
      if (format === 'excel') generateExcelFromRows(rows, meta);
      else generatePDFFromRows(rows, meta);
    } catch (e) {
      console.error('Export failed', e);
      toast.error('Failed to fetch records for export.');
    }
  };

  /** Status select options (display values map to backend booleans in handleApplyFilters). */
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'locked', label: 'Locked' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <PageHero
        title="Users Management"
        subtitle="Manage system access and user accounts"
        icon={<PeopleOutlinedIcon />}
        stat={{
          value: (totalUsers ?? 0).toLocaleString(),
          label: 'records',
          helper: todayLabel,
        }}
      />

      {modalState === crudStates.disable && (
        <ModalComponent title="Disable User Account" open={open} handleClose={handleClose} width="40%">
          <DisableUser
            setSendingRequest={setSendingRequest}
            user={user}
            handleClose={handleClose}
            buttonText="Disable"
            sendingRequest={false}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.block && (
        <ModalComponent title="Block User Account" open={open} handleClose={handleClose} width="40%">
          <BlockUserAccount
            sendingRequest={sendingRequest}
            user={user}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            buttonText="Block Account"
          />
        </ModalComponent>
      )}
      {modalState === crudStates.unblock && (
        <ModalComponent title="Unblock User Account" open={open} handleClose={handleClose} width="40%">
          <UnblockUser
            sendingRequest={sendingRequest}
            user={user}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            buttonText="Unblock"
          />
        </ModalComponent>
      )}
      {modalState === crudStates.enable && (
        <ModalComponent title="Enable User Account" open={open} handleClose={handleClose} width="60%">
          <EnableUser
            sendingRequest={sendingRequest}
            user={user}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            buttonText="Enable"
          />
        </ModalComponent>
      )}

      {importResult && (
        <ModalComponent
          title="Bulk Import Summary"
          open={true}
          handleClose={() => setImportResult(null)}
          width="60%"
        >
          <BulkImportResult result={importResult} handleClose={() => setImportResult(null)} />
        </ModalComponent>
      )}

      {columnHeaders.length > 0 && (
        <Box sx={{ px: { xs: 0, md: 0 } }}>
          <TableComponent
                tableKey="users"
            endPoint={endPoint}
            loading={loading}
            count={count}
            exportData
            createAction
            importData
            module="user"
            header={header}
            rows={usersTableData}
            columnHeaders={columnHeaders}
            onCreationHandler={handleCreation}
            createPermission={PERMISSIONS.CREATE_USER}
            handleOptionClicked={handleOptionClicked}
            paginationMode="server"
            refresh
            filterMode="server"
            status
            onStatusChange={handleStatusChange}
            selectedStatus={selectedStatus}
            onExport={handleExport}
            columnFilters={[
              { key: 'firstName', label: 'First Name', type: 'text' },
              { key: 'lastName', label: 'Last Name', type: 'text' },
              { key: 'email', label: 'Email', type: 'text' },
              { key: 'staffNumber', label: 'Staff Number', type: 'text' },
              { key: 'titleId', label: 'Title', type: 'select', options: titles },
              /*
               * Offered only to somebody who can actually look beyond their own branch.
               *
               * `GET /users` *silently substitutes* the caller's own branch below ALL scope — the
               * right behaviour for a directory, where an unasked-for branch parameter is routine.
               * But the control did not know that, so picking "Head Office" returned **your own
               * branch's staff under a Head Office label**: a filter that appears to work and
               * quietly answers a different question, which is worse than one that refuses.
               *
               * The store page's branch picker was gated for the same reason.
               */
              ...(seesEveryBranch
                ? [{ key: 'branchId', label: 'Duty Station', type: 'select' as const, options: branches }]
                : []),
              { key: 'departmentId', label: 'Department', type: 'select', options: departments },
              /*
               * Offered only to somebody who may read roles.
               *
               * `GET /roles` needs `READ_ROLE`, and a person granted `READ_USER` to browse the staff
               * directory has no reason to hold it — so this filter was a guaranteed 403 and, because
               * the four lookups shared a `Promise.all`, it took the other three dropdowns down with
               * it. A page should not require a second administrative permission to render its own
               * filters.
               */
              ...(canReadRoles
                ? [{ key: 'roleId', label: 'Role', type: 'select' as const, options: roles }]
                : []),
              {
                key: 'gender', label: 'Gender', type: 'select', options: [
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ],
              },
              { key: 'status', label: 'Status', type: 'select', options: statusOptions },
              { key: 'createdAt', label: 'Date Created', type: 'dateRange' },
            ]}
            onApplyFilters={handleApplyFilters}
            // Paging reissues the query in force, so the status chip's flags and any column filters
            // survive past page one.
            onPaginationChange={({ page, pageSize }) => fetchAllUsers(activeFilters, page, pageSize)}
            searchKey="name"
            tableIcon={<PeopleOutlinedIcon sx={{ fontSize: 18, color: '#08796C' }} />}
          />
        </Box>
      )}
    </Box>
  );
};

export default Users;
