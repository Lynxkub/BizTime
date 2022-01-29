const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require('slugify');


router.get('/' , async (req , res , next) => {
    try{
        const results = await db.query('SELECT * FROM companies');
        return res.json({companies : results.rows})
    }catch (e){
        return next(e);
    }
})

router.get('/:code' , async (req , res , next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`SELECT * FROM companies WHERE code = $1` , [code])
        const invoiceRes = await db.query(`SELECT * FROM invoices WHERE comp_code = $1` , [code])
        const indRes = await db.query('SELECT ind_code FROM compind WHERE comp_code=$1' , [code]);
        ind_code = indRes.rows.map(ind => ind.ind_code)
        
        let indField = []
        for(let i = 0; i<ind_code.length; i++) {
            
            let fieldres = await db.query('SELECT field FROM industries WHERE code=$1', [ind_code[i]])
            let {field} = fieldres.rows[0]
            // console.log(a);
            indField.push(field);
        }
        if(results.rows.lenght === 0) {
            throw new ExpressError(`Can't find company with code of ${code}` , 404);
        }
        return res.json({
            company : results.rows,
            invoices : invoiceRes.rows,
            induestries : indField});
    } catch (e) {
        return next(e);
    }
})

router.post('/' , async (req , res , next) => {
    try {
        let{ name , description } = req.body;
        let code = slugify(name , {lower : true});
        const results = await db.query('INSERT INTO companies (code , name , description) VALUES ($1 , $2 , $3) RETURNING *' , [code , name , description]);
        return res.status(201).json({company: results.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.put('/:code' , async (req , res , next) => {
    try{
        const {name , description} = req.body;
        const {code} = req.params;
        const results = await db.query(`UPDATE companies SET name=$1 , description=$2 WHERE code=$3 RETURNING *` , [name , description , code]);
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find company with code of ${code}` , 404);
        }
        return res.json({company : results.rows[0]})
    }catch (e) {
        return next(e);
    }
})

router.delete('/:code' , async (req , res , next) => {
    try{
        const {code} = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1` , [code]);
        return res.json({msg : 'Company Deleted'});
    }catch (e) {
        return next(e);
    }
})


module.exports = router;