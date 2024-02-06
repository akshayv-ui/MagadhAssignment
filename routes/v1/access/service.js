const bcrypt = require('bcrypt');
const cuid2 = require('@paralleldrive/cuid2');
const jwt = require('jsonwebtoken');
const { createTokens } = require('../../../auth/authUtils').default;
const db = require('../../../services/prisma').default;
const { publicKey } = require('../../../configs/index').keys;

const accessService = Object.freeze({
    signIn: async (body) => {
        const { username, password } = body;
        if (username === '' || password === '') {
            return 'Username and password are required';
        }

        const existingUser = await db.users.findUnique({ where: { email: username } });

        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return 'Invalid username or password';
        }

        const accessTokenKey = cuid2.createId();
        const refreshTokenKey = cuid2.createId();

        const [tokens] = await db.$transaction(async tx => {
            const token = await tx.userTokens.create({
                data: {
                    User: { connect: { id: existingUser.id } },
                    accessToken: accessTokenKey,
                    refreshToken: refreshTokenKey
                }
            });

            const tokens = await createTokens({ email: existingUser.email, userId: existingUser.id, userType: existingUser.userType, accessTokenKey, refreshTokenKey });
            return [tokens];
        });

        return tokens;
    },

    refreshToken: async (body) => {
        let { refreshToken, payload } = body;
        refreshToken = String(refreshToken);
        try {
            const userDetails = jwt.verify(refreshToken, publicKey, { algorithms: ['RS256'] });
            const { userId } = userDetails;
            const existingUser = await db.users.findUnique({ where: { id: userId } });
            const accessTokenKey = cuid2.createId();
            const refreshTokenKey = cuid2.createId();
            const [tokens] = await db.$transaction(async (tx) => {
                const token = await tx.userTokens.create({
                    data: {
                        User: { connect: { id: existingUser.id } },
                        accessToken: accessTokenKey,
                        refreshToken: refreshTokenKey,
                    },
                });
                const tokens = await createTokens({
                    email: existingUser.email,
                    userId: existingUser.id,
                    userType: existingUser.userType,
                    accessTokenKey,
                    refreshTokenKey,
                });
                return [tokens];
            });
            return tokens;
        } catch (error) {
            return 'Invalid refresh token';
        }
    },

    createUser: async (body) => {
        const { name, password, email, userType } = body;
        if (password === '' || email === '') {
            return 'Username, password and email are required';
        }

        const user = await db.users.findUnique({ where: { email } });
        if (user) {
            return 'Username already exists';
        }

        const passwordSalt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, passwordSalt);

        const newUser = await db.users.create({ data: { name, email, password: passwordHash, email, userType } });

        return newUser;
    },

    signOut: async (body) => {
        const { refreshToken, accessToken } = body;
        if (refreshToken === '' || accessToken === '') {
            return 'Refresh token and access token are required';
        }

        const payloadData = await decode(accessToken);
        const { userId, accessTokenKey } = payloadData;

        const userToken = await db.userTokens.findUnique({ where: { userId, accessTokenKey } });

        await db.userTokens.update({ where: { id: userToken.id }, data: { active: false } });

        return 'User signed out';
    }
});

exports.default = accessService;