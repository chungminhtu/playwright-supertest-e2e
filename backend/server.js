const express = require('express');
const path = require('path');
const { initializeDatabase, User, Role } = require('./models');
const cors = require('cors');
const net = require('net');

const app = express();
app.use(cors({
    origin: '*',
}));

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

let PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === 'frontend_e2e' || process.env.NODE_ENV === 'backend_e2e') {
    PORT = 3001
}


const server = net.createServer().listen(PORT);

server.on('listening', function () {
    server.close();
    if (process.env.NODE_ENV !== 'backend_e2e') {
        initializeDatabase().then(() => {
            console.log('Database initialized');
        });
        app.listen(PORT, () => {
            console.log(`Backend server is running on http://localhost:${PORT}`);
        });
    }
});

server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use`);
    } else {
        throw err;
    }
});

module.exports = app;