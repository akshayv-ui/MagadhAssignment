const db = require('../../../services/prisma').default;

const bookService = Object.freeze({
    addNewBook: async (body) => {
        const { title, authors, price, totalQuantity } = body;

        const existingBook = await db.books.findFirst({ where: { title: { equals: title } } });

        if (existingBook !== null) {
            return 'Book already exists';
        }

        const book = await db.$transaction(async (tx) => {
            const authorIds = [];
            for (const author of authors) {
                const authorRecord = await tx.author.findFirst({ where: { name: { equals: author.name } } });
                if (authorRecord) {
                    authorIds.push(authorRecord.id);
                } else {
                    const newAuthor = await tx.author.create({ data: { name: author.name, email: author.email } });
                    authorIds.push(newAuthor.id);
                }
            };


            const book = await tx.books.create({
                data: {
                    title, price, totalQuantity, availableCount: totalQuantity
                },
            });

            await tx.bookAuthor.createMany({ data: authorIds.map(authorId => ({ authorId, bookId: book.id })) });

            for (const authorId of authorIds) {
                await tx.books.update({
                    where: { id: book.id }, data: {
                        BookAuthor: {
                            connect: {
                                bookId_authorId: { authorId, bookId: book.id }
                            }
                        }
                    }
                });
            }
            return book;
        })

        return book;
    },

    getBooks: async () => {
        const books = await db.books.findMany({
            include: {
                BookAuthor: {
                    include: {
                        Author: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        return books;
    },

    getBook: async (body) => {
        const { name, id, author, price } = body;

        let searchName = {};
        let searchId = {};
        let searchAuthor = {};
        let searchPrice = {};

        if (name) searchName = { title: { contains: name } };
        if (id) searchId = { id: { equals: id } };
        if (author) searchAuthor = { BookAuthor: { some: { Author: { name: { contains: author } } } } };
        if (price) searchPrice = { price: { equals: price } };

        const books = await db.books.findMany({
            where: {
                title: searchName,
                id: searchId,
                BookAuthor: searchAuthor,
                price: searchPrice
            }
        });

        return books;

    },

    updateBook: async (body) => {
        const { id, title, authors, price, quantity } = body;

        const existingBook = await db.books.findFirst({ where: { id } });

        if (existingBook === null) {
            return 'Book does not exist';
        }

        const book = await db.$transaction(async (tx) => {
            const book = await tx.books.update({
                where: { id },
                data: {
                    title, price, totalQuantity: existingBook.totalQuantity + quantity, availableCount: existingBook.availableCount + quantity
                }
            });

            const authorIds = [];
            for (const author of authors) {
                const authorRecord = await tx.author.findFirst({ where: { name: { equals: author } } });
                if (authorRecord) {
                    authorIds.push(authorRecord.id);
                } else {
                    const newAuthor = await tx.author.create({ data: { name: author } });
                    authorIds.push(newAuthor.id);
                }
            };

            await tx.bookAuthor.deleteMany({ where: { bookId: id } });

            await tx.bookAuthor.createMany({ data: authorIds.map(authorId => ({ authorId, bookId: id })) });

            for (const authorId of authorIds) {
                await tx.books.update({
                    where: { id }, data: {
                        BookAuthor: {
                            connect: {
                                bookId_authorId: { authorId, bookId: id }
                            }
                        }
                    }
                });
            }
            return book;
        });

        return book;
    }
});

exports.default = bookService;