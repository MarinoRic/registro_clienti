// @ts-ignore
import DashboardLayout from "../components/layout/DashboardLayout";
// @ts-ignore
import UsersTable from "../components/tables/UsersTable";
// @ts-ignore
import QuotesTable from "../components/tables/QuotesTable";

export default function Index() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Gestisci clienti e preventivi della tua applicazione
            </p>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <UsersTable />
        </div>

        {/* Quotes Section */}
        <div>
          <QuotesTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
