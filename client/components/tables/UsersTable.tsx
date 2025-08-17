import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useQuery } from "@tanstack/react-query";

interface Phone {
  id: number;
  number: string;
}

interface Address {
  id: number;
  street: string;
  city: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phones: Phone[];
  addresses: Address[];
}

interface UsersTableProps {
  searchTerm?: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch("http://localhost:10000/api/clients");
  if (!res.ok) throw new Error("Errore nel recupero dei clienti");
  return res.json();
};

const UsersTable = ({ searchTerm = "" }: UsersTableProps) => {
  const navigate = useNavigate();

  const { data: users = [], isLoading, error, refetch } = useQuery<User[], Error>({
    queryKey: ["clients"],
    queryFn: fetchUsers,
  });
  if (!isLoading && !error) {
    console.log("Utenti caricati:", users);
  }
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: number;
    userName: string;
  }>({
    isOpen: false,
    userId: 0,
    userName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleAddUser = () => {
    navigate("/add-client");
  };

  const handleViewUser = (userId: number) => {
    navigate(`/view-client/${userId}`);
  };

  const handleEditUser = (userId: number) => {
    navigate(`/edit-client/${userId}`);
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setDeleteDialog({
        isOpen: true,
        userId: userId,
        userName: user.name,
      });
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Chiudi il dialog
      setDeleteDialog({ isOpen: false, userId: 0, userName: "" });

      // Fai la DELETE al server
      const response = await fetch(`http://localhost:10000/api/clients/${deleteDialog.userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Errore nella cancellazione: ${response.statusText}`);
      }

      // Aggiorna la lista dei clienti
      await refetch();

      console.log("Cliente eliminato con successo");
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
    } finally {
      setIsDeleting(false);
    }
  };


  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, userId: 0, userName: "" });
    }
  };

  // **GESTIONE LOADING ED ERROR**
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Caricamento clienti...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Errore nel caricamento dei clienti: {error.message}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Clienti</h2>
        <button
          onClick={handleAddUser}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Aggiungi Cliente
        </button>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Telefono</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Indirizzo</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Azioni</th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map((user, index) => (
            <tr
              key={user.id}
              className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email || "Non specificata"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {user.phones.length > 0 ? user.phones[0].number : "Nessun telefono"}
                {user.phones.length > 1 && (
                  <span className="text-xs text-gray-400 block">+{user.phones.length - 1} altri</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {user.addresses.length > 0 ? (
                  <div>
                    <div>{user.addresses[0].street}</div>
                    <div className="text-xs text-gray-400">{user.addresses[0].city}</div>
                  </div>
                ) : "Nessun indirizzo"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewUser(user.id)}
                    className="flex items-center px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    <Eye size={16} className="mr-1" />
                    Visualizza
                  </button>
                  <button
                    onClick={() => handleEditUser(user.id)}
                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={16} className="mr-1" />
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Elimina
                  </button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">ID: {user.id}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleViewUser(user.id)}
                  className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  title="Visualizza"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEditUser(user.id)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="Modifica"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  title="Elimina"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-600">{user.email || "Non specificata"}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Telefono:</span>
                <div className="ml-2 text-gray-600">
                  {user.phones.length > 0 ? user.phones[0].number : "Nessun telefono"}
                  {user.phones.length > 1 && (
                    <span className="text-xs text-gray-400 block">+{user.phones.length - 1} altri</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Indirizzo:</span>
                <div className="ml-2 text-gray-600">
                  {user.addresses.length > 0 ? (
                    <>
                      <div>{user.addresses[0].street}</div>
                      <div className="text-xs text-gray-400">{user.addresses[0].city}</div>
                    </>
                  ) : "Nessun indirizzo"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare il cliente "${deleteDialog.userName}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UsersTable;
