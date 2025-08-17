import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

interface Phone {
  id: number;
  number: string;
  removed?: boolean;
}

interface Address {
  id: number;
  street: string;
  city: string;
}

interface ClientForm {
  id: number;
  name: string;
  email: string;
  phones: Phone[];
  addresses: Address[];
}

interface FormErrors {
  name?: string;
  phones?: string;
  addresses?: string;
}

let index = 0;

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [removedPhones, setRemovedPhones] = useState<Phone[]>([]);
  const [removedAddresses, setRemovedAddresses] = useState<Address[]>([]);
  const [formData, setFormData] = useState<ClientForm>({
    id: -1,
    name: "",
    email: "",
    phones: [],
    addresses: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:10000/api/clients/${id}`
        );
        if (!response.ok) throw new Error("Cliente non trovato");
        const client = await response.json();

        if (client) {
          setFormData({
            id: client.id,
            name: client.name,
            email: client.email,
            phones: client.phones,
            addresses: client.addresses,
          });


        }

        setLoading(false);
      } catch (error) {
        console.error("Errore caricamento cliente:", error);
      }
    };

    loadClient();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    }

    const validPhones = formData.phones.filter((phone) => phone.number.trim());
    if (validPhones.length === 0) {
      newErrors.phones = "Almeno un numero di telefono è obbligatorio";
    } else {
      const invalidPhone = validPhones.find(
        (phone) => !/^\+?[\d\s\-()]{8,}$/.test(phone.number.trim())
      );
      if (invalidPhone) {
        newErrors.phones = "Uno o più numeri di telefono hanno formato non valido";
      }
    }

    const validAddresses = formData.addresses.filter(
      (addr) => addr.street.trim() && addr.city.trim()
    );
    if (validAddresses.length === 0) {
      newErrors.addresses = "Almeno un indirizzo completo è obbligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const addPhone = () => {
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, { id: --index, number: "" }],
    }));
  };

  const removePhone = (phoneId: number) => {
    setFormData((prev) => {
      const phoneToRemove = prev.phones.find((p) => p.id === phoneId);

      if (phoneId >= 0 && phoneToRemove) {
        setRemovedPhones((prevRemoved) => [
          ...prevRemoved,
          { ...phoneToRemove, removed: true },
        ]);
      }

      return {
        ...prev,
        phones: prev.phones.filter((p) => p.id !== phoneId),
      };
    });
  };

  const updatePhone = (phoneId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.map((phone) =>
        phone.id === phoneId ? { ...phone, number: value } : phone
      ),
    }));

    if (errors.phones) {
      setErrors((prev) => ({ ...prev, phones: undefined }));
    }
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, { id: --index, street: "", city: "" }],
    }));

  };
  const removeAddress = (addressId: number) => {
    setFormData((prev) => {
      const addressToRemove = prev.addresses.find((addr) => addr.id === addressId);

      if (addressId >= 0 && addressToRemove) {
        setRemovedAddresses((prevRemoved) => [
          ...prevRemoved,
          { ...addressToRemove, removed: true },
        ]);
      }

      return {
        ...prev,
        addresses: prev.addresses.filter((addr) => addr.id !== addressId),
      };
    });
  };

  const updateAddress = (
    addressId: number,
    field: "street" | "city",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr) =>
        addr.id === addressId ? { ...addr, [field]: value } : addr
      ),
    }));

    if (errors.addresses) {
      setErrors((prev) => ({ ...prev, addresses: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const newPhones = formData.phones.filter((p) => p.id < 0 && p.number.trim());
      const updatedPhones = formData.phones.filter(
        (p) => p.id >= 0 && p.number.trim()
      );

      const newAddresses = formData.addresses.filter((p) => p.id < 0 && p.city.trim());
      const updatedAddresses = formData.addresses.filter(
        (p) => p.id >= 0 && p.city.trim()
      );
      const payload = {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        phones: {
          new: newPhones,
          updated: updatedPhones,
          removed: removedPhones,
        },
        addresses: {
          new: newAddresses,
          updated: updatedAddresses,
          removed: removedAddresses,
        }
      };

      const response = await fetch(
        `http://localhost:10000/api/clients/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Errore aggiornamento cliente");

      navigate(`/view-client/${id}`);
    } catch (error) {
      console.error("Errore nell'aggiornamento:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to={`/view-client/${id}`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna al Cliente
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Modifica Cliente</h1>
          <p className="text-gray-600">Aggiorna i dati del cliente</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Inserisci il nome completo"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Inserisci l'email (opzionale)"
              />
            </div>

            {/* Telefoni */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Numeri di Telefono <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addPhone}
                  className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Aggiungi
                </button>
              </div>

              <div className="space-y-3">
                {formData.phones.map((phone, idx) => (
                  <div key={phone.id} className="flex gap-2">
                    <input
                      type="tel"
                      value={phone.number}
                      onChange={(e) => updatePhone(phone.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Numero di telefono"
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(phone.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.phones && <p className="mt-1 text-sm text-red-600">{errors.phones}</p>}
            </div>

            {/* Indirizzi */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Indirizzi <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addAddress}
                  className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Aggiungi
                </button>
              </div>

              <div className="space-y-3">
                {formData.addresses.map((addr) => (
                  <div key={addr.id} className="flex gap-2">
                    <input
                      type="text"
                      value={addr.street}
                      onChange={(e) => updateAddress(addr.id, "street", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Via"
                    />
                    <input
                      type="text"
                      value={addr.city}
                      onChange={(e) => updateAddress(addr.id, "city", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Città"
                    />
                    <button
                      type="button"
                      onClick={() => removeAddress(addr.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.addresses && <p className="mt-1 text-sm text-red-600">{errors.addresses}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save size={18} />
              Salva
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
