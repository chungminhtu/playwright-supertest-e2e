const { test, expect } = require('@playwright/test');
const app = require('../backend/server'); // Import your backend server
const supertest = require('supertest');
const path = require('path');
const serveStatic = require('serve-static');
const http = require('http');
const net = require('net');

let request;
let server;

async function isPortInUse(port) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', err => (err.code === 'EADDRINUSE' ? resolve(true) : resolve(false)))
            .once('listening', () => tester.once('close', () => resolve(false)).close())
            .listen(port);
    });
}

test.beforeAll(async () => {
    // Initialize Supertest with the Express app
    request = supertest(app);

    const portInUse = await isPortInUse(3000);

    if (!portInUse) {
        // Serve the built React application
        const serve = serveStatic(path.join(__dirname, '../dist'), { index: ['index.html'] });
        server = http.createServer((req, res) => serve(req, res, () => res.end()));
        server.listen(3000, () => {
            console.log('Static file server running on http://localhost:3000');
        });
    } else {
        console.log('Port 3000 is already in use.');
    }
});

test.afterAll(() => {
    if (server) {
        server.close();
    }
});

test('should display grid and roles on the frontend', async ({ page }) => {
    await page.route('**/users', async (route) => {
        const response = await request.get('/users');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/roles?type=admin', async (route) => {
        const response = await request.get('/roles?type=admin');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/roles?type=editor', async (route) => {
        const response = await request.get('/roles?type=editor');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.route('**/roles?type=viewer', async (route) => {
        const response = await request.get('/roles?type=viewer');
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });

    await page.goto('http://localhost:3000/grid');

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
