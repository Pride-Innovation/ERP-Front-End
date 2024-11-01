import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "../core/routes/AppRoutes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  return (
    <>
      <ToastContainer />
      <Router>
        <AppRoutes />
      </Router>
    </>

  );
}

export default App;
