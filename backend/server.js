const express = require('express');
const cors = require('cors');
const { initializeDatabase, User } = require('./models');

const app = express();

app.use(cors({
    origin: '*' // Allow all origins for simplicity
}));
if (process.env.NODE_ENV !== 'backend_e2e') {
    initializeDatabase();
}
app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
