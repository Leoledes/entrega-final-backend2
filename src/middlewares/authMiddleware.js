import passport from 'passport';

export const isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error en la autenticación'
            });
        }

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'No autenticado. Por favor inicia sesión'
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

export const isAuthenticatedAsync = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No autenticado. Token no proporcionado'
            });
        }

        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
        }

        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Error en la autenticación',
            error: error.message
        });
    }
};