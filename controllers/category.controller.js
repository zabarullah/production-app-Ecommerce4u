import categoryModel from "../models/category.model.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        // if no name is entered for category
        if(!name) {
            return res.status(400).json({
                success: false,
                message: 'Category Name is required'        
            });
        };
        // if the typed category already exists
        const exisitingCategory = await categoryModel.findOne({ name });
        if (exisitingCategory) {
            return res.status(409).json({
                success: false,
                message: `"${name}" Category Already Exists`        
            });            
        }
        // if above conditions are all false then save the new category after it has been slugifed and send status message and category for the frontend:
        const category = await new categoryModel({name, slug:slugify(name)}).save();
        res.status(201).json({
            success: true,
            message: `${name} Category Created Successfully`,
            category
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error,
            message: 'Error In Category'
        })
    }
};


// Updating the name of a Category
export const updateCategoryController = async (req, res) => {
    try {
        const {name} = req.body;
        const {id} = req.params;

        // if no name is entered for category
        if(!name) {
            return res.status(400).json({
                success: false,
                message: 'Category Name is required'        
            });
        };
        
        // if the typed category already exists
        const exisitingCategory = await categoryModel.findOne({ name });
        if (exisitingCategory) {
            return res.status(409).json({
                success: false,
                message: `"${name}" Category Already Exists`         
            });            
        }        

        //update the category using the findByIdAndUpdate method passing it id, the name and the slug but also new:true so that it updates on the database
        const category = await categoryModel.findByIdAndUpdate(id, {name, slug:slugify(name)}, {new:true});
        res.status(200).json({
            success: true,
            message:`Category Updated Successfully to ${name}`,
            category
        })        
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error,
        message: 'Error Updating Category'
      })  
    }
};

//Getting all the categories
export const categoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({});   
        res.status(200).json({
            success: true,
            message: 'All Categories List Loaded',
            category
        })     
    } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          error,
          message: 'Error Getting All Categories'
        })        
    }
};

//Getting Single catagory
export const singleCategoryController = async (req, res) => {
    try {
        const {slug} = req.params;
        const category = await categoryModel.findOne({slug});   
        res.status(200).json({
            success: true,
            message: 'Category Found Successfully',
            category
        })     
    } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          error,
          message: 'Error Getting Category'
        })        
    }
};

//Delete Single category
export const deleteCategoryController = async (req, res) => {
    try {
        const {id} = req.params;
        await categoryModel.findByIdAndDelete(id);   
        res.status(200).json({
            success: true,
            message: 'Category Deleted Successfully',
        })     
    } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          error,
          message: 'Error deleting Category'
        })        
    }
};