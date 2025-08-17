import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Clienti",
      href: "/users",
      icon: Users,
    },
    {
      name: "Preventivi",
      href: "/quotes",
      icon: FileText,
    },
  ];

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // TODO: Chiamata API per logout
      console.log("Effettuando logout...");

      // Simula chiamata API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Rimuovi token di autenticazione e reindirizza al login
      localStorage.removeItem("authToken");
      setShowLogoutDialog(false);
      navigate("/login");
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeLogoutDialog = () => {
    if (!isLoggingOut) {
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700">
            <h1 className="text-xl font-bold">DashBoard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActiveLink(item.href)
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={closeLogoutDialog}
        onConfirm={confirmLogout}
        title="Conferma Logout"
        message="Sei sicuro di voler uscire dall'applicazione? Verrai reindirizzato alla pagina di login."
        confirmText="Logout"
        cancelText="Annulla"
        isDestructive={false}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default Sidebar;
