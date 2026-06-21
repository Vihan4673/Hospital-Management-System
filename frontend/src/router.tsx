import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import Loginpage from "./pages/Loginpage";
import SignupPage from "./pages/SignupPage";
import AdminRoutes from "./pages/AdminRoutes";
import Dashboard from "./pages/Dashboard";
import PatientPage from "./pages/PatientPage.tsx";
import DoctorPage from "./pages/DoctorPage.tsx";
import AppointmentPage from "./pages/AppointmentPage.tsx";
import OverduePage from "./pages/OverduePage";
import UserProfile from "./pages/UserProfilePage";
import Homepage from "./pages/HomePage";
import PatientAptmentPage from "./pages/PatientAptmentPage"; // 👈 නිවැරදිව import කර ඇත

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      { path: "/", element: <Loginpage/> },
      { path: "/login", element: <Loginpage/> },
      { path: "/signup", element: <SignupPage/> },
      { path: "/homepage", element: <Homepage /> },
      { path: "/PatientAptmentPage", element: <PatientAptmentPage /> }, // 👈 මෙතනට route එක එකතු කරන ලදී
      {
        element: <AdminRoutes/>,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/dashboard/patients", element: <PatientPage /> },
          { path: "/dashboard/doctors", element: <DoctorPage /> },
          { path: "/dashboard/Appointments", element: <AppointmentPage /> },
          { path: "/dashboard/overdues", element: <OverduePage /> },
          { path: "/dashboard/profile", element: <UserProfile/> },
        ],
      },
    ],
  },
]);

export default router;