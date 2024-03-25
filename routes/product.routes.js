import express  from "express";
import { isAdmin, requireSignIn } from "../middlewares/auth.middleware.js";
import { braintreePaymentsController, braintreeTokenController, createProductController, deleteProductController, getProductController, getSimilarProductsController, getSingleProductController, productPhotoController, updateProductController } from "../controllers/product.controller.js";
import formidable from "express-formidable";

const router = express.Router();

// Routing
router.post('/create-product', requireSignIn, isAdmin, formidable(), createProductController);  

//Get Products controller
router.get('/get-products',  getProductController);

//Get a single product by its slug
router.get('/get-product/:slug',  getSingleProductController);

//Get photo for a product with its photoid
router.get('/product-photo/:photoid', productPhotoController)

//Delete a product by its id
router.delete('/delete-product/:id', requireSignIn, isAdmin, deleteProductController)

//Update Product by its id
router.put('/update-product/:id', requireSignIn, isAdmin, formidable(), updateProductController);

//Get Similar products
router.get('/get-similar-products/:id', getSimilarProductsController);

//Braintree Payments Token
router.get('/braintree/token', braintreeTokenController)

//Braintree Payments
router.post('/braintree/payment', braintreePaymentsController)

export default router;