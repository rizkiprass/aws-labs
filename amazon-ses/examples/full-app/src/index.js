/**
 * Amazon SES Full Application
 * 
 * Express.js server with REST API for email operations
 * 
 * Run: npm run dev
 * Open: http://localhost:3000
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import emailRoutes from './routes/emailRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../public')));

// API Routes
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        region: process.env.AWS_REGION
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   🚀 Amazon SES Full Application                       ║
╠════════════════════════════════════════════════════════╣
║   Server running at: http://localhost:${PORT}            ║
║   Region: ${(process.env.AWS_REGION || 'not set').padEnd(34)}       ║
║   From: ${(process.env.EMAIL_FROM || 'not set').substring(0, 30).padEnd(30)}           ║
╚════════════════════════════════════════════════════════╝
  `);

    // Validate environment
    const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'EMAIL_FROM'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.warn('⚠️  Warning: Missing environment variables:', missing.join(', '));
        console.warn('   Copy .env.example to .env and fill in your credentials.\n');
    }
});

export default app;
