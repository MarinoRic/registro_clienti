import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

interface Phone {
  id: number;
  number: string;
}

interface Address {
  id: number;
  street: string;
  city: string;
}

interface ClientForm {
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

export default function AddClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ClientForm>({
    name: "",
    email: "",
    phones: [{ id: 1, number: "" }],
    addresses: [{ id: 1, street: "", city: "" }],
  });

  const [nextPhoneId, setNextPhoneId] = useState(2);
  const [nextAddressId, setNextAddressId] = useState(2);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validazione nome obbligatorio
    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    }

    // Validazione telefoni (almeno uno obbligatorio)
    const validPhones = formData.phones.filter((phone) => phone.number.trim());
    if (validPhones.length === 0) {
      newErrors.phones = "Almeno un numero di telefono è obbligatorio";
    } else {
      // Validazione formato telefoni
      const invalidPhone = validPhones.find(
        (phone) => !/^\+?[\d\s\-()]{8,}$/.test(phone.number.trim()),
      );
      if (invalidPhone) {
        newErrors.phones =
          "Uno o più numeri di telefono hanno formato non valido";
      }
    }

    // Validazione indirizzi (almeno uno obbligatorio)
    const validAddresses = formData.addresses.filter(
      (addr) => addr.street.trim() && addr.city.trim(),
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
      phones: [...prev.phones, { id: nextPhoneId, number: "" }],
    }));
    setNextPhoneId((prev) => prev + 1);
  };

  const removePhone = (phoneId: number) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((phone) => phone.id !== phoneId),
    }));
  };

  const updatePhone = (phoneId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.map((phone) =>
        phone.id === phoneId ? { ...phone, number: value } : phone,
      ),
    }));

    if (errors.phones) {
      setErrors((prev) => ({ ...prev, phones: undefined }));
    }
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { id: nextAddressId, street: "", city: "" },
      ],
    }));
    setNextAddressId((prev) => prev + 1);
  };

  const removeAddress = (addressId: number) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((addr) => addr.id !== addressId),
    }));
  };

  const updateAddress = (
    addressId: number,
    field: "street" | "city",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr) =>
        addr.id === addressId ? { ...addr, [field]: value } : addr,
      ),
    }));

    if (errors.addresses) {
      setErrors((prev) => ({ ...prev, addresses: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {

      const response = await fetch('http://localhost:10000/api/clients', {
        method: 'POST',
        headers: {
        //  'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phones: formData.phones.filter(p => p.number.trim()).map(p => ({ number: p.number })),
          addresses: formData.addresses.filter(a => a.street.trim() && a.city.trim())
        })
      });
      if (!response.ok) throw new Error('Errore creazione cliente');
      await response.json();
      console.log("Salvando cliente:", formData);


      navigate("/users");
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      // TODO: Mostrare errore all'utente (toast/alert)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-900">
            Aggiungi Nuovo Cliente
          </h1>
          <p className="text-gray-600">Inserisci i dati del nuovo cliente</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Numeri di Telefono <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addPhone}
                  className="flex items-center justify-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm w-full sm:w-auto"
                >
                  <Plus size={16} className="mr-1" />
                  Aggiungi
                </button>
              </div>

              <div className="space-y-3">
                {formData.phones.map((phone, index) => (
                  <div key={phone.id} className="flex gap-2">
                    <input
                      type="tel"
                      value={phone.number}
                      onChange={(e) => updatePhone(phone.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={`Telefono ${index + 1}`}
                    />
                    {formData.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhone(phone.id)}
                        className="flex-shrink-0 px-3 py-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.phones && (
                <p className="mt-1 text-sm text-red-600">{errors.phones}</p>
              )}
            </div>

            {/* Indirizzi */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Indirizzi <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addAddress}
                  className="flex items-center justify-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm w-full sm:w-auto"
                >
                  <Plus size={16} className="mr-1" />
                  Aggiungi
                </button>
              </div>

              <div className="space-y-4">
                {formData.addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Indirizzo {index + 1}
                      </h4>
                      {formData.addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(address.id)}
                          className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) =>
                          updateAddress(address.id, "street", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Via, numero civico"
                      />
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) =>
                          updateAddress(address.id, "city", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Città"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {errors.addresses && (
                <p className="mt-1 text-sm text-red-600">{errors.addresses}</p>
              )}
            </div>

            {/* Pulsanti */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/users"
                className="w-full sm:w-auto text-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 transition-colors"
              >
                <Save size={20} className="mr-2" />
                {isSubmitting ? "Salvando..." : "Salva Cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
