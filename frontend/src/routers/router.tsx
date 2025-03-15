import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../common/errorPage";
import AudioRecorder from "../components/main/main";

const router = createBrowserRouter([
  
  {
    path: "/",
    element: <AudioRecorder />,
    errorElement: <ErrorPage />,
  }
]);

export default router;
