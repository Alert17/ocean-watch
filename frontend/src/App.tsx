import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { WalletAuthProvider } from "./contexts/WalletAuthContext";
import { CongratsPage } from "./pages/Congrats";
import { DonatePage } from "./pages/Donate";
import { HistoryPage } from "./pages/History";
import { HomePage } from "./pages/Home";
import { MyAccountPage } from "./pages/MyAccount";
import { ReportPage } from "./pages/Report";
import { WorldIdPage } from "./pages/WorldId";

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
<<<<<<< HEAD
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/my-account" element={<MyAccountPage />} />
          <Route path="/world-id" element={<WorldIdPage />} />
          <Route path="/congrats" element={<CongratsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
=======
      <WalletAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/my-account" element={<MyAccountPage />} />
            <Route path="/congrats" element={<CongratsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WalletAuthProvider>
>>>>>>> 539037b (update auth wallet)
    </QueryClientProvider>
  );
}
