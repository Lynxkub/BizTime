const express = require('express');
const app = require('../app');
const router = express.Router();
const db = require('../db')
const ExpressError = require('../expressError');


router.get('/' , async (req , res , next) => {
    try{
        const results = await db.query('SELECT * FROM industries');
        return res.json({industries : results.rows});
    }catch(e) {
        return next(e);
    }
})

router.post('/' , async (req , res , next) => {
    try{
        const {code , field} = req.body;
        const results = await db.query('INSERT INTO industries (code , field) VALUES ($1 , $2) RETURNING *' , [code , field])
        return res.json({added : results.rows})
    }catch (e) {
        return next(e);
    }
})

router.post('/ind_code' , async(req , res , next) => {
    try{ 
        const{comp_code , ind_code} = req.body;
        const results = await db.query('INSERT INTO compind (comp_code , ind_code) VALUES ($1 , $2) RETURNING *' , [comp_code , ind_code]);
        return res.json({company_industry : results.rows});
    }catch(e) {
        return next(e);
    }
})

router.get('/ind_conn' , async (req , res , next) => {
    try{ 
        const results = await db.query('SELECT * FROM compind');
        return res.json({connections: results.rows})
    }catch(e) {
        return next(e)
    }
})

router.get('/:code' , async (req , res , next) => {
    try{ 
        const {code} = req.params;
        const results = await db.query('SELECT comp_code FROM compind WHERE ind_code=$1' , [code])
        return res.json({code : results.rows})
    }catch (e) {
        return next(e);
    }
})

router.get('/company/:code' , async(req, res , next) => {
    try{
        const {code} = req.params;
        const results = await db.query('SELECT ind_code FROM compind WHERE comp_code=$1' , [code])
        return res.json({company : results.rows})
    }catch(e){
        return next(e);
    }
})

module.exports = router;