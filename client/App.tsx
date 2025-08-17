// @ts-ignore
import { Toaster } from "@/components/ui/toaster";
// @ts-ignore
import { Toaster as Sonner } from "@/components/ui/sonner";
// @ts-ignore
import { TooltipProvider } from "@/components/ui/tooltip";
// @ts-ignore
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// @ts-ignore
import Login from "./pages/Login";
// @ts-ignore
import Index from "./pages/Index";
// @ts-ignore
import Users from "./pages/Users";
// @ts-ignore
import Quotes from "./pages/Quotes";
// @ts-ignore
import AddClient from "./pages/AddClient";
// @ts-ignore
import AddQuote from "./pages/AddQuote";
// @ts-ignore
import EditClient from "./pages/EditClient";
// @ts-ignore
import EditQuote from "./pages/EditQuote";
// @ts-ignore
import ViewClient from "./pages/ViewClient";
// @ts-ignore
import ViewQuote from "./pages/ViewQuote";
// @ts-ignore
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/users" element={<Users />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/add-client" element={<AddClient />} />
          <Route path="/add-quote" element={<AddQuote />} />
          <Route path="/edit-client/:id" element={<EditClient />} />
          <Route path="/edit-quote/:id" element={<EditQuote />} />
          <Route path="/view-client/:id" element={<ViewClient />} />
          <Route path="/view-quote/:id" element={<ViewQuote />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
