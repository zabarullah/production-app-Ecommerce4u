import productModel from "../models/product.model.js";
import fs from "fs";
import slugify from "slugify";
import categoryModel from "../models/category.model.js";
import orderModel from "../models/order.model.js";

import braintree from "braintree"
import dotenv from 'dotenv';



export const createProductController = async (req, res) => {
    try {
        const { name, description, category, quantity, price, shipping } = req.fields;
        const { photo } = req.files; 
        //Validation for missing fields which will be checked against the requiredFields array using the filter method.
        const requiredFields = ["name", "description", "category", "quantity", "price","shipping"];
        const missingFields = requiredFields.filter(field => !req.fields[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `${missingFields.length > 0 ? 'Missing field(s): ' + missingFields.join(", ") : null } Required`
            });
        }   
        //Validation for mising photo and size being no more than 1mb(in kbs)
        if (photo && photo.size > 1000000) { 
            return res.status(400).json({
                message:  "Suitable Photo Is Required"
            });
        }   

        const products = new productModel({...req.fields, slug:slugify(name)});
        if (photo) {
            // grab the binary data using readFileSync method from the photo's path and assign in the the products object. Also grab the photo's type and assign in to the products too. If i used a cloud based storage service (aws/firebase etc) then i wouldnt need to grab the binary data like this.
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        //save the entire products object, which now includes the all the fields including the binary data and the photo.
        await products.save();
        const categoryGet = await categoryModel.findById(category);
        
            res.status(201).json({
            success: true,
            message: `${name} Created in ${categoryGet.name} Successfully`,
            products
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error,
            message: 'Error In Creating Product'
        })
    }
};


//Getting all the Products - Excluding the photo, with pagination
export const getProductController = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
  
      const skip = (page - 1) * limit;
  
      // Filter based on categories
      const categoryFilter = req.query.categories ? { category: { $in: req.query.categories } } : {};
  
      // Filter based on price range
      const priceFilter = {};
      if (req.query.minPrice) {
        priceFilter.price = { $gte: parseInt(req.query.minPrice) };
      }
      if (req.query.maxPrice) {
        priceFilter.price = { ...priceFilter.price, $lte: parseInt(req.query.maxPrice) };
      }

      // Filter based on search bar
      const searchFilter = {};
        if (req.query.searchTerm) {
        const searchRegex = new RegExp(req.query.searchTerm, 'i'); // 'i' for case-insensitive
        searchFilter.$or = [{ name: searchRegex }, { description: searchRegex }];
        }

      const products = await productModel
        .find({ ...categoryFilter, ...priceFilter, ...searchFilter  })
        .populate('category')
        .select("-photo")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
  
      const totalProducts = await productModel.countDocuments({ ...categoryFilter, ...priceFilter, ...searchFilter });
  
      const totalPages = Math.ceil(totalProducts / limit);
  
      res.status(200).json({
        success: true,
        message: 'All Products List',
        total: totalProducts,
        currentPage: page,
        totalPages: totalPages,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error,
        message: 'Error In Getting Products',
      });
    }
  };
  


//Getting a single product by slug 
export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel
        .findOne({slug:req.params.slug})
        .select('-photo')
        .populate('category');   
        res.status(200).json({
            success: true,
            message: 'Single Product Fetched',
            product
        })     
    } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          error,
          message: 'Error In Getting The Product'
        })        
    }
};

//Getting similar products by id
// Controller to get similar products based on category
export const getSimilarProductsController = async (req, res) => {
    try {
      const currentProductId = req.params.id; 
      const currentProduct = await productModel.findById(currentProductId).exec();
  
      if (!currentProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
  
      const similarProducts = await productModel.find({ category: currentProduct.category }).limit(3).exec();
  
      res.status(200).json({
        success: true,
        message: 'Similar Products Fetched',
        products: similarProducts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error,
        message: 'Error in getting similar products',
      });
    }
  };
  


//Get photo for a product with its photoid
export const productPhotoController = async (req, res) => {
    try {
        const { photoid } = req.params;
        const productPhoto = await productModel.findById(photoid).select('photo');

        if (productPhoto && productPhoto.photo && productPhoto.photo.data) {
            res.set('Content-type', productPhoto.photo.contentType);
            return res.status(200).send(productPhoto.photo.data);
        } else {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }
         
    } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          error,
          message: 'Error In Getting Photo'
        })         
    }
};


//delete a product by it's ID
export const deleteProductController = async (req, res) => {
    try {
        const {id} = req.params;
        await productModel.findByIdAndDelete(id).select('-photo');  
        res.status(200).json({
            success: true,
            message: 'Product Deleted Successfully',
        })      
    } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          error,
          message: 'Error Deleting Product'
        })         
    }
}

//Updade a product by its ID
export const updateProductController = async (req, res) => {
    try {
        const { name, description, category, quantity, price, shipping } = req.fields;
        const { photo } = req.files; 
        const {id} = req.params;

        //Validation for missing fields which will be checked against the requiredFields array using the filter method.
        const requiredFields = ["name", "description", "category", "quantity", "price", "shipping"];
        const missingFields = requiredFields.filter(field => !req.fields[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `${missingFields.length > 0 ? 'Missing field(s): ' + missingFields.join(", ") : null } Required`
            });
        }   
        //Validation for mising photo and size being no more than 1mb(in kbs)
        if (photo && photo.size > 1000000) { 
            return res.status(400).json({
                error:  "Suitable Photo Is Required"
            });
        }   

        const products = await productModel.findByIdAndUpdate(
            id,
            {...req.fields, slug:slugify(name)},
            {new:true}
        )
        if (photo) {
            // grab the binary data using readFileSync method from the photo's path and assign in the the products object. Also grab the photo's type and assign in to the products too. If i used a cloud based storage service (aws/firebase etc) then i wouldnt need to grab the binary data like this.
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        //save the entire products object, which now includes the all the fields including the binary data and the photo.
        await products.save();
        res.status(201).json({
            success:true,
            message: "Product Updated Successfully",
            products
        })       
    } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          error,
          message: 'Error Updating Product'
        })          
    }
}

//Braintree Payment Controllers

//Payment Gateway
dotenv.config();
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//Token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function(err,response){
      if(err) {
        res.status(500).send(err);
      } else {
        //clientToken send as a response
        res.send(response)
      }
    })
  } catch (error) {
    console.log(error);
  }
}

//Payment
export const braintreePaymentsController = async (req, res) => {
  try {
    const {cartItems, nonce, cartTotal, user} = req.body;

    let newTransaction = gateway.transaction.sale({
      amount: cartTotal,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      }
    },
    async function (error, result) {
      if(result) {
        const order = await orderModel({
          products: cartItems,
          payment: result,
          user: user._id,
        }).save();

        res.json({ ok: true })
      } else {
        res.status(500).send(error);
      }
    }
    )
  } catch (error) {
    console.log(error);
  }
}
