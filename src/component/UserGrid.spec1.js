const { test, expect } = require('@playwright/test');
const app = require('../backend/server');
const supertest = require('supertest');

let request;

test.beforeAll(async () => {
    request = supertest(app);
});

test('should perform CRUD operations on UserGrid', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/users', async (route) => {
        const method = route.request().method();
        let response;

        if (method === 'GET') {
            response = await request.get('/api/users');
        } else if (method === 'POST') {
            const postData = JSON.parse(route.request().postData());
            response = await request.post('/api/users').send(postData);
        }

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/api/users/*', async (route) => {
        const method = route.request().method();
        const url = new URL(route.request().url());
        const userId = url.pathname.split('/').pop();
        let response;

        if (method === 'PUT') {
            const putData = JSON.parse(route.request().postData());
            response = await request.put(`/api/users/${userId}`).send(putData);
        } else if (method === 'DELETE') {
            response = await request.delete(`/api/users/${userId}`);
        }

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/api/roles*', async (route) => {
        const url = new URL(route.request().url());
        const type = url.searchParams.get('type');
        const response = await request.get(`/api/roles?type=${type}`);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    // Navigate to the UserGrid page
    await page.goto('http://localhost:3001/frontend/grid');

    // Test Create operation
    await page.fill('input[placeholder="New user name"]', 'David');
    await page.selectOption('select:near(:text("Add User"))', 'editor');
    await page.click('button:text("Add User")');

    // Verify the new user is added
    await expect(page.locator('table tbody tr')).toHaveCount(4);
    await expect(page.locator('table tbody tr:last-child td:first-child')).toHaveText('David');

    // Test Update operation
    await page.click('table tbody tr:last-child button:text("Edit")');
    await page.fill('table tbody tr:last-child input', 'David Updated');
    await page.click('table tbody tr:last-child button:text("Save")');

    // Verify the user is updated
    await expect(page.locator('table tbody tr:last-child td:first-child')).toHaveText('David Updated');

    // Test Delete operation
    await page.click('table tbody tr:last-child button:text("Delete")');

    // Verify the user is deleted
    await expect(page.locator('table tbody tr')).toHaveCount(3);
    await expect(page.locator('table tbody tr:last-child td:first-child')).not.toHaveText('David Updated');
});