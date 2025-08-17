import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 p-2 sm:p-4 lg:p-8">
        <div className="pt-16 lg:pt-0">
          <div className="max-w-full overflow-x-hidden">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
