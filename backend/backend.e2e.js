const request = require('supertest');
const app = require('./server');
const { sequelize, User, Role, clearDatabase } = require('./models');

beforeAll(async () => {
    await clearDatabase();
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
});

afterAll(async () => {
    await sequelize.close();
});

it('should fetch all users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].name).toBe('Alice');
    expect(response.body[1].name).toBe('Bob');
    expect(response.body[2].name).toBe('Charlie');
});

it('should fetch roles based on user type', async () => {
    const response = await request(app).get('/roles?type=admin');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].role).toBe('Super Admin');
    expect(response.body[1].role).toBe('Admin');
});
