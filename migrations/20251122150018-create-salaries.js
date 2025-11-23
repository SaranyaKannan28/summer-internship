export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("salaries", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      paidTo: {
        type: Sequelize.STRING,
        allowNull: false
      },

      paidOn: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      paidThrough: {
        type: Sequelize.STRING,
        allowNull: false
      },

      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      remarks: {
        type: Sequelize.TEXT
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("salaries");
  }
};
