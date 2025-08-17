import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getQuotes(req, res) {
   try {
       const quotes = await prisma.quotes.findMany({
           include: {
               quote_items: true,
               clients: true,
               client_addresses: true,
           }
       });

       quotes.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : -1)

    res.json(quotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }

}


export async function getQuote(req, res) {
  try {
    const id = parseInt(req.params.id);
    const quote = await prisma.quotes.findUnique({
      where: { id },
      include: { quote_items: true, client_addresses: true },
    });

    if (!quote) return res.status(404).json({ error: 'Customer not found' });


    res.json(quote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
export async function deleteQuote(req, res) {
  try {
    const id = parseInt(req.params.id);
    const quote = await prisma.quotes.findUnique({
      where: { id },
    });

    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    await prisma.quotes.delete({
        where: { id },
    })

    res.json(quote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function createQuote(req, res) {
  try {
    const { description, clientId, clientAddressId, items, total } = req.body;

    if (!description || !clientId || !clientAddressId || !items?.length) {
      return res.status(400).json({ error: 'Dati incompleti per creare il preventivo' });
    }

    const newQuote = await prisma.quotes.create({
      data: {
        description,
        total_amount: total,
        status: 'draft',
        clients: {
          connect: { id: parseInt(clientId) }
        },
        client_addresses: {
          connect: { id: parseInt(clientAddressId) }
        },
        quote_items: {
          create: items.map(item => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.total
          }))
        }
      },
      include: {
        quote_items: true,
        client_addresses: true,
        clients: true
      }
    });

    res.status(201).json(newQuote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossibile creare il preventivo' });
  }
}

export async function updateQuote(req, res) {
  try {
      console.log(req.body);
    const id = parseInt(req.params.id);
    const {quote, items } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'Dati item mancanti' });
    }


    if (quote) {
        await prisma.quotes.update({
            where: { id },
            data: {
                client_id: parseInt(quote.client_id),
                client_address_id: parseInt(quote.client_address_id),
                description: quote.description,
                updated_at: new Date(),
            },
        });
    }




     // 1. Rimuove gli item presenti in "removed"
    if (items.removed?.length) {
      const removedIds = items.removed.map(item => item.id);
      await prisma.quote_items.deleteMany({
        where: { id: { in: removedIds } },
      });
    }

    // 2. Aggiorna gli item presenti in "updated"
    if (items.updated?.length) {
      for (const item of items.updated) {
        await prisma.quote_items.update({
          where: { id: item.id },
          data: {
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.quantity * item.unitPrice,
          },
        });
      }
    }

    // 3. Crea i nuovi item presenti in "new"
    if (items.new?.length) {
      await prisma.quote_items.createMany({
        data: items.new.map(item => ({
          quote_id: id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.quantity * item.unitPrice,
        })),
      });
    }

    // 4. Ricalcola il totale del preventivo
    const allItems = await prisma.quote_items.findMany({
      where: { quote_id: id },
    });
    const totalAmount = allItems.reduce((sum, i) => sum + Number(i.total_price), 0);

    // 5. Aggiorna il totale del preventivo
    const updatedQuote = await prisma.quotes.update({
      where: { id },
      data: { total_amount: totalAmount },
      include: { quote_items: true, clients: true, client_addresses: true },
    });

    res.json(updatedQuote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossibile aggiornare il preventivo' });
  }
}
