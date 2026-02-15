import cartRepository from '../repositories/cartRepository.js';
import productRepository from '../repositories/productRepository.js';
import { createCartDTO } from '../dto/cartDTO.js';

class CartService {
    async createCart() {
        try {
            const newCart = await cartRepository.create({ products: [] });
            return createCartDTO(newCart);
        } catch (error) {
            throw new Error(`Error al crear carrito: ${error.message}`);
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await cartRepository.getCartWithProducts(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return createCartDTO(cart);
        } catch (error) {
            throw new Error(`Error al obtener carrito: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await cartRepository.getById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const product = await productRepository.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            const stockCheck = await productRepository.checkStock(productId, quantity);
            if (!stockCheck.available) {
                throw new Error(stockCheck.message);
            }

            const updatedCart = await cartRepository.addProductToCart(cartId, productId, quantity);
            return createCartDTO(await cartRepository.getCartWithProducts(updatedCart._id));
        } catch (error) {
            throw new Error(`Error al agregar producto al carrito: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (quantity < 0) {
                throw new Error('La cantidad no puede ser negativa');
            }

            if (quantity > 0) {
                const stockCheck = await productRepository.checkStock(productId, quantity);
                if (!stockCheck.available) {
                    throw new Error(stockCheck.message);
                }
            }

            const updatedCart = await cartRepository.updateProductQuantity(cartId, productId, quantity);
            return createCartDTO(await cartRepository.getCartWithProducts(updatedCart._id));
        } catch (error) {
            throw new Error(`Error al actualizar cantidad: ${error.message}`);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const updatedCart = await cartRepository.removeProductFromCart(cartId, productId);
            return createCartDTO(await cartRepository.getCartWithProducts(updatedCart._id));
        } catch (error) {
            throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await cartRepository.getById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const clearedCart = await cartRepository.clearCart(cartId);
            return createCartDTO(clearedCart);
        } catch (error) {
            throw new Error(`Error al vaciar carrito: ${error.message}`);
        }
    }

    async calculateCartTotal(cartId) {
        try {
            const total = await cartRepository.calculateCartTotal(cartId);
            return total;
        } catch (error) {
            throw new Error(`Error al calcular total: ${error.message}`);
        }
    }

    async verifyCartStock(cartId) {
        try {
            const cart = await cartRepository.getCartWithProducts(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const results = {
                available: [],
                unavailable: []
            };

            for (const item of cart.products) {
                const stockCheck = await productRepository.checkStock(
                    item.product._id,
                    item.quantity
                );

                if (stockCheck.available) {
                    results.available.push({
                        product: item.product,
                        quantity: item.quantity
                    });
                } else {
                    results.unavailable.push({
                        product: item.product,
                        requestedQuantity: item.quantity,
                        availableStock: stockCheck.currentStock
                    });
                }
            }

            return results;
        } catch (error) {
            throw new Error(`Error al verificar stock del carrito: ${error.message}`);
        }
    }
}

export default new CartService();