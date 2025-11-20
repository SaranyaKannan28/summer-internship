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

// Create new salary
export const addSalary = (req, res) => {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      
      // Validate required fields
      const requiredFields = ['type', 'amount', 'paidTo', 'paidOn', 'paidThrough', 'startDate', 'endDate'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return sendError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate amount
      if (isNaN(data.amount) || parseFloat(data.amount) <= 0) {
        return sendError(res, 400, 'Amount must be a positive number');
      }

      const newSalary = await createSalary(data);
      sendJson(res, 201, newSalary);
    } catch (err) {
      console.error('Error creating salary:', err);
      sendError(res, 500, err.message);
    }
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    sendError(res, 500, 'Request processing error');
  });
};

// Get all salaries with optional filters
export const getSalaries = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    const filters = {
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
      type: url.searchParams.get('type'),
      paidTo: url.searchParams.get('paidTo'),
      paidThrough: url.searchParams.get('paidThrough')
    };

    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    const salaries = await getAllSalaries(filters);
    sendJson(res, 200, salaries);
  } catch (err) {
    console.error('Error fetching salaries:', err);
    sendError(res, 500, err.message);
  }
};

// Get single salary by ID
export const getSalary = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(p => p);
    const id = pathParts[pathParts.length - 1];
    
    if (!id || isNaN(id)) {
      return sendError(res, 400, 'Invalid salary ID');
    }

    const salary = await getSalaryById(id);
    sendJson(res, 200, salary);
  } catch (err) {
    console.error('Error fetching salary:', err);
    
    if (err.message.includes('not found')) {
      sendError(res, 404, err.message);
    } else {
      sendError(res, 500, err.message);
    }
  }
};

// Update salary record
export const updateSalaryRecord = (req, res) => {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathParts = url.pathname.split('/').filter(p => p);
      const id = pathParts[pathParts.length - 1];
      
      if (!id || isNaN(id)) {
        return sendError(res, 400, 'Invalid salary ID');
      }

      const data = JSON.parse(body);
      
      // Validate amount if provided
      if (data.amount !== undefined && (isNaN(data.amount) || parseFloat(data.amount) <= 0)) {
        return sendError(res, 400, 'Amount must be a positive number');
      }

      const updatedSalary = await updateSalary(id, data);
      sendJson(res, 200, updatedSalary);
    } catch (err) {
      console.error('Error updating salary:', err);
      
      if (err.message.includes('not found')) {
        sendError(res, 404, err.message);
      } else {
        sendError(res, 500, err.message);
      }
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
    
    if (!id || isNaN(id)) {
      return sendError(res, 400, 'Invalid salary ID');
    }

    const result = await deleteSalary(id);
    sendJson(res, 200, result);
  } catch (err) {
    console.error('Error deleting salary:', err);
    
    if (err.message.includes('not found')) {
      sendError(res, 404, err.message);
    } else {
      sendError(res, 500, err.message);
    }
  }
};

// Get salary statistics
export const getStats = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const stats = await getSalaryStats(startDate, endDate);
    sendJson(res, 200, stats);
  } catch (err) {
    console.error('Error fetching statistics:', err);
    sendError(res, 500, err.message);
  }
};