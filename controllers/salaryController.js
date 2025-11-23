import { 
  createSalary, 
  getAllSalaries, 
  getSalaryById, 
  updateSalary, 
  deleteSalary,
  getSalaryStats 
} from '../services/salaryService.js';
import { sendJson, sendError } from '../utils/http.js';
import { URL } from 'url';
import jwt from "jsonwebtoken";


// Create new salary
export const addSalary = (req, res) => {
  let body = '';

  req.on('data', chunk => body += chunk.toString());
  req.on('end', async () => {
    try {
      // 1. Get userId from token
      const auth = req.headers.authorization;
      if (!auth) return sendError(res, 401, "No token provided");

      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "MY_SUPER_SECRET");

      const data = JSON.parse(body);

      // 2. Add userId automatically
      data.userId = decoded.id;

      const requiredFields = ['type', 'amount', 'paidTo', 'paidOn', 'paidThrough', 'startDate', 'endDate'];
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0)
        return sendError(res, 400, `Missing fields: ${missingFields.join(", ")}`);

      if (isNaN(data.amount) || parseFloat(data.amount) <= 0)
        return sendError(res, 400, "Amount must be positive");

      const newSalary = await createSalary(data);
      sendJson(res, 201, newSalary);

    } catch (err) {
      console.error("Error creating salary:", err);
      sendError(res, 500, err.message);
    }
  });
};


// Get all salaries with optional filters
export const getSalaries = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return sendError(res, 401, "No token");

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "MY_SUPER_SECRET");

    const url = new URL(req.url, `http://${req.headers.host}`);

    const filters = {
      userId: decoded.id,            // Automatically filter per user
      paidTo: url.searchParams.get("paidTo") || null,
      startDate: url.searchParams.get("startDate") || null,
      endDate: url.searchParams.get("endDate") || null,
    };

    const filtered = {};
    Object.keys(filters).forEach(k => (filters[k] ? filtered[k] = filters[k] : null));

    const salaries = await getAllSalaries(filtered);
    sendJson(res, 200, salaries);

  } catch (err) {
    console.error("Error fetching salaries:", err);
    sendError(res, 500, err.message);
  }
};


// Get single salary by ID
export const getSalary = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(p => p);
    const id = pathParts[pathParts.length - 1];
    
    if (!id || isNaN(id)) return sendError(res, 400, 'Invalid salary ID');

    const salary = await getSalaryById(id);
    sendJson(res, 200, salary);
  } catch (err) {
    console.error('Error fetching salary:', err);
    if (err.message.includes('not found')) sendError(res, 404, err.message);
    else sendError(res, 500, err.message);
  }
};

// Update salary record
export const updateSalaryRecord = (req, res) => {
  let body = '';
  
  req.on('data', chunk => body += chunk.toString());
  req.on('end', async () => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathParts = url.pathname.split('/').filter(p => p);
      const id = pathParts[pathParts.length - 1];
      if (!id || isNaN(id)) return sendError(res, 400, 'Invalid salary ID');

      const data = JSON.parse(body);
      if (data.amount !== undefined && (isNaN(data.amount) || parseFloat(data.amount) <= 0)) {
        return sendError(res, 400, 'Amount must be a positive number');
      }

      const updatedSalary = await updateSalary(id, data);
      sendJson(res, 200, updatedSalary);
    } catch (err) {
      console.error('Error updating salary:', err);
      if (err.message.includes('not found')) sendError(res, 404, err.message);
      else sendError(res, 500, err.message);
    }
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    sendError(res, 500, 'Request processing error');
  });
};

// Delete salary record
export const deleteSalaryRecord = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(p => p);
    const id = pathParts[pathParts.length - 1];
    if (!id || isNaN(id)) return sendError(res, 400, 'Invalid salary ID');

    const result = await deleteSalary(id);
    sendJson(res, 200, result);
  } catch (err) {
    console.error('Error deleting salary:', err);
    if (err.message.includes('not found')) sendError(res, 404, err.message);
    else sendError(res, 500, err.message);
  }
};

// Get salary statistics
export const getStats = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const startDate = url.searchParams.get('startDate') || null;
    const endDate = url.searchParams.get('endDate') || null;

    const stats = await getSalaryStats(startDate, endDate);
    sendJson(res, 200, stats);
  } catch (err) {
    console.error('Error fetching statistics:', err);
    sendError(res, 500, err.message);
  }
};
