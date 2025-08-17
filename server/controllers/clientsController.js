import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getCustomers(req, res) {
  try {
    const customers = await prisma.clients.findMany({
      include: { phones: true, addresses: true },
     });
    customers.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : -1)

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function getCustomer(req, res) {
  try {
    const id = parseInt(req.params.id);
    const customer = await prisma.clients.findUnique({
      where: { id },
      include: { phones: true, addresses: true },
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
export async function editCustomers(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid client ID' });

    // Controlla se l'utente esiste
    const user = await prisma.clients.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Aggiorna dati base del cliente
    const updatedUser = await prisma.clients.update({
      where: { id },
      data: {
        name: req.body.name ?? user.name,
        email: req.body.email ?? user.email,
      },
    });

    /** 📞 Gestione telefoni */
    const phones = req.body.phones || {};
    const newPhones = phones.new || [];
    const updatedPhones = phones.updated || [];
    const removedPhones = (phones.removed || []).map(p => p.id);

    if (removedPhones.length > 0) {
      await prisma.client_phones.deleteMany({
        where: { id: { in: removedPhones } },
      });
    }

    for (const phone of updatedPhones) {
      await prisma.client_phones.update({
        where: { id: parseInt(phone.id) },
        data: {
          number: phone.number,
          is_primary: phone.is_primary,
        },
      });
    }

    for (const phone of newPhones) {
      await prisma.client_phones.create({
        data: {
          client_id: id,
          number: phone.number,
          is_primary: phone.is_primary ?? false,
        },
      });
    }

    /** 🏠 Gestione indirizzi */
    const addresses = req.body.addresses || {};
    const newAddresses = addresses.new || [];
    const updatedAddresses = addresses.updated || [];
    const removedAddresses = (addresses.removed || []).map(a => a.id);

    // Rimuovi indirizzi eliminati
    if (removedAddresses.length > 0) {
      await prisma.client_addresses.deleteMany({
        where: { id: { in: removedAddresses } },
      });
    }

    // Aggiorna indirizzi esistenti
    for (const addr of updatedAddresses) {
      await prisma.client_addresses.update({
        where: { id: parseInt(addr.id) },
        data: {
          street: addr.street,
          city: addr.city,
          postal_code: addr.postal_code,
          province: addr.province,
          country: addr.country ?? "Italia",
          is_primary: addr.is_primary ?? false,
        },
      });
    }

    // Aggiungi nuovi indirizzi
    for (const addr of newAddresses) {
      await prisma.client_addresses.create({
        data: {
          client_id: id,
          street: addr.street,
          city: addr.city,
          postal_code: addr.postal_code,
          province: addr.province,
          country: addr.country ?? "Italia",
          is_primary: addr.is_primary ?? false,
        },
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name, email, phones = [], addresses = [] } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newCustomer = await prisma.clients.create({
      data: {
        name,
        email,
        phones: {
          create: phones.map((phone) => ({
            number: phone.number,
            is_primary: phone.is_primary ?? false,
          })),
        },
        addresses: {
          create: addresses.map((address) => ({
            street: address.street,
            city: address.city,
          })),
        },
      },
      include: {
        phones: true,
        addresses: true,
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

export async function deleteCustomer(req, res) {
  try {
       const id = parseInt(req.params.id);
     const customer = await prisma.clients.findUnique({
      include: { phones: true, addresses: true },
       where: {id}
     });

    if(!customer) return res.status(404).json({ error: 'Customer not found' });

    await prisma.clients.delete({
      where: { id },
    });


    res.json(customer);
  } catch (error) {
    console.log(req)
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}
export async function getCustomerQuotes(req, res) {
  try {
       const id = parseInt(req.params.id);
     const customer = await prisma.clients.findUnique({
      include: { quotes: true },
       where: {id}
     });

    if(!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    console.log(req)
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}