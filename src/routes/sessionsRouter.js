import { Router } from 'express';
import userModel from '../dao/models/userModel.js';
import { createHash, isValidPassword } from '../utils/hashPassword.js';
import jwt from 'jsonwebtoken';
import passport from '../config/passportConfig.js';
import config from '../config/envConfig.js';
import { createUserDTO } from '../dto/userDTO.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Todos los campos son requeridos' 
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'El email ya está registrado' 
            });
        }

        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: null,
            role: 'user'
        });

        res.status(201).json({ 
            status: 'success', 
            message: 'Usuario registrado exitosamente',
            user: createUserDTO(newUser)
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al registrar usuario',
            error: error.message 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Email y contraseña son requeridos' 
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Credenciales inválidas' 
            });
        }

        if (!isValidPassword(password, user.password)) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Credenciales inválidas' 
            });
        }

        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            }, 
            config.jwt.secret,
            { expiresIn: config.jwt.expiration }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ 
            status: 'success', 
            message: 'Login exitoso',
            user: createUserDTO(user),
            token
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al iniciar sesión',
            error: error.message 
        });
    }
});

router.get('/current', 
    passport.authenticate('current', { session: false }), 
    (req, res) => {
        res.json({ 
            status: 'success', 
            user: req.user 
        });
    }
);

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ 
        status: 'success', 
        message: 'Logout exitoso' 
    });
});

export default router;