const base = require('@playwright/test');
const app = require('../backend/server');
const supertest = require('supertest');
const request = supertest(app);

exports.test = base.test.extend({
    // page: async ({ page }, use) => {
    //     await page.route('**/api/**', async (route) => {
    //         const method = route.request().method();
    //         const url = new URL(route.request().url());
    //         const pathname = url.pathname;
    //         let response;
    //         if (method === 'GET') {
    //             response = await request.get(pathname + url.search);
    //         } else if (method === 'POST') {
    //             const postData = JSON.parse(route.request().postData());
    //             response = await request.post(pathname).send(postData);
    //         } else if (method === 'PUT') {
    //             const putData = JSON.parse(route.request().postData());
    //             response = await request.put(pathname).send(putData);
    //         } else if (method === 'DELETE') {
    //             response = await request.delete(pathname);
    //         }
    //         route.fulfill({
    //             status: response.status,
    //             contentType: 'application/json',
    //             body: JSON.stringify(response.body),
    //         });
    //     });
    //     await use(page);
    // },
});

exports.expect = base.expect;
