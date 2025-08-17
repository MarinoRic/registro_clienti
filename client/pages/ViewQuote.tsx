import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  User,
  Calendar,
  Euro,
  Phone,
  MapPin,
  Eye,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ConfirmDialog from "../components/ui/ConfirmDialog";

interface QuoteItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phones: Phone[];
  addresses: Address[];
}
interface Phone {
  id: number;
  number: string;
}


interface Address {
  id: number;
  street: string;
  city: string;
}
interface Quote {
  id: number;
  client_id: number;
  description: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  total_amount: number;
  notes: string;
  createdAt: string;
  address: Address;
  quote_items: QuoteItem[];
}

export default function ViewQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadQuote = async () => {
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:10000/api/quotes/${id}`);
        if (!response.ok) throw new Error('Preventivo non trovato');
        const quoteData = await response.json();

        console.log(quoteData)
         const updatedQuote: Quote = {
           id: Number(quoteData.id),
           client_id: Number(quoteData.client_id),
           description: quoteData.description,
           status: quoteData.status,
           total_amount: Number(quoteData.total_amount),
           notes: quoteData.notes || "",
           createdAt: quoteData.created_at,
           quote_items: quoteData.quote_items.map((item: any) => ({
            id: Number(item.id),
             name: item.name,
             description: item.description,
             quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            total_price: Number(item.total_price),
          })),
           address:{
             id:  Number(quoteData.client_addresses.id),
             street:  quoteData.client_addresses.street,
             city: quoteData.client_addresses.city
           }
        };

        setQuote(updatedQuote);

        // Fetch client using the just-fetched quoteData
        const clientResponse = await fetch(`http://localhost:10000/api/clients/${quoteData.client_id}`);
        if (!clientResponse.ok) throw new Error('Cliente non trovato');
        const clientData = await clientResponse.json();
        console.log(clientData);

      setClient({
        id: clientData.id,
        name: clientData.name,
        email: clientData.email,
        phones: clientData.phones.map((item: any) => ({
          id: Number(item.id),
          number: item.name,
        })),
        addresses: clientData.addresses.map((item: any) => ({
          id: Number(item.id),
          street: item.street,
          city: item.city,
        })),

      });
      } catch (error) {
        console.error('Errore caricamento preventivo o cliente:', error);
        setQuote(null);
        setClient(null);
      } finally {
        setLoading(false);

        console.log("LOADED QUOTE: " + quote)
        console.log("LOADED CLIENT: " + client)

      }
    };

    loadQuote();

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

  const handleDeleteClick = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'DELETE',
        headers: {
        //  'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Errore eliminazione preventivo');

      console.log("Eliminando preventivo:", id);

      // Simula chiamata API - RIMUOVERE
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Naviga alla lista preventivi dopo l'eliminazione
      navigate("/quotes");
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

  const handleViewClient = () => {
    if (client) {
      navigate(`/view-client/${client.id}`);
    }
  };

  const handleEditClient = () => {
    if (client) {
      navigate(`/edit-client/${client.id}`);
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

  if (!quote) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Preventivo non trovato
            </h1>
            <p className="text-gray-600 mb-8">
              Il preventivo richiesto non esiste o è stato eliminato.
            </p>
            <Link
              to="/quotes"
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna ai Preventivi
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
              to="/quotes"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna ai Preventivi
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dettagli Preventivo
              </h1>
              <p className="text-gray-600">
                Visualizza le informazioni del preventivo
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link
                to={`/edit-quote/${quote.id}`}
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

        {/* Quote Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                  <FileText size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Preventivo #{quote.id}
                  </h2>
                  <p className="text-blue-100">{client.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Totale</p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(quote.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {/* Cliente */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium text-gray-900">{client.name}</p>
                </div>
              </div>

              {/* Data */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Creazione</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(quote.createdAt)}
                  </p>
                </div>
              </div>

              {/* Telefoni */}
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-100 rounded-full p-3 mr-4 mt-1">
                  <Phone size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    Telefoni ({client.phones?.length || 0})
                  </p>
                  <div className="space-y-1">
                    {client.phones?.slice(0, 3).map((phone, index) => (
                      <p
                        key={index}
                        className="font-medium text-gray-900 text-sm"
                      >
                        {phone.number}
                      </p>
                    ))}
                    {client.phones?.length || 0 > 3 && (
                      <p className="text-xs text-gray-500">
                        +{client.phones?.length - 3} altri
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stato */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="bg-orange-100 rounded-full p-3 mr-4">
                  <Euro size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stato</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}
                  >
                    {getStatusText(quote.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Informazioni Cliente */}
            {client && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informazioni Cliente
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-3 mr-4">
                        <User size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {client.name}
                        </h4>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleViewClient}
                        className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Eye size={16} className="mr-2" />
                        Visualizza
                      </button>
                      <button
                        onClick={handleEditClient}
                        className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Edit size={16} className="mr-2" />
                        Modifica
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Telefoni Cliente */}
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                        <Phone size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Tutti i Telefoni ({client.phones.length})
                        </p>
                        <div className="space-y-1">
                          {client.phones.map((phone, index) => (
                            <p key={index} className="text-sm text-gray-600">
                              {phone.number}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Indirizzi Cliente */}
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                        <MapPin size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Tutti gli Indirizzi ({client.addresses.length})
                        </p>
                        <div className="space-y-2">
                          {client.addresses.map((address, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              <p className="font-medium">{address.street}</p>
                              <p className="text-xs text-gray-500">{address.city}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Indirizzo */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Indirizzo Selezionato
              </h3>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Indirizzo del preventivo
                  </p>
                  <p className="font-medium text-gray-900">
                    {quote.address?.street}
                  </p>
                  <p className="text-gray-600">{quote.address?.city}</p>
                </div>
              </div>
            </div>

            {/* Descrizione */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Descrizione
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {quote.description}
                </p>
              </div>
            </div>

            {/* Voci del Preventivo */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Voci del Preventivo
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Descrizione
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Quantità
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Prezzo Unitario
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Totale
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quote.quote_items?.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right font-medium">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totale finale */}
                <div className="bg-green-50 border-t border-gray-200 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Totale Preventivo
                      </p>
                      <p className="text-xs text-gray-500">IVA esclusa</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">
                        {formatCurrency(quote.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare il preventivo per "${client.name}"? Questa azione non può essere annullata e rimuoverà tutte le voci associate al preventivo.`}
        confirmText="Elimina"
        cancelText="Annulla"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
