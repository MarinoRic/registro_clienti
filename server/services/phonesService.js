 import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function addPhoneService(req) {
    const {customer_id,number, is_primary} = req;

    const existingPhone = await prisma.customer_phones.findUnique({
        where: {customer_id, number},
    })

  if (existingPhone) {
    return { status: 400, message: "Il numero di telefono esiste già" };
  }

   const phone = await prisma.customer_phones.create({
        data: {
            number,
            is_primary: is_primary ?? false,
            customers : {
                connect : {id : customer_id}
            }
        }
    });

  return { status: 201, message: "Telefono aggiunto con successo", data: phone };
}


export async function editPhoneService(req) {
    const {id, number, is_primary, customer_id} = req;


    const phone = await prisma.customer_phones.update({
        where: {id, customer_id},
        data: {
            number,
            is_primary: is_primary ?? false,
            customers : {
                connect : {customer_id}
            }
        }
    });

  return { status: 201, message: "Telefono aggiunto con successo", data: phone };
}


export async function deletePhonesService(req) {
    const {ids, customer_id} = req;

    await prisma.customer_phones.deleteMany({
         where: {
             id: {in: ids},
             customer_id
         }
    });
  return { status: 201, message: "Telefono aggiunto con successo", data: phone };
}