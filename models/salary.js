import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Salary = sequelize.define('Salary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Monthly', 'Weekly', 'Bonus', 'Commission']]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paidTo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paidOn: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paidThrough: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Bank Transfer', 'Cash', 'Cheque', 'UPI']]
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'salaries',
  timestamps: true,
  validate: {
    endDateAfterStartDate() {
      if (this.endDate < this.startDate) {
        throw new Error('End date must be after start date');
      }
    }
  }
});

export default Salary;