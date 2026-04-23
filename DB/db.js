import { Pool } from "pg";
import dotenv from 'dotenv'
dotenv.config()
const pool = new Pool (
    {
     connectionString:process.env.DATABASE_URL
    }
)
pool.on('connect',()=>{
    console.log('database connected')
})

pool.on('error', (err) => {
    console.error('Unexpected DB error:', err)
})
export default pool