import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import Dashboard from "./pages/Dashboard";
 
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;

}
 
export default function App() {

  return (
<BrowserRouter>
<Routes>

        {/* Public */}
<Route path="/login" element={<LoginPage />} />
 
        {/* Protected */}
<Route

          path="/"

          element={
<ProtectedRoute>
<MainPage />
</ProtectedRoute>

          }

        />
 
        <Route

          path="/dashboard"

          element={
<ProtectedRoute>
<Dashboard />
</ProtectedRoute>

          }

        />
</Routes>
</BrowserRouter>

  );

}
 