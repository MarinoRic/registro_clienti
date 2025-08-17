import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getPhonesByCustomer(client_id) {
  return prisma.client_phones.findMany({
    where: {
      client_id: client_id,
    },
  });
}



export async function editPhone(req, res) {
  try {
    const id = parseInt(req.params.id);

    const phones = await prisma.client_phones.findMany({
      where: { client_id: id }  // id del cliente
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.clients.update({
      where: { id },
      data: {
        name: req.body.name ?? user.name,
        email: req.body.email ?? user.email,
      },
    });



    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}