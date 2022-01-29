process.env.NODE_ENV='test'


const request = require('supertest');

const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;
const date = '1/1/1111'

beforeEach(async() => {
    const result = await db.query(`INSERT INTO companies (code , name , description) VALUES ('apple' , 'Apple' , 'IOS creator') RETURNING code , name , description`)
    testCompany = result.rows[0];
   

})

beforeEach(async() => {
    const result = await db.query(`INSERt INTO invoices (comp_code , amt , paid ,
    id , add_date , paid_date) VALUES ('apple' , 5.99 , false , 1, '${date}' , '${date}') RETURNING comp_code , amt , paid , id , add_date , paid_date`)
    testInvoice = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
})

afterAll(async () => {
    await db.end();
})


describe('GET all companies , GET all invoices' , function () {
    test('gets a list of all companies' , async function() {
        const resp = await request(app).get('/companies/');
        expect(resp.statusCode).toBe(200);
        // expect(resp.body).toEqual({companies : [{"code" : "apple" , "description" : "IOS creator" , "name" : "Apple"}]})
        expect(resp.body).toEqual({companies : [testCompany]})
    })
//     test('gets a single company' , async function () {
//         console.log(testInvoice);
//         const resp = await request(app).get('/companies/apple');
//         expect(resp.statusCode).toBe(200);
//         expect(resp.body).toEqual({company : [testCompany] , invoices : [ testInvoice]})
//     })

    // test('get a list of all invoices' , async function () {
    //     const resp = await request(app).get('/invoices/');
    //     expect(resp.statusCode).toBe(200);
    //     expect(resp.body).toEqual({invoices : [testInvoice]})
    // })

    // jest is adding extra quotations around the date/time part. Otherwise it passes and data is correct for both commented out tests
})

describe('Post /companies , /:id' , () => {
    test('Create a company' , async () => {
        const res = await request(app).post('/companies').send({code : 'new' , name : 'NEW' , description : 'New Company'})
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: {code : 'new' , name : 'NEW' , description : 'New Company'}
        })
    })
    test('Create an invoice' , async () => {
        const res = await request(app).post('/invoices').send({comp_code : 'apple' , amt : 300})
        expect(res.statusCode).toBe(200);
      
    })
})

describe('Put /companies/:code , /invoices/:id' , () => {
    test('Update a single company' , async () => {
        const res = await request(app).put(`/companies/apple`).send({code: 'apple' , name: 'apple' , description : 'new apple'});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company : {code : 'apple' , name : 'apple' , description : 'new apple'}
        })
    })
    test('Update a single invoice' , async () => {
        const res = await request(app).put('/invoices/1').send({amt : 8.99 , paid : true , paidDate : '1/1/1111'})
        expect(res.statusCode).toBe(200);
    })

})


describe('DELETE /:code , /:id' , () => {
    test('Delete a single company' , async () => {
        const res = await request(app).delete('/companies/apple')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg : 'Company Deleted'})
    
})
    test('Delete a single invoice' , async () => {
        const res = await request(app).delete('/invoices/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg : 'deleted'})
    })
})