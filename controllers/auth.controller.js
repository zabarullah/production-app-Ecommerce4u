import userModel from '../models/user.model.js';
import { comparePassword, hashPassword } from './../helpers/auth.helpers.js';
import JWT  from 'jsonwebtoken';

export const signupController = async (req, res) => {
    try {
        // Check if required fields are missing
        const { name, email, password, address, phone, memorableWord } = req.body;
        if (!name || !email || !password || !address || !phone || !memorableWord) {
            return res.status(400).json({ message: 'required fields need to be completed' });
        };
        
        // Check if an exisiting user with the given email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ 
                message: 'email already exists',
                success: false,
            });
        };
        
        // Register user
        const hashedPassword = await hashPassword(password);
        // save hashedPassword
        const user = await new userModel({ name, email, password:hashedPassword, address, phone, memorableWord }).save();
        res.status(201).json({ 
            message: 'user created successfully', 
            success: true,
            user, 
        });
  } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'server error',
            success: false,
        });
    }
};


export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation of user credentials within form(req.body)
        if (!email || !password) {
            return res.status(401).json({
                success: false,
                message: 'invalid email or password'
            })
        };

        // Find user by email in userModel
        const user = await userModel.findOne({ email });
        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'email not registered'
            })
        };
        // compare the passwords
        const matchedPassword = await comparePassword(password, user.password);
        if (!matchedPassword) {
            return res.status(401).json({
                success: false,
                message: 'invalid email or password'
            })
        };

        // Token
        const token = JWT.sign({ _id:user._id }, process.env.JWT_SECRET, {expiresIn: '5d'});
        res.status(200).json({            
            success: true,
            message: 'logged in successfully',
            user: {
                _id: user._id, //added later as it was missing 
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'error in login',
            error
        })
    }
};

//protected route testing controller

export const protectedRouteController = (req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Protected Route accessed',
    })
};

//forgotton Password Controller
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, memorableWord, newpassword } =req.body;

        if(!email || !memorableWord || !newpassword) {
            res.status(400).json({message: 'All fields are required'});
        };
        // Validate the form input with the user from the database
            // Grab the User from the database:
        const user = await userModel.findOne({email,memorableWord});
            // if user not found:
        if(!user) {
            return res.status(404).send({
                success: false,
                message: 'Wrong Email or Memorable Word'
            })
        };
            //user found: hash the newPassword provided in the req.body:
        const hashed = await hashPassword(newpassword);
            //update the user on the database by its id with the hashed password
        await userModel.findByIdAndUpdate(user._id, {password:hashed});
        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error
      })  
    }
};

//update user profile details
export const updateProfileController = async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;
      const user = await userModel.findById(req.user._id);
      //password
      if (password && password.length < 6) {
        return res.status(400).send({ 
               message: "Enter a valid 6 character password" 
        });
      }
      const hashedPassword = password ? await hashPassword(password) : undefined;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated Successfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error Updating profile",
        error,
      });
    }
  };