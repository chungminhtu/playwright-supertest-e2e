const { Sequelize, DataTypes } = require('sequelize');

// const sequelize = new Sequelize( {
//     dialect: 'sqlite',
//     storage:'test.db',
//     logging: false,
// });

const sequelize = new Sequelize('sqlite::memory:', {
    logging: false, 
});

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

async function initializeDatabase() {
    await sequelize.sync();

    await User.bulkCreate([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
    ]);
}

module.exports = { sequelize, User, initializeDatabase };
