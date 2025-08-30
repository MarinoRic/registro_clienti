import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { formatPhones, formatAddresses } from '../../utils/formatData.js';

export async function createCustomerService(data) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Name is required');
  }

    if (!data.phones || data.phones.length === 0) {
    throw new Error('Phones are required');
  }
      if (!data.addresses || data.addresses.length === 0) {
    throw new Error('Addresses are required');
  }

  return prisma.customers.create({
    data: {
      name: data.name,
      email: data.email,
      usersId: data.admin_id,
      phones: { create: formatPhones(data.phones) },
      addresses: { create: formatAddresses(data.addresses) },
    },
    include: { phones: true, addresses: true },
  });
}
