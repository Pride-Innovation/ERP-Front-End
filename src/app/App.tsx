import { BrowserRouter as Router } from "react-router-dom";
import { Grid } from "@mui/material";
import ContainerComponent from "../components/Container";
import AppRoutes from "../core/routes/AppRoutes";

const App = () => {
  return (
    <ContainerComponent>
      <Grid
        container
        xs={12}
        justifyContent="center"
      >
        <Router>
          <AppRoutes />
        </Router>
      </Grid>
    </ContainerComponent>

  );
}

export default App;
