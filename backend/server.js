const express = require('express');
const path = require('path');
const { initializeDatabase, User, Role } = require('./models');
const cors = require('cors');

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

app.get('/api/roles', async (req, res) => {
    const { type } = req.query;
    const roles = await Role.findAll({ where: { type } });
    res.json(roles);
});

if (process.env.NODE_ENV !== 'backend_e2e') {
    initializeDatabase().then(() => {
        console.log('Database initialized');
    });
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
