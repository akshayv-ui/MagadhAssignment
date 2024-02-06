const accessService = require('./service').default;

const accessController = Object.freeze({
    signIn: async (req, res) => {
        const { username, password } = req.body;
        const tokens = await accessService.signIn({ username, password });
        if (typeof tokens === 'string') {
            return res.status(400).send({ message: tokens });
        }
        res.locals.refreshToken = tokens.refreshToken;
        return res.status(200).send(tokens);
    },

    refreshToken: async (req, res) => {
        const refreshToken = req.headers['refresh-token'];

        const { payload } = res.locals;
        const tokens = await accessService.refreshToken({ refreshToken, payload });
        if (typeof tokens === 'string') {
            return res.status(400).send({ message: tokens });
        }
        return res.status(200).send(tokens);
    },

    createUser: async (req, res) => {
        const { name, email, password, userType } = req.body;
        const user = await accessService.createUser({ name, email, password, userType });
        if (typeof user === 'string') {
            return res.status(400).send({ message: user });
        }
        return res.status(201).send(user);
    },

    signOut: async (req, res) => {
        const { refreshToken } = res.locals;
        const signOut = await accessService.signOut({ refreshToken });
        if (typeof signOut === 'string') {
            return res.status(400).send({ message: signOut });
        }
        return res.status(200).send(signOut);
    }


});

exports.accessController = accessController;