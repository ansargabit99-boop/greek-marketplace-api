import express from 'express'
import pool from '../DB/db.js'
const view = express.Router()

view.post('/view',async(req,res)=>{
    const {advert_id,user_id} = req.body
    const isViewed = await pool.query("SELECT * FROM views WHERE advert_id=$1 AND user_id = $2",[advert_id,user_id])
    if(isViewed.rows.length > 0) {
    await pool.query(
      'UPDATE views SET updated_at = NOW() WHERE advert_id=$1 AND user_id=$2',
      [advert_id, user_id]
    )
    return res.status(200).json({ message: 'view updated' })
}
    const userViewed = await pool.query('INSERT INTO views (advert_id,user_id) VALUES ($1,$2) RETURNING *',[advert_id,user_id])
    const data = userViewed.rows[0]
    res.json({message:'viewed',info:data})
})
view.get('/view/:id', async (req,res)=>{
    const advert_id = req.params.id
    const viewsCount = await pool.query('SELECT COUNT(*) FROM views WHERE advert_id = $1',[advert_id])
    res.json(viewsCount.rows[0])
})
export default view