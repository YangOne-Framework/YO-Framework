import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
//import Loading from "./components/ui/Loading";
//import ErrorBoundary from "./components/ErrorBoundary";
import AppRouter from "./routes/AppRouter";
import { initToken } from "./services/tokenManager";

function App() {
  const { t } = useTranslation();

  useEffect(() => {
    initToken().catch(() => {});
  }, []);

  return (
    <Suspense fallback={<><p>{t("Common.Loading")}</p></>}>
      {/* <ErrorBoundary> */}
        <AppRouter />
      {/* </ErrorBoundary> */}
    </Suspense>
  );
}

export default App;
