import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  MapPin,
  Phone,
  Building,
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ConfirmDialog from "../components/ui/ConfirmDialog";

interface Phone {
  id: number;
  number: string;
}

interface Address {
  id: number;
  street: string;
  city: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phones: Phone[];
  addresses: Address[];
  createdAt: string;
}

interface Quote {
  id: number;
  client: string;
  clientId: number;
  total_amount: number;
  created_at: string;
  status: "draft" | "sent" | "accepted" | "rejected";
}

export default function ViewClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);


      try {
        const response = await fetch(`http://localhost:10000/api/clients/${id}`, {
         // headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Cliente non trovato');
        const clientData = await response.json();
        setClient(clientData);
      } catch (error) {
        console.error('Errore caricamento cliente:', error);
        setClient(null);
      }



      try {
        const quotesResponse = await fetch(`http://localhost:10000/api/clients/${id}/quotes`, {
          //headers: { 'Authorization': `Bearer ${token}` }
        });
        if (quotesResponse.ok) {
          const quotesData = await quotesResponse.json();
          setQuotes(quotesData.quotes);
        }else{
          setQuotes(null)

        }
      } catch (error) {
        setQuotes(null)
        console.error('Errore caricamento preventivi:', error);
      }
      setLoading(false);
    };

    loadClient();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Bozza";
      case "sent":
        return "Inviato";
      case "accepted":
        return "Accettato";
      case "rejected":
        return "Rifiutato";
      default:
        return "Sconosciuto";
    }
  };

  const handleViewQuote = (quoteId: number) => {
    navigate(`/view-quote/${quoteId}`);
  };

  const handleEditQuote = (quoteId: number) => {
    navigate(`/edit-quote/${quoteId}`);
  };

  const handleAddQuote = () => {
    navigate(`/add-quote?clientId=${client?.id}`);
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
       const response = await fetch(`http://localhost:10000/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
         // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Errore eliminazione cliente');

      // Naviga alla lista clienti dopo l'eliminazione
      navigate("/users");
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);

      setIsDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Caricamento...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Cliente non trovato
            </h1>
            <p className="text-gray-600 mb-8">
              Il cliente richiesto non esiste o è stato eliminato.
            </p>
            <Link
              to="/users"
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna ai Clienti
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/users"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna ai Clienti
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dettagli Cliente
              </h1>
              <p className="text-gray-600">
                Visualizza le informazioni del cliente
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link
                to={`/edit-client/${client.id}`}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Edit size={20} className="mr-2" />
                Modifica
              </Link>
              <button
                onClick={handleDeleteClick}
                className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Trash2 size={20} className="mr-2" />
                Elimina
              </button>
            </div>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with avatar */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                <p className="text-green-100">Cliente #{client.id}</p>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Informazioni di Contatto
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Email */}
              <div className="flex items-center p-3 lg:p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 rounded-full p-2 lg:p-3 mr-3 lg:mr-4 flex-shrink-0">
                  <Mail size={16} className="lg:hidden text-blue-600" />
                  <Mail size={20} className="hidden lg:block text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base break-words">
                    {client.email || "Non specificata"}
                  </p>
                </div>
              </div>

              {/* Telefoni */}
              <div className="flex items-start p-3 lg:p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 rounded-full p-2 lg:p-3 mr-3 lg:mr-4 mt-1 flex-shrink-0">
                  <Phone size={16} className="lg:hidden text-green-600" />
                  <Phone size={20} className="hidden lg:block text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm text-gray-600 mb-2">
                    Telefoni ({client.phones.length})
                  </p>
                  <div className="space-y-1">
                    {client.phones.slice(0, 3).map((phone, index) => (
                      <p
                        key={phone.id}
                        className="font-medium text-gray-900 text-sm lg:text-base break-words"
                      >
                        {phone.number}
                        {index === 0 && client.phones.length > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (principale)
                          </span>
                        )}
                      </p>
                    ))}
                    {client.phones.length > 3 && (
                      <p className="text-xs lg:text-sm text-gray-500">
                        +{client.phones.length - 3} altri numeri
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Indirizzi */}
            <div className="mt-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                Indirizzi
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                {client.addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className="flex items-start p-3 lg:p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="bg-orange-100 rounded-full p-2 lg:p-3 mr-3 lg:mr-4 flex-shrink-0">
                      <MapPin size={16} className="lg:hidden text-orange-600" />
                      <MapPin
                        size={20}
                        className="hidden lg:block text-orange-600"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">
                        Indirizzo {index + 1}
                        {index === 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (principale)
                          </span>
                        )}
                      </p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base break-words">
                        {address.street}
                      </p>
                      <div className="flex items-center mt-1">
                        <Building
                          size={12}
                          className="lg:hidden text-gray-400 mr-1 flex-shrink-0"
                        />
                        <Building
                          size={14}
                          className="hidden lg:block text-gray-400 mr-1 flex-shrink-0"
                        />
                        <p className="text-gray-600 text-xs lg:text-sm">
                          {address.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informazioni Aggiuntive
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Data di registrazione:</span>{" "}
                  {formatDate(client.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preventivi del Cliente */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText size={24} className="text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Preventivi Associati
                  </h3>
                  <p className="text-sm text-gray-600">
                    {quotes.length} preventivi trovati
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddQuote}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Nuovo Preventivo
              </button>
            </div>
          </div>

          <div className="p-6">
            {quotes.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun preventivo
                </h4>
                <p className="text-gray-600 mb-4">
                  Non ci sono preventivi associati a questo cliente.
                </p>
                <button
                  onClick={handleAddQuote}
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Crea Primo Preventivo
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Totale
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Stato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Data Creazione
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotes.map((quote, index) => (
                        <tr
                          key={quote.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{quote.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                            {formatCurrency(quote.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}
                            >
                              {getStatusText(quote.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(quote.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewQuote(quote.id)}
                                className="flex items-center px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              >
                                <Eye size={16} className="mr-1" />
                                Visualizza
                              </button>
                              <button
                                onClick={() => handleEditQuote(quote.id)}
                                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                <Edit size={16} className="mr-1" />
                                Modifica
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
                  {quotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Preventivo #{quote.id}
                          </h4>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(quote.total_amount)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}
                        >
                          {getStatusText(quote.status)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div>
                          <span className="font-medium text-gray-700">Data:</span>
                          <span className="ml-2 text-gray-600">
                            {formatDate(quote.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleViewQuote(quote.id)}
                          className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          title="Visualizza"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditQuote(quote.id)}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          title="Modifica"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare il cliente "${client?.name}"? Questa azione non può essere annullata e rimuoverà tutti i dati associati.`}
        confirmText="Elimina"
        cancelText="Annulla"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
