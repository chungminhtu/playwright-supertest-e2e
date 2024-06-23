# Full In-Memory End-to-End Testing for Frontend and Backend

This project demonstrates setting up End-to-End (E2E) tests for both the frontend and backend, all running in-memory, making it friendly for CI/CD pipelines.

- **Backend E2E Test**: An Express server with Sequelize using an in-memory SQLite database. Tests run via Jest against a Supertest server without port listening and using an in-memory database.
- **Frontend Testing**: Uses Playwright to serve a React static site via `serve-static` and mocks the API response using Playwright route interception to call the Supertest backend API (in-memory backend).

> Notice: This project use '**pnpm**' and not '**npm**' package manager.

# Why End-to-End?

Below are a few Comparison between End-to-End Testing Vs Component Testing

![](images/e2e_vs_component.png)
(Image source: [https://kailash-pathak.medium.com/lets-get-start-playwright-as-component-testing-4c82ffaadb7c](https://kailash-pathak.medium.com/lets-get-start-playwright-as-component-testing-4c82ffaadb7chttps:/))

## Project Structure

```
├── backend
│   ├── models
│   │   └── index.js
│   ├── server.js
│   └── backend.e2e.js
├── dist
├── node_modules
├── src
│   ├── App.jsx
│   └── main.jsx
├── tests
│   └── frontend.spec.js
├── jest.config.js
├── package.json
├── playwright.config.js
├── vite.config.js
└── README.md
```

## Diagram

Here is a PlantUML diagram to illustrate how this system works:

![alt text](images/Architecture.png "web app architecture")

### Explanation

1. **User** interacts with the **React App**.
2. **React App** fetches user data from the **Express Server**.
3. **Express Server** retrieves user data from the **Sequelize** in-memory SQLite database.
4. **Jest and Supertest** are used for end-to-end testing of the backend.
5. **Playwright** serves the static React app and intercepts API calls to mock responses, enabling frontend testing with an in-memory backend.

## Debugging

### Debug normal via browser (need run backend and frontend separately)

![alt text](images/Frontend_Debug.png "Debug normal via browser ")

## Backend E2E Testing Guide

### Overview

The backend E2E tests are designed to verify the functionality of the Express server and its interaction with the Sequelize in-memory SQLite database. These tests use Jest as the test runner and Supertest to simulate HTTP requests to the server.

### Configuration

- **Sequelize ORM**: Configured to use an in-memory SQLite database.
- **Express Server**: Provides a `/users` endpoint that returns a list of users from the database.
- **Jest**: Configured to run the tests located in the `backend/backend.e2e.js` file.

### Test File: `backend/backend.e2e.js`

**Setup**

1. Clear the database before each test by dropping all tables.
2. Recreate the database schema and insert sample data.

**Tests**

Verify that the `/users` endpoint returns the correct list of users.

**backend/backend.e2e.js**:

```javascript
const request = require('supertest');
const app = require('./server');  
const { sequelize, User, clearDatabase } = require('./models');

beforeAll(async () => {
    await clearDatabase();
    await sequelize.sync();
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
```

Run the frontend e2e test via command `npm run test:backend`

### Result of backend e2e

![alt text](images/Backend_Test.png "Run backend e2e")

## Frontend E2E Testing Guide

### Overview

The frontend E2E tests are designed to verify the functionality of the React application and its interaction with the backend. These tests use Playwright to automate browser interactions and mock API responses to simulate backend interactions.

### Configuration

- **React**: The frontend is built using Vite and React.
- **Playwright**: Configured to run tests located in the `tests/frontend.spec.js` file and intercept API calls to mock responses.

### Test File: `tests/frontend.spec.js`

1. Verify that the React application correctly CRUD the list of users fetched from the backend.

**tests/fixtures.js**
This is a common setup across all the test to help Playwright to mock API responses by intercepting all the requests automatically to Supertest backend.

```javascript
const base = require('@playwright/test');
const app = require('../backend/server');
const supertest = require('supertest');
const request = supertest(app);

exports.test = base.test.extend({
    page: async ({ page }, use) => {
        await page.route('**/api/**', async (route) => {
            const method = route.request().method();
            const url = new URL(route.request().url());
            const pathname = url.pathname;
            let response;
            if (method === 'GET') {
                response = await request.get(pathname + url.search);
            } else if (method === 'POST') {
                const postData = JSON.parse(route.request().postData());
                response = await request.post(pathname).send(postData);
            } else if (method === 'PUT') {
                const putData = JSON.parse(route.request().postData());
                response = await request.put(pathname).send(putData);
            } else if (method === 'DELETE') {
                response = await request.delete(pathname);
            }
            route.fulfill({
                status: response.status,
                contentType: 'application/json',
                body: JSON.stringify(response.body),
            });
        });
        await use(page);
    },
});

exports.expect = base.expect;

```

**tests/frontend.spec.js**:
create test using the fixtures above `const { test, expect } = require('./fixtures');`

```javascript
const { test, expect } = require('./fixtures');

test('should display users on the frontend', async ({ page }) => {

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
 
```

Run the frontend e2e test via command `npm run test:frontend:playwright`

### Result of frontend e2e without ui

![alt text](images/Frontend_Test_cli.png " Run frontend e2e without ui")

Run the frontend e2e test with ui via command `npm run test:frontend:playwright:ui`

### Result of frontend e2e with web UI

![alt text](images/FrontEnd_Test.png " Run frontend e2e with ui")

# Some notes to take

- The test now still require open port and host frontend via http so Playwright can interact with React normaly (React-Routing need js in browser), and cannot serve entirely in RAM memory yet. Playwright support hosting static site but not Single page app like React yet.
- Backend is entirely host and test via in-memory already.

# License

©2024 Chung Minh Tu
This project is licensed under the MIT License.
