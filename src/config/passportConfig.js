import passport from 'passport';
import local from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userModel from '../dao/models/userModel.js';
import cartModel from '../dao/models/cartModel.js';
import { createHash, isValidPassword } from '../utils/hashPassword.js';
import dotenv from 'dotenv';

dotenv.config();

const LocalStrategy = local.Strategy;

export const JWT_SECRET = process.env.JWT_SECRET || 'coderSecretKey123';

const initializePassport = () => {

    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const { first_name, last_name, age } = req.body;
            try {
                const user = await userModel.findOne({ email: username });
                if (user) return done(null, false, { message: 'El usuario ya existe' });

                const newCart = await cartModel.create({});
                
                const newUser = {
                    first_name,
                    last_name,
                    email: username,
                    age,
                    password: createHash(password),
                    cart: newCart._id,
                    role: 'user'
                };

                const result = await userModel.create(newUser);
                return done(null, result);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });
                if (!user) return done(null, false);

                if (!isValidPassword(password, user.password)) return done(null, false);
                
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    const cookieExtractor = req => (req && req.cookies) ? req.cookies['coderCookieToken'] : null;

    passport.use('current', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: JWT_SECRET
    }, async (jwt_payload, done) => {
        try {
            const user = await userModel.findById(jwt_payload.id).populate('cart');
            
            if (!user) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }));
};

export default initializePassport;