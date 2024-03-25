import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        lowercase: true,    
    },
    description:{
        type: String,
        required: true
    },
    category: {
        type: mongoose.ObjectId, 
        ref: 'Category',
        required: true   
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    shipping: {
        type: Boolean
    }
},{timestamps: true});

export default mongoose.model('Product', productSchema);
