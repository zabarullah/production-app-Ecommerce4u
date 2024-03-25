import express  from "express";
import { isAdmin, requireSignIn } from "../middlewares/auth.middleware.js";
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from "../controllers/category.controller.js";

const router = express.Router();

// Routing
router.post('/create-category',  requireSignIn, isAdmin, createCategoryController); // createCategory works with these two middlewares removed
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController);
router.get('/get-category',  categoryController);
router.get('/single-category/:slug',  singleCategoryController);
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController)



export default router;