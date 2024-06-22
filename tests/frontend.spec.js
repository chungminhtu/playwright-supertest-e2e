const { test, expect } = require('@playwright/test');
const app = require('../backend/server'); // Import your backend server
const supertest = require('supertest');

let request;

test.beforeAll(async () => {
    // Initialize Supertest with the Express app
    request = supertest(app); 
});

test('should display users on the frontend', async ({ page }) => {
    // Mock the API response using Playwright route interception
    await page.route('**/users', async (route) => {
        console.log('Route Intercepted: ', route.request().url());
        const response = await request.get('/api/users');
        console.log('Intercepted request response:', response.body);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body)
        });
    }); 
    // Navigate to the static file server
    await page.goto(`http://localhost:3001/frontend`);

    // Wait for the users to be rendered
    await page.waitForSelector('ul#user-list li');

    // Verify that the users are displayed correctly
    const userElements = await page.locator('ul#user-list li');
    const userNames = await userElements.allInnerTexts();
    console.log('User names in the DOM:', userNames);
    expect(userNames).toEqual(['Alice', 'Bob', 'Charlie']);
});

test('should display grid and roles on the frontend', async ({ page }) => {
    await page.route('**/users', async (route) => {
        const response = await request.get('/api/users');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/roles?type=admin', async (route) => {
        const response = await request.get('/api/roles?type=admin');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/roles?type=editor', async (route) => {
        const response = await request.get('/api/roles?type=editor');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/roles?type=viewer', async (route) => {
        const response = await request.get('/api/roles?type=viewer');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.goto('http://localhost:3001/frontend/grid');

    // Verify the <h1> element
    await page.waitForSelector('h1', { state: 'visible' });
    await expect(page.locator('h1')).toHaveText('User Grid');


    // Verify the table rows and content
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(3);

    const expectedUsers = ['Alice', 'Bob', 'Charlie'];
    for (let i = 0; i < expectedUsers.length; i++) {
        const row = rows.nth(i);
        await expect(row.locator('td').nth(0)).toHaveText(expectedUsers[i]);

        const typeSelect = row.locator('td').nth(1).locator('select');
        await expect(typeSelect).toHaveCount(1);

        const roleSelect = row.locator('td').nth(2).locator('select');
        await expect(roleSelect).toHaveCount(1);
    }

    // Additional verification of select options if needed
    const typeOptions = ['Admin', 'Editor', 'Viewer'];
    for (let i = 0; i < typeOptions.length; i++) {
        await expect(rows.nth(0).locator('td').nth(1).locator('select').locator('option').nth(i)).toHaveText(typeOptions[i]);
    }
});
