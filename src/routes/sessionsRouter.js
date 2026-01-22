import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/passportConfig.js';

const router = Router();

router.post('/register', passport.authenticate('register', { session: false }), async (req, res) => {
    res.send({ status: "success", message: "User registered" });
});

router.post('/login', passport.authenticate('login', { session: false }), async (req, res) => {
    if (!req.user) return res.status(401).send({ status: "error", error: "Invalid credentials" });

    const token = jwt.sign({ id: req.user._id, email: req.user.email, role: req.user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('coderCookieToken', token, { httpOnly: true })
       .send({ status: "success", message: "Logged in" });
});


router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
    res.send({ status: "success", payload: req.user });
});

export default router;