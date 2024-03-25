import connectMongoDB from './config/mongodb.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.route.js';
import categoryRoutes from './routes/category.route.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.route.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

//Connect to MongoDB
connectMongoDB();
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, './client/build')))


// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/order', orderRoutes);

app.use('*', function(req,res){
  res.sendFile(path.join(__dirname,'./client/build/index.html'))
})

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
