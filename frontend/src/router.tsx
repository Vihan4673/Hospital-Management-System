import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import Loginpage from "./pages/Loginpage";
import SignupPage from "./pages/SignupPage";
import AdminRoutes from "./pages/AdminRoutes";
import Dashboard from "./pages/Dashboard";
import Readerpage from "./pages/PatientsPage.tsx";
import BooksPage from "./pages/DoctorPage.tsx";
import AppointmentPage from "./pages/AppointmentPage.tsx";
import PendingAppointmentsPage from "./pages/PendingAppointmentsPage.tsx";
import UserProfile from "./pages/UserProfilePage";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children: [
        { path: "/", element: <Loginpage/> },
        { path: "/login", element: <Loginpage/> },
        { path: "/signup", element: <SignupPage/> },
        {
          element: <AdminRoutes/>,
          children: [
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/dashboard/readers", element: <Readerpage /> },
            { path: "/dashboard/books", element: <BooksPage /> },
            { path: "/dashboard/lendings", element: <AppointmentPage /> },
            { path: "/dashboard/overdues", element: <PendingAppointmentsPage /> },
            { path: "/dashboard/profile", element: <UserProfile/> },

           
          ],
        },
      ],
    },
  ])
  

  export default router