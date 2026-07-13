import { useRoutes, BrowserRouter } from "react-router-dom";
import routes from "./RouteRegistrar";

const Routes = () => {
  return useRoutes(routes);
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
};

export default AppRouter;