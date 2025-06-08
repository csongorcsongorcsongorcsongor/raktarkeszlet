// dbHandler.js

const { Sequelize, DataTypes } = require('sequelize')

const handler = new Sequelize('data','root','',{dialect: 'mysql', host: 'localhost'})

exports.table = handler.define('loginInfo',{
    'id':{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    'username':{
        type: DataTypes.STRING,
        allowNull: false
    },
    'password':{
        type: DataTypes.STRING,
        allowNull: false
    }
})

exports.tableWarehouses = handler.define('warehouses', {
    'id':{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    'name': {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'location' : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'capacity' : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'manager_name' : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'notes': {
        type: DataTypes.STRING,
    }
})

exports.tableProducts = handler.define('productInfo',{
    'id':{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    'name':{
        type: DataTypes.STRING,
        allowNull: false
    },
    'type':{
        type: DataTypes.STRING,
        allowNull: false
    },
    'price':{
        type: DataTypes.STRING,
        allowNull: false
    },
    'warehouseId': {
        type: DataTypes.INTEGER
    },
    'amount': {
        type: DataTypes.INTEGER,
    }
})

exports.tableMovements = handler.define('movements', {
    'id': {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    'productId': {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    'warehouseId': {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    'type': {
        type: DataTypes.ENUM('in', 'out'), 
        allowNull: false,
    },
    'quantity': {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

exports.tableMovements.belongsTo(exports.tableProducts, { foreignKey: 'productId' });
exports.tableMovements.belongsTo(exports.tableWarehouses, { foreignKey: 'warehouseId' });
exports.sequelize = handler;
