import { Card, Grid, Stack } from '@mui/material';
import DahboardCard from './DahboardCard';
import Laptop from "../../statics/images/icons8-laptop-50.png";
import Furniture from "../../statics/images/icons8-furniture-50.png";
import Computer from "../../statics/images/icons8-computer-48.png";
import Monitor from "../../statics/images/icons8-monitor-50.png";
import Printer from "../../statics/images/icons8-printer-96.png";
import DashboardRequests from './DashboardRequests';

const Dashboard = () => {

  /**
   * 
   * TO DO
   * 
   * The top section should show a report on the remaining stock for each catergory.
   * 
   * Below it on the Left we should show pending requests. For individuals, 
   * It should show their pending requests. If they do not have pending requests, then
   * we should display a list of assets assigned to them.
   * 
   * For admin, it should show all the requests for different branches.
   * 
   * On the right, we will have a pie chart showing percentage of each asset.
   * 
   * Below, we will have asset due for disposal.
   * 
   * The lastly, we will have a horizontal bar chart showing money stocks 
   * for the different categories on monthly basis for the last one year.
   * 
   */

  return (
    <Grid container xs={12}>
      <Stack
        direction="row"
        spacing={4}
        sx={{ width: "100%" }}
      >
        <DahboardCard name='Laptop' number={500} image={Laptop} stockLevel='low' lastUpdated='12-12-2024' />
        <DahboardCard name='Furniture' number={500} image={Furniture} stockLevel='normal' lastUpdated='12-12-2024' />
        <DahboardCard name='Computer' number={500} image={Computer} stockLevel='average' lastUpdated='12-12-2024' />
        <DahboardCard name='Monitor' number={500} image={Monitor} stockLevel='low' lastUpdated='12-12-2024' />
        <DahboardCard name='Printer' number={500} image={Printer} stockLevel='average' lastUpdated='12-12-2024' />
      </Stack>
      <Stack
        direction="row"
        spacing={4}
        mt={4}
        sx={{ width: "100%" }}
      >
        <Card sx={{ flex: 3.3 }}>
          <DashboardRequests />
        </Card>
        <Card sx={{ flex: 2, p: 2.5 }}>
          Second
        </Card>
      </Stack>

    </Grid>
  )
}

export default Dashboard;