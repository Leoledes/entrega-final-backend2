import { ROLES, hasPermission, isAdmin } from '../config/roles.js';

export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No autenticado. Por favor inicia sesión'
            });
        }

        const userRole = req.user.role;
        
        if (!hasPermission(userRole, allowedRoles)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para realizar esta acción',
                requiredRoles: allowedRoles,
                yourRole: userRole
            });
        }

        next();
    };
};

export const onlyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user.role)) {
        return res.status(403).json({
            status: 'error',
            message: 'Solo administradores pueden realizar esta acción'
        });
    }

    next();
};

export const onlyUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado'
        });
    }

    if (req.user.role !== ROLES.USER) {
        return res.status(403).json({
            status: 'error',
            message: 'Solo usuarios pueden realizar compras'
        });
    }

    next();
};

export const canModifyResource = (resourceOwnerField = 'owner') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No autenticado'
            });
        }

        if (isAdmin(req.user.role)) {
            return next();
        }

        const resource = req.resource;
        
        if (!resource) {
            return res.status(404).json({
                status: 'error',
                message: 'Recurso no encontrado'
            });
        }

        const resourceOwner = resource[resourceOwnerField];
        const userId = req.user._id ? req.user._id.toString() : req.user.id;

        if (resourceOwner && resourceOwner.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para modificar este recurso'
            });
        }

        next();
    };
};

export const cannotAddOwnProducts = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado'
        });
    }

    if (req.user.role === ROLES.USER) {
        return next();
    }

    if (req.user.role === ROLES.PREMIUM || req.user.role === ROLES.ADMIN) {
        return res.status(403).json({
            status: 'error',
            message: 'Los vendedores no pueden agregar productos al carrito'
        });
    }

    next();
};