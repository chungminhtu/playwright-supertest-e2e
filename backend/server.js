const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*' // Allow all origins for simplicity
}));

async function initializeDatabase() {
    const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    await db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');
    await db.exec("INSERT INTO users (name) VALUES ('Alice'), ('Bob'), ('Charlie')");

    return db;
}

initializeDatabase().then(db => {
    app.locals.db = db;
});

app.get('/users', async (req, res) => {
    const users = await req.app.locals.db.all('SELECT * FROM users');
    res.json(users);
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

module.exports = app;
