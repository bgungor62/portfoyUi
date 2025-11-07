import type React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      ></Route>
      <Route path="/login" element={<LoginPage />}></Route>
      <Route path="*" element={<Navigate to="/" replace></Navigate>}></Route>
    </Routes>
  );
};
export default App;
