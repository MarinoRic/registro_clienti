import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getAddressesByCustomer(client_id) {
  return prisma.client_addresses.findMany({
      where: {
          client_id: client_id,
      },
  });
}
