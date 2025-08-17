import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";

interface Quote {
  id: number;
  client: string;
  total: number;
  createdAt: string;
  status:string;
}

interface QuotesTableProps {
  searchTerm?: string;
}

const QuotesTable = ({ searchTerm = "" }: QuotesTableProps) => {
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    quoteId: number;
    clientName: string;
  }>({
    isOpen: false,
    quoteId: 0,
    clientName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadQuotes = async () => {
      console.log('here')
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:10000/api/quotes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Errore nel caricamento dei preventivi");

        const data = await response.json();
        console.log(data)
        const formattedQuotes: Quote[] = data.map((q: any) => ({
          id: q.id,
          client: q.clients?.name || "Sconosciuto",
          total: q.total_amount,
          createdAt: q.createdAt || q.created_at,
          status: q.status,
        }));

        setQuotes(formattedQuotes);
      } catch (err: any) {
        console.error("Errore caricamento preventivi:", err);
        setError(err.message || "Errore imprevisto");
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Caricamento preventivi...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Errore: {error}
      </div>
    );
  }
  // Filter quotes based on search term
  const filteredQuotes = quotes.filter(quote => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      quote.client.toLowerCase().includes(searchLower) ||
      quote.id.toString().includes(searchLower)
    );
  });

  const handleAddQuote = () => {
    navigate("/add-quote");
  };

  const handleViewQuote = (quoteId: number) => {
    navigate(`/view-quote/${quoteId}`);
  };

  const handleEditQuote = (quoteId: number) => {
    navigate(`/edit-quote/${quoteId}`);
  };

  const handleDeleteQuote = (quoteId: number) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (quote) {
      setDeleteDialog({
        isOpen: true,
        quoteId: quoteId,
        clientName: quote.client,
      });
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      console.log("Eliminando preventivo:", deleteDialog.quoteId);

      const response = await fetch(`http://localhost:10000/api/quotes/${deleteDialog.quoteId}`, {
        method: 'DELETE',
        headers: {
          //'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Errore eliminazione');
      setQuotes(prevQuotes =>
        prevQuotes.filter(q => q.id !== deleteDialog.quoteId)
      );

      setDeleteDialog({ isOpen: false, quoteId: 0, clientName: "" });

    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      // TODO: Mostrare errore all'utente (toast/alert)
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, quoteId: 0, clientName: "" });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Preventivi</h2>
        <button
          onClick={handleAddQuote}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Aggiungi Preventivo
        </button>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Totale
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
            {filteredQuotes.map((quote, index) => (
              <tr
                key={quote.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {quote.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {quote.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                  {formatCurrency(quote.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(quote.createdAt)}
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
                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
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
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{quote.client}</h3>
                <p className="text-sm text-gray-600">ID: {quote.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatCurrency(quote.total)}
                </p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    quote.status === "draft"
                      ? "bg-gray-100 text-gray-800"
                      : quote.status === "sent"
                        ? "bg-blue-100 text-blue-800"
                        : quote.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {quote.status === "draft"
                    ? "Bozza"
                    : quote.status === "sent"
                      ? "Inviato"
                      : quote.status === "accepted"
                        ? "Accettato"
                        : "Rifiutato"}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div>
                <span className="font-medium text-gray-700">Data:</span>
                <span className="ml-2 text-gray-600">
                  {formatDate(quote.createdAt)}
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
              <button
                onClick={() => handleDeleteQuote(quote.id)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title="Elimina"
              >
                <Trash2 size={16} />
              </button>
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
        message={`Sei sicuro di voler eliminare il preventivo per "${deleteDialog.clientName}"? Questa azione non può essere annullata e rimuoverà tutte le voci associate.`}
        confirmText="Elimina"
        cancelText="Annulla"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default QuotesTable;
