import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function PrivateRoute({ element }) {
  const auth = useAuth();
  return auth?.user ? element : <Navigate to="/login" replace />;
}
