const express = require('express');
const path = require('path');
const { initializeDatabase, User, Role, clearDatabase } = require('./models');
const cors = require('cors');
const net = require('net');
const PORT = require('../config');

const app = express();
app.use(cors({
    origin: '*',
}));
app.use(express.json());

app.use('/frontend', express.static(path.join(__dirname, '../dist')));

app.get('/frontend/*', (req, res) => {
    console.log('=> Frontend hit');
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});


app.post('/api/users', async (req, res) => {
    console.log(req.body);
    const newUser = await User.create(req.body);
    res.json(newUser);
});

app.put('/api/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
        await user.update(req.body);
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
        await user.destroy();
        res.json({ message: 'User deleted' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.get('/api/roles', async (req, res) => {
    const { type } = req.query;
    const roles = await Role.findAll({ where: { type } });
    res.json(roles);
});

console.log('mmmmmmmmmmmmmmmmmmmmmm', PORT);


const server = net.createServer().listen(PORT);

server.on('listening', function () {
    server.close();
    if (process.env.NODE_ENV !== 'backend_e2e') {
        initializeDatabase() ;
        app.listen(PORT, () => {
            console.log(`Backend server is running on http://localhost:${PORT}`);
        });
    }
});

server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        initializeDatabase();
        console.log(`Port ${PORT} is already in use`);
    } else {
        throw err;
    }
});

module.exports = app;