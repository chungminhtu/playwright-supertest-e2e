const { test, expect } = require('@playwright/test');
const app = require('../backend/server'); // Import your backend server
const supertest = require('supertest');
const path = require('path');
const fs = require('fs');

let request;

test.beforeAll(async () => {
    request = supertest(app);
});

test('should display users on the frontend', async ({ page }) => {
    const response = await request.get('/users');
    console.log('API response:', response.body);

    await page.route('**/*', async (route) => {
        console.log('Route Intercepted: ', route.request().url());
        if (route.request().url().includes('/users')) {
            const response = await request.get('/users');
            console.log('Intercepted request response:', response.body); // Log for debugging
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(response.body)
            });
        } else {
            route.continue();
        }
    });
  
    // Serve the frontend static files directly
    const indexPath = path.join(__dirname, '../dist/index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    await page.setContent(indexContent, { waitUntil: 'load' });

    
    // await page.route('**/users', async (route) => {
    //     console.log('page.route response:', response.body);
    //     route.fulfill({
    //         contentType: 'application/json',
    //         body: JSON.stringify(response.body)
    //     });
    // });
    

    // Wait for the users to be rendered
    await page.waitForSelector('ul#user-list li', { timeout: 5000 });

    // Verify that the users are displayed correctly
    const userElements = await page.locator('ul#user-list li'); // Replace with your actual selector
    const userNames = await userElements.allInnerTexts();
    console.log('User names in the DOM:', userNames); // Log for debugging
    expect(userNames).toEqual(['Alice', 'Bob', 'Charlie']);

  
});
