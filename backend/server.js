const express = require('express');
const cors = require('cors');
const { initializeDatabase, User, Role } = require('./models');

const app = express();
app.use(cors({
    origin: '*',
}));

app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.get('/roles', async (req, res) => {
    const { type } = req.query;
    const roles = await Role.findAll({ where: { type } });
    res.json(roles);
});

if (process.env.NODE_ENV !== 'backend_e2e') {
    initializeDatabase();
}

if (process.env.NODE_ENV !== 'frontend_e2e' && process.env.NODE_ENV !== 'backend_e2e') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
