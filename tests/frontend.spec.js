const { test, expect } = require('@playwright/test');
const app = require('../backend/server'); // Import your backend server
const supertest = require('supertest');
const path = require('path');
const serveStatic = require('serve-static');
const http = require('http');

let request;
let server;

test.beforeAll(async () => {
    // Initialize Supertest with the Express app
    request = supertest(app); 
    
    // Serve the built React application
    const serve = serveStatic(path.join(__dirname, '../dist'), { index: ['index.html'] });
    server = http.createServer((req, res) => serve(req, res, () => res.end()));
    server.listen(3000, () => {
        console.log('Static file server running on http://localhost:3000');
    });
});

test.afterAll(() => {
    if (server) {
        server.close();
    }
});

test('should display users on the frontend', async ({ page }) => {
    // Mock the API response using Playwright route interception
    await page.route('**/users', async (route) => {
        console.log('Route Intercepted: ', route.request().url());
        const response = await request.get('/users');
        console.log('Intercepted request response:', response.body);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body)
        });
    });

    // Navigate to the static file server
    await page.goto('http://localhost:3000');

    // Wait for the users to be rendered
    await page.waitForSelector('ul#user-list li');

    // Verify that the users are displayed correctly
    const userElements = await page.locator('ul#user-list li');
    const userNames = await userElements.allInnerTexts();
    console.log('User names in the DOM:', userNames);
    expect(userNames).toEqual(['Alice', 'Bob', 'Charlie']);
});
