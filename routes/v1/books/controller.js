const bookService = require('./service').default;
const queryHelper = require('../../../helpers').default;

const booksController = Object.freeze({
    addNewBook: async (req, res) => {
        const { title, authors, description, price, totalQuantity } = req.body;
        const newBook = await bookService.addNewBook({ title, authors, description, price, totalQuantity });
        return res.status(201).json({
            message: 'Book added successfully',
            data: newBook
        });
    },

    getBooks: async (req, res) => {
        const books = await bookService.getBooks();
        return res.status(200).json(books);
    },

    getBook: async (req, res) => {
        const { name, id, author, price } = req.query;
        const book = await bookService.getBook({ name, id, author, price });
        return res.status(200).json(book);
    },

    updateBook: async (req, res) => {
        const { id } = req.params;
        const { title, authors = [], description, price, quantity } = req.body;
        const updatedBook = await bookService.updateBook({ id, title, authors, description, price, quantity });
        return res.status(200).json(updatedBook);
    }
});

exports.default = booksController;