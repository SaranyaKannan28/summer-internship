import { 
  addSalary, 
  getSalaries, 
  getSalary, 
  updateSalaryRecord, 
  deleteSalaryRecord,
  getStats 
} from '../controllers/salaryController.js';

export const handleSalaryRoutes = (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(p => p); // ['api', 'salaries', ...]
  
  // GET /api/salaries/stats - Get statistics
  if (req.method === 'GET' && pathParts[2] === 'stats') {
    return getStats(req, res);
  }

  // POST /api/salaries - Create new salary
  if (req.method === 'POST' && pathParts.length === 2) {
    return addSalary(req, res);
  }

  // GET /api/salaries/:id - Get specific salary
  if (req.method === 'GET' && pathParts.length === 3) {
    return getSalary(req, res);
  }

  // GET /api/salaries - Get all salaries (with optional filters)
  if (req.method === 'GET' && pathParts.length === 2) {
    return getSalaries(req, res);
  }
  
  // PUT /api/salaries/:id - Update salary
  if (req.method === 'PUT' && pathParts.length === 3) {
    return updateSalaryRecord(req, res);
  }
  
  // DELETE /api/salaries/:id - Delete salary
  if (req.method === 'DELETE' && pathParts.length === 3) {
    return deleteSalaryRecord(req, res);
  }
  
  // Route not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
};