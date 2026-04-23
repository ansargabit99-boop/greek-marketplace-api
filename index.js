import express from 'express'
import cors from 'cors'
import pool from './DB/db.js'
import router from './auth/auth.js'
import post from './POST/post.js'
const app = express()

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))
app.use(router)
app.use(post)
app.use(express.json())
const PORT = 5000

app.listen(PORT,()=>{
    console.log('starting server')
})