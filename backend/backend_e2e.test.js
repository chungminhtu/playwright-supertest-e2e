
const request = require('supertest');
const app = require('./server');  
const { sequelize, User } = require('./models');

beforeAll(async () => {
    await sequelize.sync({ force: true });  
    await User.bulkCreate([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
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
