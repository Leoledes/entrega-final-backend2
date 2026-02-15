import productRepository from '../repositories/productRepository.js';
import { createProductDTO, createProductDTOArray } from '../dto/productDTO.js';

class ProductService {

    async getAllProducts(page = 1, limit = 10, query = {}, sort = {}) {
        try {
            const result = await productRepository.getProductsPaginated(page, limit, query, sort);
            
            return {
                products: createProductDTOArray(result.products),
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalProducts: result.totalProducts
            };
        } catch (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    }

    async getProductById(productId) {
        try {
            const product = await productRepository.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            return createProductDTO(product);
        } catch (error) {
            throw new Error(`Error al obtener producto: ${error.message}`);
        }
    }

    async createProduct(productData, userId = null, userRole = null) {
        try {
            const { title, description, price, code, stock, category, thumbnail } = productData;

            if (!title || !description || price === undefined || !code || stock === undefined || !category) {
                throw new Error('Faltan campos requeridos');
            }

            const codeExists = await productRepository.codeExists(code);
            if (codeExists) {
                throw new Error('El código de producto ya existe');
            }

            if (price < 0) {
                throw new Error('El precio debe ser mayor o igual a 0');
            }

            if (stock < 0) {
                throw new Error('El stock no puede ser negativo');
            }

            let owner = 'admin';
            if (userRole === 'premium' && userId) {
                owner = userId;
            }

            const newProduct = await productRepository.create({
                title,
                description,
                price,
                code,
                stock,
                category,
                thumbnail: thumbnail || [],
                status: true,
                owner
            });

            return createProductDTO(newProduct);
        } catch (error) {
            throw new Error(`Error al crear producto: ${error.message}`);
        }
    }

    async updateProduct(productId, updateData, userId = null, userRole = null) {
        try {
            const product = await productRepository.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            if (userId && userRole !== 'admin' && product.owner !== userId) {
                throw new Error('No tienes permisos para actualizar este producto');
            }

            if (updateData.code && updateData.code !== product.code) {
                const codeExists = await productRepository.codeExists(updateData.code);
                if (codeExists) {
                    throw new Error('El código ya existe en otro producto');
                }
            }

            if (updateData.price !== undefined && updateData.price < 0) {
                throw new Error('El precio debe ser mayor o igual a 0');
            }

            if (updateData.stock !== undefined && updateData.stock < 0) {
                throw new Error('El stock no puede ser negativo');
            }

            const updatedProduct = await productRepository.update(productId, updateData);
            return createProductDTO(updatedProduct);
        } catch (error) {
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }
    }

    async deleteProduct(productId, userId = null, userRole = null) {
        try {
            const product = await productRepository.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            if (userId && userRole !== 'admin' && product.owner !== userId) {
                throw new Error('No tienes permisos para eliminar este producto');
            }

            await productRepository.delete(productId);
            return { message: 'Producto eliminado exitosamente' };
        } catch (error) {
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    }

    async getProductsByCategory(category, options = {}) {
        try {
            const products = await productRepository.getProductsByCategory(category, options);
            return createProductDTOArray(products);
        } catch (error) {
            throw new Error(`Error al obtener productos por categoría: ${error.message}`);
        }
    }

    async getProductsInStock(minStock = 1) {
        try {
            const products = await productRepository.getProductsInStock(minStock);
            return createProductDTOArray(products);
        } catch (error) {
            throw new Error(`Error al obtener productos en stock: ${error.message}`);
        }
    }

    async updateProductStock(productId, quantity) {
        try {
            const product = await productRepository.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            if (product.stock + quantity < 0) {
                throw new Error('Stock insuficiente para esta operación');
            }

            const updatedProduct = await productRepository.updateStock(productId, quantity);
            return createProductDTO(updatedProduct);
        } catch (error) {
            throw new Error(`Error al actualizar stock: ${error.message}`);
        }
    }

    async checkProductStock(productId, quantity) {
        try {
            const result = await productRepository.checkStock(productId, quantity);
            return result;
        } catch (error) {
            throw new Error(`Error al verificar stock: ${error.message}`);
        }
    }
}

export default new ProductService();