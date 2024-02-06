const cuid2 = require('@paralleldrive/cuid2');
const sendEmailQueue = require('../../../queues/sendMailqueue').sendEmailQueue;
const db = require('../../../services/prisma').default;

const purchaseService = Object.freeze({
    newPurchaseOrder: async (body) => {
        const { userBooks, userId } = body;

        const invoice = 'inv_' + cuid2.createId();
        let totalAmountPayByUser = 0;

        const authorEmails = [];

        for (const userBook of userBooks) {

            const book = await db.books.findFirst({ where: { id: userBook.bookId } });
            if (book.availableCount < userBook.quantity) {
                return `Not enough quantity available for ${book.name}`;
            }

            book.availableCount -= userBook.quantity;
            totalAmountPayByUser += book.price * userBook.quantity;

            const authorIds = await db.bookAuthor.findMany({ where: { bookId: book.id }, select: { Author: { select: { email: true } } } });

            authorEmails.push(...authorIds.map(author => author.Author.email));

            let purchaseId = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-`;

            const purchaseHistory = await db.$queryRawUnsafe(`
                SELECT * FROM purchaseHistory order by createdAt desc limit 1
            `);


            if (purchaseHistory.length === 0) {
                purchaseId += '1';
            } else {
                const lastPurchaseId = purchaseHistory[0]?.purchaseId;
                const lastPurchaseUniqueNumber = parseInt(lastPurchaseId.split('-')[2]);
                purchaseId += lastPurchaseUniqueNumber + 1;
            }

            await db.$transaction(async (tx) => {
                const sellCount = parseInt(book.sellCount) + userBook.quantity;
                await tx.books.update({ where: { id: book.id }, data: { availableCount: book.availableCount, sellCount } });
                await tx.purchaseHistory.create({
                    data: {
                        invoice,
                        purchaseId,
                        Users: { connect: { id: userId } },
                        Books: { connect: { id: book.id } },
                        quantity: userBook.quantity,
                        price: book.price
                    }
                });
            });

        }

        const sendEmailData = authorEmails.map(email => ({ to: email, subject: 'New Purchase Order', text: `A new purchase order has been placed` }));

        await sendEmailQueue.add('sendEmailQueue', { sendEmailData }, { attempts: 3, delay: '1000' });
        return { invoice, totalAmountPayByUser };
    },

    totalRevenue: async (body) => {
        const { books, authorsIds } = body;

        if (books.length === 0 && authorsIds.length === 0) {
            const totalRevenue = await db.$queryRawUnsafe(`
                SELECT sum(price * quantity) as totalRevenue FROM purchaseHistory
            `);
            return totalRevenue[0].totalRevenue;
        }

        let query = `
            select sum(ph.quantity * ph.amount) as 'totalRevenue' from purchasehistory ph
            join books b on b.id = ph.bookId
            join bookauthor ba on ba.bookId = b.id
            join author a on a.id = ba.authorId
            where ph.active = 1
        `;

        if (books.length > 0) {
            query += ` and b.id in (${books.join(',')})`;
        }

        if (authorsIds.length > 0) {
            if (books.length > 0) query += ' or '
            else query += ' and ';
            query += `a.id in (${authorsIds.join(',')})`;
        }

        const totalRevenue = await db.$queryRawUnsafe(query);
        return totalRevenue[0].totalRevenue;

    },

    getPurchaseHistory: async (body) => {
        const { invoice, userBooks } = body;
        const specificPurchase = await db.purchaseHistory.findMany({ where: { invoice } });

        if (specificPurchase.length === 0) {
            return 'No purchase history found';
        }

        const totalAmountPayByUser = specificPurchase.reduce((acc, purchase) => acc + purchase.price * purchase.quantity, 0);

        await db.$transaction(async tx => {

            for (const userBook of userBooks) {
                const book = await db.books.findFirst({ where: { id: userBook.bookId } });

                const specificPurchaseId = specificPurchase.find(purchase => purchase.bookId === userBook.bookId);

                if (userBook.active === false) {
                    // Changes the active status in the purchase history

                    await tx.books.update({
                        where: { id: userBookbookId }, data: {
                            availableCount: book.availableCount + specificPurchaseId.quantity,
                            sellCount: book.sellCount - specificPurchaseId.quantity
                        }
                    });
                    await tx.purchaseHistory.update({ where: { id: specificPurchaseId.id }, data: { active: false } });

                    totalAmountPayByUser -= specificPurchaseId.price * specificPurchaseId.quantity;
                }
                else {
                    // Changes quantity in the purchase history

                    if (userBook.quantity < specificPurchaseId.quantity) {
                        await tx.books.update({
                            where: { id: userBook.bookId }, data: {
                                availableCount: book.availableCount + (specificPurchaseId.quantity - userBook.quantity),
                                sellCount: book.sellCount - (specificPurchaseId.quantity - userBook.quantity)
                            }
                        });

                        await tx.purchaseHistory.update({
                            where: { id: specificPurchaseId.id }, data: {
                                quantity: userBook.quantity,
                                price: book.price
                            }
                        });

                        totalAmountPayByUser -= (specificPurchaseId.quantity - userBook.quantity) * book.price;
                    } else {
                        await tx.books.update({
                            where: { id: userBook.bookId }, data: {
                                availableCount: book.availableCount - (userBook.quantity - specificPurchaseId.quantity),
                                sellCount: book.sellCount + (userBook.quantity - specificPurchaseId.quantity)
                            }
                        });

                        await tx.purchaseHistory.update({
                            where: { id: specificPurchaseId.id }, data: {
                                quantity: userBook.quantity,
                                price: book.price
                            }
                        });

                        totalAmountPayByUser += (userBook.quantity - specificPurchaseId.quantity) * book.price;
                    }
                }

            }
        }, { maxWait: 5000 });

        return { invoice, totalAmountPayByUser };
    }
});

exports.default = purchaseService;