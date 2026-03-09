import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Mount all routes
app.use(routes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Project W - Server is running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/check`);
});
