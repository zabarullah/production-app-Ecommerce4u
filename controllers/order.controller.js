// ordersController.js
import orderModel from '../models/order.model.js';

//User Orders to be shown after payment has been made
export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({ user: req.user._id })
            .populate('user', 'name');  // Populate the user field with the name
        res.status(200).json({
            success: true,
            message: "Orders Retrieved Successfully",
            orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error while retrieving Orders',
            error,
        });
    }
};

// Admin All Users Orders - to be shown to admin to process orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .populate('user', 'name')
            .populate('products', 'name price quantity');  // Populate the products field with name, price, and quantity

        res.status(200).json({
            success: true,
            message: "All Orders Retrieved Successfully",
            orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error while retrieving all Orders',
            error,
        });
    }
};

//Admin - Order Status updating controller
export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const orders = await orderModel.findByIdAndUpdate(orderId, {status}, {new:true});
        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            orders
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error while updating status of Order',
            error,
        });
    }
}