import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import RegionalPage from "./pages/management/RegionalPage";
import TerritoryPage from "./pages/management/TerritoryPage";
import AreaPage from "./pages/management/AreaPage";
import SuppliersPage from "./pages/SuppliersPage";
import StoresPage from "./pages/StoresPage";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import PurchasesPage from "./pages/PurchasesPage";
import SalesPage from "./pages/SalesPage";
import StockTransfersPage from "./pages/StockTransfersPage";
import RewardsPage from "./pages/RewardsPage";
import ProductLocatePage from "./pages/ProductLocatePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProtectedRoute>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/management/regional" element={<RegionalPage />} />
              <Route path="/management/territory" element={<TerritoryPage />} />
              <Route path="/management/area" element={<AreaPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/stock-transfers" element={<StockTransfersPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/product-locate" element={<ProductLocatePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </ProtectedRoute>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
