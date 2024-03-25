import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    products: [
        {
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    payment: {},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'Not Processed',
        enum: ['Not Processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
