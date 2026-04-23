import pool from "../DB/db.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import express, { json } from 'express'
import { isModerator, middleware, optionalAuth } from "./middleware.js";
dotenv.config()
const router = express.Router()

function generateToken(user) {
    return jwt.sign({
        id:user.id,
        role:user.role
    },process.env.JWT_SECRET,{expiresIn:'30d'})
}
router.post('/register',async(req,res)=>{
    const {name,numberOremail,password} = req.body
    if(!name || !numberOremail || !password) {
        return res.json({message:'you forgot to fill in something'})
    }
    const isEmail = numberOremail.includes('@')
    const existing = await pool.query('SELECT name,phone,email FROM users WHERE email = $1 OR phone=$1',[numberOremail])
    if(existing.rows.length > 0){
        return res.json({message:'user already exists'})
    }
     try {
        const hashed = await bcrypt.hash(password,10)

        let user;
        if(isEmail) {
            user = await pool.query('INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id, name,email,role',[name,numberOremail,hashed])
        }else {
            user  = await pool.query('INSERT INTO users (name,phone,password) VALUES ($1,$2,$3) RETURNING id, name,email,role',[name,numberOremail,hashed])
        }
        const token = generateToken(user.rows[0])
        res.json({user:user.rows[0],token})
     }
     catch (err) {
        console.log(err)
        res.json({message:'error detected',err})
     }
})
router.post('/login',async (req,res)=>{
    const {phoneOremail,password} = req.body
    if(!phoneOremail || !password || password.length < 6 ){
        return res.json({message:'please fill in correctly '})
    }
    const isEmail = phoneOremail.includes('@')
    try {
        let user;
        if(isEmail) {
            user = await pool.query('SELECT * FROM users WHERE email=$1',[phoneOremail])
        } else {
            user = await pool.query('SELECT * FROM users WHERE phone=$1',[phoneOremail])
        }
        const data = user.rows[0]
        const isValid = await bcrypt.compare(password,data.password)
        if(!isValid) {
            return res.status(401).json({message:'incorrect password'})
        }
        const token = generateToken(data)
        res.json({user:data,token})
    } catch(err) {
        console.log(err)
        return res.json('error detected',err)
    }
})

router.get('/me',middleware,async(req,res)=>{
    const user = await pool.query('SELECT name,phone,email FROM users WHERE id =$1',[req.user.id])
    if(user.rows.length ===0) {
        return res.status(404).json({message:'user not found'})
    }
    const data = user.rows[0]
    res.json({
        name:data.name,
        phone:data.phone,
        email:data.email
    })
})

router.put('/me',middleware,async(req,res)=>{
    const id = req.user.id
    const { name, phone, email, password } = req.body
    let fields= []
    let values= []
    let i = 1 
   if(name) {
    fields.push(`name = $${i++}`)
    values.push(name)
   }
  if(phone) {
    fields.push(`phone = $${i++}`)
    fields.push(phone)
  }
    if(password) {
    fields.push(`password = $${i++}`)
    const hashed = await bcrypt.hash(password,10)
    values.push(hashed)
   }
   if(email) {
    fields.push(`email = $${i++}`)
    values.push(email)
   }
   if(fields.length === 0){
    return res.status(401).json({message:'nothing to change'})
   }
   values.push(id)

   try {
    const result = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, phone, email`,
        values
    )
    return res.json(result.rows[0])
   } catch(err){
    console.log(err)
    return res.status(500).json({message:'server is crashed'})
   }
})
router.get('/me/adverts',middleware,async(req,res)=>{
    const id = req.user.id
    const {status} = req.query

    try {
        let result;
        if(status) {
            result = await pool.query('SELECT * FROM adverts WHERE user_id = $1 AND status = $2',[id,status])
        } else {
            result = await pool.query('SELECT * FROM adverts WHERE user_id = $1',[id])
        }
        res.json(result.rows)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({message:'server is crashing'})
    }
})

router.get('/adminPanel/posts',middleware,isModerator,async(req,res)=>{
    const adverts = await pool.query('SELECT * FROM adverts')
    res.json(adverts)
})

export default router;