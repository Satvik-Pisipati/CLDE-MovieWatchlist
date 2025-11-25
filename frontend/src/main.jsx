import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "./components/Layout.jsx";
import MainPage from "./pages/MainPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import MyRatingsPage from "./pages/MyRatingsPage.jsx";
import LoginPage from "./components/Login.jsx";

import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import { WatchlistProvider } from "./state/WatchlistContext.jsx";
<<<<<<< HEAD
=======
import { RatingsProvider } from "./state/RatingsContext.jsx";

import "./css/theme.css";
>>>>>>> 417d2b785d6bb036be53d128afa970f124a95db2

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Guard: only render children if logged in, otherwise go to /login
function RequireLogin({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Root redirect: / -> /home if signed in, else /login
function RootRedirect() {
  const auth = useAuth();
  return <Navigate to={auth?.user ? "/home" : "/login"} replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <WatchlistProvider>
          <RatingsProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  {/* Root redirect */}
                  <Route path="/" element={<RootRedirect />} />

                  {/* Public */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected */}
                  <Route
                    path="/home"
                    element={
                      <RequireLogin>
                        <MainPage />
                      </RequireLogin>
                    }
                  />
                  <Route
                    path="/watchlist"
                    element={
                      <RequireLogin>
                        <WatchlistPage />
                      </RequireLogin>
                    }
                  />
                  <Route
                    path="/ratings"
                    element={
                      <RequireLogin>
                        <MyRatingsPage />
                      </RequireLogin>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </RatingsProvider>
        </WatchlistProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
