const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with in-memory SQLite using the correct URL format
const sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
});

// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: 'test.db',
//     logging: false,
// });

// Define the User model
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// Define the Role model
const Role = sequelize.define('Role', {
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

async function initializeDatabase() {
    await sequelize.dropAllSchemas();
    await sequelize.sync();
    await User.bulkCreate([
        { name: 'Alice', type: 'admin' },
        { name: 'Bob', type: 'editor' },
        { name: 'Charlie', type: 'viewer' },
    ]);
    await Role.bulkCreate([
        { type: 'admin', role: 'Super Admin' },
        { type: 'admin', role: 'Admin' },
        { type: 'editor', role: 'Content Editor' },
        { type: 'viewer', role: 'Viewer' },
    ]);

    console.log('Database initialized.');
}

async function clearDatabase() {
    await sequelize.drop();
}

module.exports = { sequelize, User, Role, initializeDatabase, clearDatabase };
