import express from 'express'
import pool from '../DB/db.js'
import middleware from '../auth/middleware.js'
const service = express.Router()


service.post('/post/:id/service',middleware,async(req,res)=>{
    const advertId = req.params.id
    const {type} = req.body
    if (!['vip', 'top'].includes(type)) {
    return res.status(400).json({ message: 'Type must be vip or top' })
}
    const days = type === 'vip' ? 7 : 3 ;
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)
    try {
        const result = await pool.query('INSERT INTO advantage_services (advert_id,type,expires_at) VALUES ($1,$2,$3) RETURNING *',[advertId,type,expiresAt])
        res.json(result.rows[0])
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

service.put('/post/:id/service',middleware,async(req,res)=>{
    const advert_id = req.params.id
    const {type} = req.body

    if (!['vip', 'top'].includes(type)) {
        return res.status(400).json({ message: 'Type must be vip or top' })
    }

    const days = type === 'vip' ? 7 : 3
    try {
        const advantageService = await pool.query('SELECT * FROM advantage_services WHERE advert_id = $1',[advert_id])
        if(advantageService.rows.length === 0) {
            return res.status(404).json({message:'not found'})
        }
        const currentExpiry = new Date(advantageService.rows[0].expires_at)
        currentExpiry.setDate(currentExpiry.getDate() + days)
        const result = await pool.query('UPDATE advantage_services SET expires_at = $1 WHERE advert_id = $2 RETURNING *',[currentExpiry,advert_id])
        return res.json(result.rows[0])
    } catch (err) {
        console.log('error detected',err)
        return res.status(500).json({message:'server error'})
    }
})
service.get('/post/:id/service',middleware,async(req,res)=>{
    const advert_id = req.params.id
    try {
        const result = await pool.query('SELECT * FROM advantage_services WHERE advert_id = $1',[advert_id])
        if(result.rows.length === 0) {
            return res.status(404).json({message:'advert has no type'})
        }
        return res.json(result.rows[0])
    } catch (err) {
        console.log('error detected',err)
        return res.status(500).json({message:'server error'})
    }
})
export default service