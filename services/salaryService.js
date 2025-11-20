import { Salary } from '../models/index.js';
import { Op } from 'sequelize';

// Create new salary record
export const createSalary = async (salaryData) => {
  try {
    const salary = await Salary.create(salaryData);
    return salary;
  } catch (error) {
    throw new Error(`Failed to create salary: ${error.message}`);
  }
};

// Get all salaries with optional filters
export const getAllSalaries = async (filters = {}) => {
  try {
    const whereClause = {};

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      whereClause.paidOn = {
        [Op.between]: [filters.startDate, filters.endDate]
      };
    }

    // Filter by type
    if (filters.type) {
      whereClause.type = filters.type;
    }

    // Filter by employee name
    if (filters.paidTo) {
      whereClause.paidTo = {
        [Op.like]: `%${filters.paidTo}%`
      };
    }

    // Filter by payment method
    if (filters.paidThrough) {
      whereClause.paidThrough = filters.paidThrough;
    }

    const salaries = await Salary.findAll({
      where: whereClause,
      order: [['paidOn', 'DESC'], ['id', 'DESC']],
      raw: true
    });

    return salaries;
  } catch (error) {
    throw new Error(`Failed to fetch salaries: ${error.message}`);
  }
};

// Get single salary by ID
export const getSalaryById = async (id) => {
  try {
    const salary = await Salary.findByPk(id);
    
    if (!salary) {
      throw new Error('Salary record not found');
    }
    
    return salary;
  } catch (error) {
    throw new Error(`Failed to fetch salary: ${error.message}`);
  }
};

// Update salary record
export const updateSalary = async (id, salaryData) => {
  try {
    const salary = await Salary.findByPk(id);
    
    if (!salary) {
      throw new Error('Salary record not found');
    }

    await salary.update(salaryData);
    return salary;
  } catch (error) {
    throw new Error(`Failed to update salary: ${error.message}`);
  }
};

// Delete salary record
export const deleteSalary = async (id) => {
  try {
    const salary = await Salary.findByPk(id);
    
    if (!salary) {
      throw new Error('Salary record not found');
    }

    await salary.destroy();
    return { message: 'Salary record deleted successfully', id };
  } catch (error) {
    throw new Error(`Failed to delete salary: ${error.message}`);
  }
};

// Get salary statistics
export const getSalaryStats = async (startDate, endDate) => {
  try {
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.paidOn = {
        [Op.between]: [startDate, endDate]
      };
    }

    const salaries = await Salary.findAll({
      where: whereClause,
      raw: true
    });

    const total = salaries.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const uniqueEmployees = new Set(salaries.map(s => s.paidTo)).size;

    return {
      total,
      count: salaries.length,
      uniqueEmployees,
      average: salaries.length > 0 ? total / salaries.length : 0
    };
  } catch (error) {
    throw new Error(`Failed to fetch statistics: ${error.message}`);
  }
};