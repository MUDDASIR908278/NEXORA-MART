import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js'

const router = Router()

router.post('/', requireAuth, createOrder)
router.get('/my-orders', requireAuth, getMyOrders)
router.get('/:id', requireAuth, getOrderById)

export default router