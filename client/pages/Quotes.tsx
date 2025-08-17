import { useState } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import QuotesTable from "../components/tables/QuotesTable";

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestione Preventivi
          </h1>
          <p className="text-gray-600">
            Visualizza e gestisci tutti i preventivi
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per cliente o numero preventivo..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <QuotesTable searchTerm={searchTerm} />
      </div>
    </DashboardLayout>
  );
}
