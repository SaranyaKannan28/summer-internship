import { handleSalaryRoutes } from './routes/salaryRoutes.js';
import { handleAuthRoutes } from './routes/authRoutes.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Serve static files
const serveStaticFile = (req, res, filePath) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain'
      });
      res.end(err.code === 'ENOENT' ? '404 - File Not Found' : '500 - Internal Server Error');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
};

// Main request handler
export const requestHandler = (req, res) => {
  const url = req.url;

  // ---------- AUTH ROUTES ----------
  if (url.startsWith('/api/auth')) {
    return handleAuthRoutes(req, res);
  }

  // ---------- SALARY ROUTES ----------
  if (url.startsWith('/api/salaries')) {
    return handleSalaryRoutes(req, res);
  }

  // ---------- STATIC FILES ----------
  let filePath = path.join(__dirname, 'public');

  // Default file
  if (url === '/' || url === '/index') {
    filePath = path.join(filePath, 'index.html');
  } else {
    filePath = path.join(filePath, url);
  }

  // Check file exists
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Page Not Found</h1>');
      return;
    }

    serveStaticFile(req, res, filePath);
  });
};
