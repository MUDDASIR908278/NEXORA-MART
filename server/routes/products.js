import { Router } from 'express'
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'

const router = Router()

router.get('/', optionalAuth, listProducts)
router.get('/:id', optionalAuth, getProduct)

// Admin-only mutations
router.post('/', requireAuth, requireAdmin, createProduct)
router.put('/:id', requireAuth, requireAdmin, updateProduct)
router.delete('/:id', requireAuth, requireAdmin, deleteProduct)

export default router