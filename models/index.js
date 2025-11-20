import sequelize from '../config/db.js';
import Salary from './salary.js';
import User from './user.js';

const initModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized with database');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
  }
};

export { initModels, Salary, User, sequelize };
