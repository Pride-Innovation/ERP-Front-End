import { Grid } from "@mui/material";
import Login from "./pages/authentication/Login";
import ContainerComponent from "./components/Container";

const App = () => {
  return (
    <ContainerComponent>
      <Grid
        container
        xs={12}
        justifyContent="center"
      >
        <Login />
      </Grid>
    </ContainerComponent>

  );
}

export default App;
