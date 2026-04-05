import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { WalletAuthProvider } from "./contexts/WalletAuthContext";
import { CongratsPage } from "./pages/Congrats";
import { DonatePage } from "./pages/Donate";
import { FaqPage } from "./pages/FaqPage";
import { HistoryPage } from "./pages/History";
import { HomePage } from "./pages/Home";
import { MapPage } from "./pages/MapPage";
import { MyAccountPage } from "./pages/MyAccount";
import { ReportPage } from "./pages/Report";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/my-account" element={<MyAccountPage />} />
            <Route path="/congrats" element={<CongratsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WalletAuthProvider>
    </QueryClientProvider>
  );
}
