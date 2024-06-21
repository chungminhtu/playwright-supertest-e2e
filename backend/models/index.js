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

module.exports = { sequelize, User };
