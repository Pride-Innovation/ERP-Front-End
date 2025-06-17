/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Button,
  Card,
  Grid,
  Stack
} from '@mui/material';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router';
import { useEffect, useState } from 'react';
import { INavigation } from './interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AssetTypeUtills from '../settings/assetTypes/utills';
import AssetUtills from './Utills';

const AssetsManagement = () => {
  const [path, setPath] = useState<string>("");
  const [navigations, setNavigations] = useState<INavigation[]>([] as INavigation[]);
  const { id } = useParams<{ id: string }>();
  const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
  const { pathname } = useLocation();
  const {determineAssetTypeByAssetName} = AssetUtills();

  const navigate = useNavigate();
  const { fetchAllAssetTypes } = AssetTypeUtills();

  useEffect(() => { fetchAllAssetTypes() }, []);
  useEffect(() => { setPath(pathname) }, [pathname]);

  const determineNavigation = () => {
    const data = assetTypes.map(assetType => determineAssetTypeByAssetName(assetType)) as Array<INavigation>
    setNavigations(data);
  }

  useEffect(() => { if (assetTypes.length > 0) { determineNavigation() } }, [assetTypes])

  const determineActivePath = (item: INavigation): boolean => {
    if (path === `${item.otherRoutes[1]}/${id}`) return true;
    if (path === `${item.path}/${id}`) return true;
    return [item.path, ...item.otherRoutes].includes(path)
  }

  return (
    <>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid xs={12} container>
          <Stack direction="row" spacing={1}>
            {navigations.length > 0 && navigations.map(item => (
              <>
                {/* {determinePermission(item?.permission as IPermission) &&  */}
                <Button
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  key={item.id}
                  variant={determineActivePath(item) ? "contained" : "outlined"}
                >
                  {item.text}
                </Button>
                {/* } */}
              </>
            ))}
          </Stack>
        </Grid>
      </Card>
      <Outlet />
    </>
  )
}

export default AssetsManagement