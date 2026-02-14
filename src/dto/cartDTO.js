import { createProductDTO } from './productDTO.js';

class CartDTO {
    constructor(cart) {
        this.id = cart._id;
        
        this.products = cart.products ? cart.products.map(item => {
            return {
                product: item.product ? createProductDTO(item.product) : item.product,
                quantity: item.quantity
            };
        }) : [];
        
        this.totalItems = this.products.reduce((sum, item) => sum + item.quantity, 0);
        
        this.totalPrice = this.products.reduce((sum, item) => {
            if (item.product && item.product.price) {
                return sum + (item.product.price * item.quantity);
            }
            return sum;
        }, 0);
    }
}

export const createCartDTO = (cart) => {
    if (!cart) return null;
    return new CartDTO(cart);
};

export const createCartDTOArray = (carts) => {
    if (!carts || !Array.isArray(carts)) return [];
    return carts.map(cart => new CartDTO(cart));
};

export default CartDTO;