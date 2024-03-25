import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/auth.middleware.js";
import { getAllOrdersController, getOrdersController, updateOrderStatusController } from './../controllers/order.controller.js';


const router = express.Router();

// Routing
//User Orders
router.get('/get-orders', requireSignIn, getOrdersController)

//Admin All Orders data
router.get('/get-all-orders', requireSignIn, isAdmin, getAllOrdersController)

//Update Status of an Order for Admin only
router.put('/order-status/:orderId', requireSignIn, isAdmin, updateOrderStatusController)


export default router;