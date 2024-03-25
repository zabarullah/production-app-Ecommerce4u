import express from "express";
import {forgotPasswordController, loginController, protectedRouteController, signupController, updateProfileController} from '../controllers/auth.controller.js'
import { isAdmin, requireSignIn } from "../middlewares/auth.middleware.js";


const router = express.Router();

// Routing
router.post('/signup',  signupController);
router.post('/login', loginController);
router.post('/forgot-my-password', forgotPasswordController)
router.get('/protected', requireSignIn, isAdmin, protectedRouteController);

//protected route for user authenticated routes
router.get('/user-auth', requireSignIn, protectedRouteController);
//protected route for admin authenticated routes
router.get('/admin-auth', requireSignIn, isAdmin, protectedRouteController);

//update user profile
router.put("/update-profile", requireSignIn, updateProfileController);


export default router;