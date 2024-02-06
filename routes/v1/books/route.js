const { Router } = require('express');
const booksController = require('./controller').default;
const router = Router();

router.post('/add', booksController.addNewBook);

router.get('/all', booksController.getBooks);

router.get('/:id', booksController.getBook);

router.put('/update/:id', booksController.updateBook);

exports.default = router;