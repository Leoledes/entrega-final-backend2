import { Router } from 'express';
import passport from '../config/passportConfig.js';
import authService from '../services/authService.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const user = await authService.register(req.body);
        
        res.status(201).json({ 
            status: 'success', 
            message: 'Usuario registrado exitosamente',
            user
        });
    } catch (error) {
        res.status(400).json({ 
            status: 'error', 
            message: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.cookie('token', result.token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ 
            status: 'success', 
            message: 'Login exitoso',
            user: result.user,
            token: result.token
        });
    } catch (error) {
        res.status(401).json({ 
            status: 'error', 
            message: error.message
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