import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import RatingsPage from "./pages/RatingsPage.jsx";

import { AuthProvider } from "./state/AuthContext.jsx";
import { WatchlistProvider } from "./state/WatchlistContext.jsx";
import { RatingsProvider } from "./state/RatingsContext.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <RatingsProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<MainPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/ratings" element={<RatingsPage />} />
            </Routes>
          </RatingsProvider>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
