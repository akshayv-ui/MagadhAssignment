const purchaseService = require('./service').default;

const purchaseController = Object.freeze({
    newOrder: async (req, res) => {
        const { userBooks, userId } = req.body;
        const newOrder = await purchaseService.newPurchaseOrder({ userBooks, userId });
        if (typeof newOrder === 'string') {
            return res.status(400).send({ message: newOrder });
        }
        return res.status(200).send(newOrder);
    },

    totalRevenue: async (req, res) => {
        const { books = [], authorsIds = [] } = req.body;
        const totalRevenue = await purchaseService.totalRevenue({ books, authorsIds });
        return res.status(200).json({
            message: "Total Revenue",
            totalRevenue
        });
    },

    updatePurchase: async (req, res) => {
        const { invoice, userBooks } = req.body;
        const updatedPurchase = await purchaseService.updatePurchase({ invoice, userBooks });
        if (typeof updatedPurchase === 'string') {
            return res.status(400).send({ message: updatedPurchase });
        }
        return res.status(200).send(updatedPurchase);
    }
});

exports.default = purchaseController;