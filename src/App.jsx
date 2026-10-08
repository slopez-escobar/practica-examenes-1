import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { getCurrentUser } from "./auth.js";
import AppLayout from "./components/AppLayout.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import CreateExamPage from "./pages/CreateExamPage.jsx";
import ExamsPage from "./pages/ExamsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import TakeExamPage from "./pages/TakeExamPage.jsx";

function ProtectedRoute() {
  return getCurrentUser() ? <Outlet /> : <Navigate to="/login" replace />;
}

function LoginRoute() {
  return getCurrentUser() ? <Navigate to="/examenes" replace /> : <LoginPage />;
}

function SignupRoute() {
  return getCurrentUser() ? <Navigate to="/examenes" replace /> : <SignupPage />;
}

function App() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Navigate to="/examenes" replace />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/crear-cuenta" element={<SignupRoute />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/examenes" element={<ExamsPage />} />
            <Route path="/examenes/nuevo" element={<CreateExamPage />} />
            <Route path="/examenes/:examId/responder" element={<TakeExamPage />} />
            <Route path="/examenes/:examId/resultados" element={<ResultsPage />} />
            <Route path="/registro" element={<RegistrationPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
