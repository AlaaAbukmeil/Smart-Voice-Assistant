import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../common/errorPage";
import VoiceAssistant from "../components/main/frontend";

const router = createBrowserRouter([
  
  {
    path: "/",
    element: <VoiceAssistant />,
    errorElement: <ErrorPage />,
  }
]);

export default router;
