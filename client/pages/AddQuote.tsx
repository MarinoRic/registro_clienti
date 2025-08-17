import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

interface QuoteItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteForm {
  description: string;
  clientId: string;
  clientAddressId: string;
  items: QuoteItem[];
}

interface FormErrors {
  description?: string;
  clientId?: string;
  clientAddressId?: string;
  items?: string;
}

interface Address {
  id: number;
  street: string;
  city: string;
}

interface Client {
  id: number;
  name: string;
  addresses: Address[];
}

export default function AddQuote() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuoteForm>({
    description: "",
    clientId: "",
    clientAddressId: "",
    items: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextItemId, setNextItemId] = useState(1);

  // API endpoint: GET /api/clients
  const [clients, setClients] = useState<Client[]>([]);
   const [addresses, setAddresses] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch('http://localhost:10000/api/clients', {
       //   headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const clientsData = await response.json();
          setClients(clientsData);
          console.log(clientsData)
        }
      } catch (error) {
        console.error('Errore caricamento clienti:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);


  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "La descrizione è obbligatoria";
    }

    if (!formData.clientId) {
      newErrors.clientId = "Seleziona un cliente";
    }

    if (formData.clientId && !formData.clientAddressId) {
      newErrors.clientAddressId = "Seleziona un indirizzo per il cliente";
    }

    if (formData.items.length === 0) {
      newErrors.items = "Aggiungi almeno una voce al preventivo";
    }

    // Valida che tutte le voci abbiano i campi obbligatori
    const hasInvalidItems = formData.items.some(
      (item) =>
        !item.name.trim() ||
        !item.description.trim() ||
        item.quantity <= 0 ||
        item.unitPrice <= 0,
    );

    if (hasInvalidItems) {
      newErrors.items =
        "Tutti i campi delle voci sono obbligatori e devono essere validi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "clientId") {
      // Trova il cliente selezionato
      const client = clients.find((c) => c.id.toString() === value) || null;
      setSelectedClient(client);

      // Aggiorna formData resettando l'indirizzo
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        clientAddressId: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Reset errori se presente
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };


  const addItem = () => {
    const newItem: QuoteItem = {
      id: nextItemId,
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setNextItemId((prev) => prev + 1);

    // Rimuovi errore se esiste
    if (errors.items) {
      setErrors((prev) => ({
        ...prev,
        items: undefined,
      }));
    }
  };

  const removeItem = (itemId: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const updateItem = (
    itemId: number,
    field: keyof QuoteItem,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Ricalcola il totale se cambia quantità o prezzo unitario
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const calculateGrandTotal = (): number => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const quoteData = {
        ...formData,
        total: calculateGrandTotal(),
      };

       // API endpoint: POST /api/quotes
      const response = await fetch('http://localhost:10000/api/quotes', {
        method: 'POST',
        headers: {
        //  'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: quoteData.description,
          clientId: parseInt(quoteData.clientId),
          clientAddressId: parseInt(quoteData.clientAddressId),
          items: quoteData.items.map(item => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          })),
          total: quoteData.total,
          status: 'draft' // nuovo preventivo inizia come bozza
        })
      });

      console.log(
        JSON.stringify({
          description: quoteData.description,
          clientId: parseInt(quoteData.clientId),
          clientAddressId: parseInt(quoteData.clientAddressId),
          items: quoteData.items.map(item => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          })),
          total: quoteData.total,
          status: 'draft' // nuovo preventivo inizia come bozza
        })
      )
      if (!response.ok) throw new Error('Errore creazione preventivo');
      const newQuote = await response.json();

      console.log("Salvando preventivo:", quoteData);

      // Simula chiamata API - RIMUOVERE
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reindirizza alla pagina preventivi dopo il salvataggio
      navigate("/quotes");
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      // TODO: Mostrare errore all'utente (toast/alert)
    } finally {
      setIsSubmitting(false);
    }
  };


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
          <h1 className="text-2xl font-bold text-gray-900">Nuovo Preventivo</h1>
          <p className="text-gray-600">
            Crea un nuovo preventivo per il cliente
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informazioni base */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Informazioni Base
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <label
                  htmlFor="clientId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.clientId ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleziona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                )}
              </div>

              {/* Indirizzo Cliente */}
              <div>
                <label
                  htmlFor="clientAddressId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Indirizzo Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  id="clientAddressId"
                  name="clientAddressId"
                  value={formData.clientAddressId}
                  onChange={handleInputChange}
                  disabled={!selectedClient}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                    errors.clientAddressId
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">
                    {selectedClient
                      ? "Seleziona un indirizzo"
                      : "Seleziona prima un cliente"}
                  </option>
                  {selectedClient?.addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.street}, {address.city}
                    </option>
                  ))}
                </select>
                {errors.clientAddressId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.clientAddressId}
                  </p>
                )}
              </div>
            </div>

            {/* Totale */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Totale Preventivo
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-lg font-semibold text-green-600">
                {formatCurrency(calculateGrandTotal())}
              </div>
            </div>

            {/* Descrizione */}
            <div className="mt-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrizione <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Descrivi il progetto o servizio..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Voci del preventivo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Voci del Preventivo
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Aggiungi Voce
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nessuna voce aggiunta. Clicca "Aggiungi Voce" per iniziare.
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Nome
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Descrizione
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                          Quantità
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                          Prezzo Unitario
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                          Totale
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                updateItem(item.id, "name", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="Nome voce"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="Descrizione dettagliata"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-sm">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-green-50">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-3 text-right font-semibold text-gray-700"
                        >
                          Totale Preventivo:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg text-green-800">
                          {formatCurrency(calculateGrandTotal())}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4 p-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">
                          Voce {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(item.id, "name", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Nome voce"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Descrizione
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(item.id, "description", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Descrizione dettagliata"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantità
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Prezzo Unitario
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="text-right pt-2 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-700">
                            Totale:{" "}
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Mobile Total */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        Totale Preventivo:
                      </span>
                      <span className="font-bold text-lg text-green-800">
                        {formatCurrency(calculateGrandTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {errors.items && (
              <div className="px-6 py-3 border-t border-red-200 bg-red-50">
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}
          </div>

          {/* Pulsanti */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <Link
              to="/quotes"
              className="w-full sm:w-auto text-center px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 transition-colors"
            >
              <Save size={20} className="mr-2" />
              {isSubmitting ? "Salvando..." : "Salva Preventivo"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
