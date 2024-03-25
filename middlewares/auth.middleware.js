import JWT from 'jsonwebtoken';
import userModel from '../models/user.model.js';

// Protected Routes token based
export const requireSignIn = async (req, res, next) => {
    try {
        // Get the token from the request header
        const token = req.headers.authorization;
        //Verify the token
        const decode = JWT.verify(token, process.env.JWT_SECRET);
        //store the decoded token in the request object for later use
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);
    };

};

// Admin Access
export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        //Check if user role is not an admin(1 = admin, 0 = user)
        if (user.role !== 1) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorised Access'
            });
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            error,
            message: 'Error in Admin Middleware'
        });
    }
};