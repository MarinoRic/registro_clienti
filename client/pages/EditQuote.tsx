import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, RotateCcw } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

/** ===== Tipi ===== */
interface QuoteItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: "original" | "new" | "modified" | "to_delete";
  originalData?: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  };
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
  // può arrivare già popolato dall'API oppure no
  addresses?: Address[];
}

/** ===== Config API (adatta al tuo backend) ===== */
const API_BASE = "http://localhost:10000";
const CLIENTS_URL = `${API_BASE}/api/clients`;
const QUOTE_URL = (id: string | number) => `${API_BASE}/api/quotes/${id}`;
const CLIENT_ADDRESSES_URL = (clientId: number | string) =>
  `${API_BASE}/api/clients/${clientId}/addresses`;
 const authHeaders = () => ({
 });

let removed = [];
let updated = [];

/** ===== Component ===== */
export default function EditQuote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<QuoteForm>({
    description: "",
    clientId: "",
    clientAddressId: "",
    items: [],
  });

  // errori form
  const [errors, setErrors] = useState<FormErrors>({});

  // errori fetch
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // loading separati così non si pestano i piedi
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextItemId, setNextItemId] = useState(1);

  const [clients, setClients] = useState<Client[]>([]);
  // cache indirizzi per cliente (se l’API /clients non li include)
  const [addressesByClient, setAddressesByClient] = useState<
    Record<number, Address[]>
  >({});

  /** ========== Helpers normalizzazione ==========
   * Supporta sia snake_case (Laravel) che camelCase
   */
  const normalizeQuoteItems = (rawItems: any[] = []): QuoteItem[] => {
    return rawItems.map((ri) => {
      const quantity = Number(ri.quantity ?? ri.qty ?? 0);
      const unitPrice = Number(ri.unit_price ?? ri.unitPrice ?? 0);
      const total =
        ri.total != null ? Number(ri.total) : Number(quantity * unitPrice);

      const item: QuoteItem = {
        id: Number(ri.id),
        name: String(ri.name ?? ""),
        description: String(ri.description ?? ""),
        quantity,
        unitPrice,
        total,
        status: "original",
        originalData: {
          name: String(ri.name ?? ""),
          description: String(ri.description ?? ""),
          quantity,
          unitPrice,
        },
      };
      return item;
    });
  };

  const normalizeClientsResponse = (raw: any[]): Client[] => {
    return (raw ?? []).map((c: any) => ({
      id: Number(c.id),
      name: String(c.name ?? c.full_name ?? c.company_name ?? ""),
      addresses: (c.addresses as any[] | undefined)?.map((a: any) => ({
        id: Number(a.id),
        street: String(a.street ?? a.address ?? ""),
        city: String(a.city ?? ""),
      })),
    }));
  };

  /** ========== Fetch Clients ========== */
  useEffect(() => {
    const loadClients = async () => {
      setLoadingClients(true);
      setClientsError(null);
      try {
        const res = await fetch(CLIENTS_URL, {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const normalized = normalizeClientsResponse(data);
        setClients(normalized);

        // Se qualche client arriva già con addresses, li metto in cache
        setAddressesByClient((prev) => {
          const next = { ...prev };
          normalized.forEach((c) => {
            if (c.addresses && c.addresses.length) {
              next[c.id] = c.addresses;
            }
          });
          return next;
        });
      } catch (e: any) {
        console.error("Errore caricamento clienti:", e);
        setClientsError("Impossibile caricare i clienti.");
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  /** ========== Fetch Quote by id ========== */
  useEffect(() => {
    if (!id) return;
    const loadQuote = async () => {
      setLoadingQuote(true);
      setQuoteError(null);
      try {
        const res = await fetch(QUOTE_URL(id), {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const q = await res.json();

        // Supporta sia "items" che "quote_items"
        const rawItems: any[] = q.items ?? q.quote_items ?? [];
        const items = normalizeQuoteItems(rawItems);

        setFormData({
          description: String(q.description ?? ""),
          clientId: String(q.client_id ?? q.clientId ?? ""),
          clientAddressId: String(q.client_address_id ?? q.clientAddressId ?? ""),
          items,
        });

        const maxId = items.length
          ? Math.max(...items.map((i) => Number(i.id) || 0))
          : 0;
        setNextItemId(maxId + 1);
      } catch (e: any) {
        console.error("Errore caricamento preventivo:", e);
        setQuoteError("Impossibile caricare il preventivo richiesto.");
      } finally {
        setLoadingQuote(false);
      }
    };

    loadQuote();
  }, [id]);

  /** ========== Indirizzi del cliente selezionato ========== */
  const clientIdNum = useMemo(
    () => (formData.clientId ? Number(formData.clientId) : NaN),
    [formData.clientId]
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientIdNum) ?? null,
    [clients, clientIdNum]
  );

  const selectedAddresses: Address[] = useMemo(() => {
    if (!clientIdNum || Number.isNaN(clientIdNum)) return [];
    return (
      addressesByClient[clientIdNum] ??
      selectedClient?.addresses ??
      []
    );
  }, [addressesByClient, clientIdNum, selectedClient]);

  // Se non abbiamo in cache gli indirizzi del cliente selezionato, prova a fetcharli.
  const ensureAddressesForClient = async (cid: number) => {
    if (!cid || Number.isNaN(cid)) return [];
    // se già in cache o il client ha già addresses, usa quelli
    if (addressesByClient[cid]) return addressesByClient[cid];
    const clientWithAddresses = clients.find((c) => c.id === cid)?.addresses;
    if (clientWithAddresses && clientWithAddresses.length) {
      setAddressesByClient((prev) => ({ ...prev, [cid]: clientWithAddresses }));
      return clientWithAddresses;
    }

    // fallback: fetch dedicato
    try {
      const res = await fetch(CLIENT_ADDRESSES_URL(cid), {
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as any[];
      const normalized: Address[] = (data ?? []).map((a) => ({
        id: Number(a.id),
        street: String(a.street ?? a.address ?? ""),
        city: String(a.city ?? ""),
      }));
      setAddressesByClient((prev) => ({ ...prev, [cid]: normalized }));
      return normalized;
    } catch (e) {
      console.error("Errore caricamento indirizzi cliente:", e);
      // in caso d’errore lascio vuoto
      return [];
    }
  };

  /** ========== Validazione ========== */
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

    const activeItems = formData.items.filter((i) => i.status !== "to_delete");
    if (activeItems.length === 0) {
      newErrors.items = "Il preventivo deve avere almeno una voce";
    }
    const invalid = activeItems.some(
      (i) =>
        !i.name.trim() ||
        !i.description.trim() ||
        Number(i.quantity) <= 0 ||
        Number(i.unitPrice) <= 0
    );
    if (invalid) {
      newErrors.items =
        "Tutti i campi delle voci sono obbligatori e devono essere validi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** ========== Handlers ==========
   * Cambio campi form + gestione clientId -> fetch indirizzi
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "clientId") {
      const newClientId = value;
      // reset indirizzo
      setFormData((prev) => ({
        ...prev,
        clientId: newClientId,
        clientAddressId: "",
      }));
      // fetch indirizzi se necessario e autoseleziona se c'è un solo indirizzo
      const cid = Number(newClientId);
      if (!Number.isNaN(cid)) {
        (async () => {
          const addrs = await ensureAddressesForClient(cid);
          if (addrs.length === 1) {
            setFormData((prev) => ({
              ...prev,
              clientAddressId: String(addrs[0].id),
            }));
          }
        })();
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /** Aggiungi / modifica / elimina righe */
  const addItem = () => {
    const newItem: QuoteItem = {
      id: -2,
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      status: "new",
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
     if (errors.items) setErrors((prev) => ({ ...prev, items: undefined }));
  };

  const markForDeletion = (itemId: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, status: "to_delete" } : item
      ),
    }));
  };

  const restoreItem = (itemId: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId && item.status === "to_delete"
          ? { ...item, status: "original" }
          : item
      ),
    }));
  };

  const removeNewItem = (itemId: number) => {
    if(itemId > 0) removed.push(itemId)

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  const updateItem = (
    itemId: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    updated.push(itemId)
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const updated: QuoteItem = { ...item, [field]: value } as QuoteItem;

        if (field === "quantity" || field === "unitPrice") {
          const q = Number(
            field === "quantity" ? value : updated.quantity ?? item.quantity
          );
          const p = Number(
            field === "unitPrice" ? value : updated.unitPrice ?? item.unitPrice
          );
          updated.total = Number.isFinite(q * p) ? q * p : 0;
        }

        // aggiorna stato modified/original se esiste originalData
        if (updated.originalData) {
          const isModified =
            updated.name !== updated.originalData.name ||
            updated.description !== updated.originalData.description ||
            Number(updated.quantity) !== Number(updated.originalData.quantity) ||
            Number(updated.unitPrice) !== Number(updated.originalData.unitPrice);

          updated.status = isModified ? "modified" : "original";
        }
        return updated;
      }),
    }));
  };

  /** Totali & UI helpers */
  const calculateGrandTotal = (): number =>
    formData.items
      .filter((i) => i.status !== "to_delete")
      .reduce((sum, i) => sum + Number(i.total || 0), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const getRowStyle = (status: QuoteItem["status"]) => {
    switch (status) {
      case "new":
        return "bg-green-50 border-green-200";
      case "modified":
        return "bg-yellow-50 border-yellow-200";
      case "to_delete":
        return "bg-red-50 border-red-200 opacity-60";
      default:
        return "bg-white";
    }
  };

  /** ========== Submit (PUT /api/quotes/:id) ========== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const removedItems = formData.items.filter(item =>
      removed.includes(item.id)
    );

    const updatedItems = formData.items.filter(item =>
      updated.includes(item.id)
    );

    const newItems = formData.items.filter(item => item.id < 0);

    const payload = {
      quote:{
        client_id : formData.clientId,
        client_address_id : formData.clientAddressId,
        description: formData.description
      },
      items: {
        new: newItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        removed: removedItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        updated: updatedItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }
    };
  console.log(payload)
    try {
      const res = await fetch(QUOTE_URL(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Errore salvataggio");

      navigate(`/view-quote/${id}`);
    } catch (err) {
      console.error("Errore:", err);
      alert("Errore durante il salvataggio del preventivo");
    }
  };


  /** ========== Render ========== */
  const isLoading = loadingClients || loadingQuote;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Caricamento…</div>
        </div>
      </DashboardLayout>
    );
  }

  if (clientsError || quoteError) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto mt-12 space-y-3 text-center">
          {clientsError && (
            <p className="text-red-600">Errore clienti: {clientsError}</p>
          )}
          {quoteError && (
            <p className="text-red-600">Errore preventivo: {quoteError}</p>
          )}
          <Link
            to="/quotes"
            className="inline-block mt-4 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Torna all’elenco
          </Link>
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
              to={`/view-quote/${id}`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna al Preventivo
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Modifica Preventivo</h1>
          <p className="text-gray-600">Aggiorna i dati del preventivo</p>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Legenda colori:
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2" />
              <span className="text-gray-600">Voci aggiunte</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2" />
              <span className="text-gray-600">Voci modificate</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2" />
              <span className="text-gray-600">Voci da eliminare</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informazioni base */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Informazioni Base
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Indirizzo <span className="text-red-500">*</span>
                </label>
                <select
                  id="clientAddressId"
                  name="clientAddressId"
                  value={formData.clientAddressId}
                  onChange={handleInputChange}
                  disabled={!formData.clientId}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                    errors.clientAddressId ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">
                    {formData.clientId
                      ? "Seleziona un indirizzo"
                      : "Seleziona prima un cliente"}
                  </option>
                  {selectedAddresses.map((address) => (
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

              {/* Totale (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Totale Preventivo
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-lg font-semibold text-green-600">
                  {formatCurrency(calculateGrandTotal())}
                </div>
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
                Nessuna voce presente.
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                  <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-2 ${getRowStyle(item.status)}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, "name", e.target.value)
                          }
                          disabled={item.status === "to_delete"}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                          placeholder="Nome voce"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          disabled={item.status === "to_delete"}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
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
                              parseInt(e.target.value) || 1
                            )
                          }
                          disabled={item.status === "to_delete"}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
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
                              parseFloat(e.target.value) || 0
                            )
                          }
                          disabled={item.status === "to_delete"}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-sm">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center space-x-1">
                          {item.status === "to_delete" ? (
                            <button
                              type="button"
                              onClick={() => restoreItem(item.id)}
                              className="text-green-500 hover:text-green-700 transition-colors"
                              title="Ripristina"
                            >
                              <RotateCcw size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                item.status === "new"
                                  ? removeNewItem(item.id)
                                  : markForDeletion(item.id)
                              }
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title={
                                item.status === "new"
                                  ? "Rimuovi"
                                  : "Segna per eliminazione"
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
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
                    <td />
                  </tr>
                  </tfoot>
                </table>
              </div>
            )}
            {errors.items && (
              <div className="px-6 py-3 border-t border-red-200 bg-red-50">
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}
          </div>

          {/* Pulsanti */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link
              to={`/view-quote/${id}`}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 transition-colors"
            >
              <Save size={20} className="mr-2" />
              {isSubmitting ? "Salvando..." : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
