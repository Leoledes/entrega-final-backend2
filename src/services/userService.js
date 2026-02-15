import userRepository from '../repositories/userRepository.js';
import { createUserDTO, createUserDTOArray } from '../dto/userDTO.js';
import { createHash } from '../utils/hashPassword.js';

class UserService {
    async getAllUsers(options = {}) {
        try {
            const users = await userRepository.getAll({}, options);
            return createUserDTOArray(users);
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    async getUserById(userId) {
        try {
            const user = await userRepository.getById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return createUserDTO(user);
        } catch (error) {
            throw new Error(`Error al obtener usuario: ${error.message}`);
        }
    }

    async getUserWithCart(userId) {
        try {
            const user = await userRepository.getUserWithCart(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return createUserDTO(user);
        } catch (error) {
            throw new Error(`Error al obtener usuario con carrito: ${error.message}`);
        }
    }

    async updateUser(userId, updateData) {
        try {
            const { email, password, role, ...safeData } = updateData;

            const updatedUser = await userRepository.update(userId, safeData);
            if (!updatedUser) {
                throw new Error('Usuario no encontrado');
            }
            return createUserDTO(updatedUser);
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            const deletedUser = await userRepository.delete(userId);
            if (!deletedUser) {
                throw new Error('Usuario no encontrado');
            }
            return { message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    async changeUserRole(userId, newRole) {
        try {
            const validRoles = ['user', 'admin', 'premium'];
            if (!validRoles.includes(newRole)) {
                throw new Error('Rol inválido');
            }

            const updatedUser = await userRepository.update(userId, { role: newRole });
            if (!updatedUser) {
                throw new Error('Usuario no encontrado');
            }
            return createUserDTO(updatedUser);
        } catch (error) {
            throw new Error(`Error al cambiar rol: ${error.message}`);
        }
    }

    async getUsersByRole(role) {
        try {
            const users = await userRepository.getUsersByRole(role);
            return createUserDTOArray(users);
        } catch (error) {
            throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
        }
    }

    async updatePassword(userId, newPassword, oldPassword = null) {
        try {
            const user = await userRepository.getById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            if (oldPassword) {
                const { isValidPassword } = await import('../utils/hashPassword.js');
                if (!isValidPassword(oldPassword, user.password)) {
                    throw new Error('Contraseña actual incorrecta');
                }
            }

            const hashedPassword = createHash(newPassword);

            await userRepository.updatePassword(userId, hashedPassword);

            return { message: 'Contraseña actualizada exitosamente' };
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }
}

export default new UserService();