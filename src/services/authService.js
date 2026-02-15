import jwt from 'jsonwebtoken';
import { createHash, isValidPassword } from '../utils/hashPassword.js';
import userRepository from '../repositories/userRepository.js';
import cartRepository from '../repositories/cartRepository.js';
import { createUserDTO } from '../dto/userDTO.js';
import config from '../config/envConfig.js';

class AuthService {

    async register(userData) {
        try {
            const { first_name, last_name, email, age, password } = userData;

            if (!first_name || !last_name || !email || !age || !password) {
                throw new Error('Todos los campos son requeridos');
            }

            const emailExists = await userRepository.emailExists(email);
            if (emailExists) {
                throw new Error('El email ya está registrado');
            }

            const newCart = await cartRepository.create({ products: [] });

            const newUser = await userRepository.create({
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: newCart._id,
                role: 'user'
            });

            return createUserDTO(newUser);
        } catch (error) {
            throw new Error(`Error en registro: ${error.message}`);
        }
    }

    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }

            const user = await userRepository.getUserByEmail(email);
            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            const isPasswordValid = isValidPassword(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Credenciales inválidas');
            }

            const token = this.generateToken({
                userId: user._id,
                email: user.email,
                role: user.role
            });

            return {
                user: createUserDTO(user),
                token
            };
        } catch (error) {
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    generateToken(payload) {
        try {
            const token = jwt.sign(
                payload,
                config.jwt.secret,
                { expiresIn: config.jwt.expiration }
            );
            return token;
        } catch (error) {
            throw new Error(`Error al generar token: ${error.message}`);
        }
    }

    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            return decoded;
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    async getCurrentUser(userId) {
        try {
            const user = await userRepository.getUserWithCart(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return createUserDTO(user);
        } catch (error) {
            throw new Error(`Error al obtener usuario actual: ${error.message}`);
        }
    }
}

export default new AuthService();