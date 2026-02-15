import { Router } from 'express';
import productService from '../services/productService.js';
import productRepository from '../repositories/productRepository.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { authorize, canModifyResource } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sort, category } = req.query;
        
        const query = category ? { category } : {};
        const sortOptions = sort ? { price: sort === 'asc' ? 1 : -1 } : {};
        
        const result = await productService.getAllProducts(
            parseInt(page),
            parseInt(limit),
            query,
            sortOptions
        );

        res.json({
            status: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.pid);

        res.json({
            status: 'success',
            product
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: error.message
        });
    }
});

router.post('/', 
    isAuthenticated,
    authorize([ROLES.ADMIN, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const product = await productService.createProduct(
                req.body,
                req.user._id,
                req.user.role
            );

            res.status(201).json({
                status: 'success',
                message: 'Producto creado exitosamente',
                product
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.put('/:pid',
    isAuthenticated,
    authorize([ROLES.ADMIN, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const product = await productRepository.getById(req.params.pid);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Producto no encontrado'
                });
            }

            if (req.user.role === ROLES.PREMIUM) {
                const userId = req.user._id.toString();
                if (product.owner && product.owner.toString() !== userId && product.owner !== 'admin') {
                    return res.status(403).json({
                        status: 'error',
                        message: 'No tienes permisos para actualizar este producto'
                    });
                }
            }

            const updatedProduct = await productService.updateProduct(
                req.params.pid,
                req.body,
                req.user._id,
                req.user.role
            );

            res.json({
                status: 'success',
                message: 'Producto actualizado exitosamente',
                product: updatedProduct
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.delete('/:pid',
    isAuthenticated,
    authorize([ROLES.ADMIN, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const product = await productRepository.getById(req.params.pid);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Producto no encontrado'
                });
            }

            if (req.user.role === ROLES.PREMIUM) {
                const userId = req.user._id.toString();
                if (product.owner && product.owner.toString() !== userId) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'No tienes permisos para eliminar este producto. Solo puedes eliminar tus propios productos.'
                    });
                }
            }

            const result = await productService.deleteProduct(
                req.params.pid,
                req.user._id,
                req.user.role
            );

            res.json({
                status: 'success',
                ...result
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

export default router;