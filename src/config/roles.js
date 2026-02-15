export const ROLES = {
    USER: 'user',
    PREMIUM: 'premium',
    ADMIN: 'admin'
};

export const PERMISSIONS = {
    PRODUCT: {
        CREATE: [ROLES.ADMIN, ROLES.PREMIUM],
        READ: [ROLES.USER, ROLES.PREMIUM, ROLES.ADMIN],
        UPDATE: [ROLES.ADMIN, ROLES.PREMIUM],
        DELETE: [ROLES.ADMIN, ROLES.PREMIUM],
    },

    CART: {
        ADD_PRODUCT: [ROLES.USER, ROLES.PREMIUM],
        UPDATE: [ROLES.USER, ROLES.PREMIUM],
        DELETE: [ROLES.USER, ROLES.PREMIUM],
        PURCHASE: [ROLES.USER, ROLES.PREMIUM]
    },

    USER: {
        VIEW_ALL: [ROLES.ADMIN],
        UPDATE_ROLE: [ROLES.ADMIN],
        DELETE: [ROLES.ADMIN]
    }
};

export const hasPermission = (userRole, requiredRoles) => {
    return requiredRoles.includes(userRole);
};

export const isAdmin = (userRole) => {
    return userRole === ROLES.ADMIN;
};

export const isPremium = (userRole) => {
    return userRole === ROLES.PREMIUM;
};

export const isUser = (userRole) => {
    return userRole === ROLES.USER;
};