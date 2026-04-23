import express, { json } from 'express'
const post = express.Router()
import pool from '../DB/db.js'
import { optionalAuth } from '../auth/middleware.js'
import { upload } from './uploadImages.js'
import { middleware } from '../auth/middleware.js'
post.post('/post',middleware,upload.single('photo'),async(req,res)=>{
    const  {product,description,price,category} = req.body
    const userId = req.user.id
    const photo = req.file ? req.file.filename : null
    if(!product || !description || !photo || !category || !price) {
        return res.status(400).json({message:'you forgot to fill in something'})
    }
    try {
        const post = await pool.query('INSERT INTO adverts (title,text,price,category_id,user_id,photos) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',[product,description,
            price, category, userId,photo
        ])
        const author = await pool.query('SELECT name FROM users WHERE id=$1',[userId])
        res.json({info:post.rows[0],user:author.rows[0]})
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({message:'server error '})
    }
})
post.get('/post',async (req,res)=>{
    try {
        const {search,category,minPrice,maxPrice,sort = 'new',page=1} = req.query
        const limit = 10
        const offset = (page - 1) * limit
        
        const topResult = await pool.query(`
            SELECT adverts*., categories.name AS category_name,
            users.name AS author_name,
            advantage_services.type AS serviec_type,
            advantages_service.activated_at 
            FROM adverts
            JOIN categories ON adverts.category_id = categories.id
            JOIN users ON  adverts.user_id = users.id
            JOIN advantage_services ON advantage_services.advert_id = adverts.id
            WHERE advantage_service.type = 'top'
            AND advantage_services.expires_at > NOW()
            AND adverts.status = 'published'
            ORDER BY advantage_services.activated_at DESC
            `);
        const topValues = [];
        let ti = 1;

        if(search){
           topResult+=`AND (adverts.title ILIKE $${ti} OR adverts.text ILIKE $${ti} OR categories.name ILIKE $${ti} OR users.name ILIKE $${ti})`
           topValues.push(`%${search}%`)
           ti++
        }
        if(category) {topResult+= ` AND adverts.category_id = $${ti++};`;topResult.push(category)}
        if(minPrice) {topResult+= ` AND adverts.price >= $${ti++};`;topResult.push(minPrice)}
        if(maxPrice) {topResult+= ` AND adverts.price <= $${ti++};`;topResult.push(minPrice)}

        topResult += ' ORDER BY advantage_services.activated_at DESC'
        const topQuery = await pool.query(topResult,topValues)
        const topAdverts = topResult.rows

        let vipQuery = ` 
        SELECT adverts.*, categories.name AS category_name, users.name AS author_name,
        advantage_services.type AS service_type
        FROM adverts 
        JOIN categories ON adverts.category_id = categories.id
        JOIN users ON adverts.user_id = users.id
        JOIN advantage_services ON advantage_services.advert_id = adverts.id
        WHERE advantage_services.type = 'vip'
        AND advatage_services.expires_at > NOW()
        AND adverts.status = 'published'
        `
        const vipValues = []
        let vi = 1 

        if(category){ vipQuery += ` AND adverts.category_id = $${vi++}`;vipValues.push(category)}
        if(minPrice) {topResult+= ` AND adverts.price >= $${vi++};`;vipValues.push(Number(minPrice)) - 100}
        if(maxPrice) {topResult+= ` AND adverts.price <= $${vi++};`;vipValues.push(Number(minPrice)) + 100}

        const vipResult = await pool.query(vipQuery,vipValues)
        const vipAdverts = vipResult.rows.sort(()=>Math.random()-0.5).slice(0, 3)

        const excludeIds = [
            ...topAdverts.map(a=>a.id),
            ...vipAdverts.map(a=>a.id)
        ]
        let query = `
        SELECT adverts.*, categories.name AS category_name, users.name AS author_name 
        FROM adverts 
        JOIN categories ON adverts.category_id = categories.id,
        JOIN users ON adverts.user_id = user.id
        WHERE adverts.status = 'published'
        `
        const values = []
        let i = 1 

        if(excludeIds.length > 0){
            query+= `AND adverts.id !== ALL($${i++})`
        }
        if(search) {
            query+= ` AND (adverts.title  ILIKE $${i} OR  adverts.text ILIKE $${i} OR categories.name ILIKE $${i} OR users.name ILIKE $${i})`
            values.push(`%${search}%`)
            i++
        }
        query+= ' ORDER BY'
        if(sort === 'price_asc') query+='adverts.price ASC'
        else if (sort === 'price_desc') query+= 'adverts.price DESC'
        else query+= 'adverts.created_at DESC'

        query+= `LIMIT $${i++} OFFSET $${i++}`
        values.push(limit,offset)
        const regularResult = await pool.query(query,values) 
        const finalResult = [
            ...topAdverts,
            ...vipAdverts,
            ...regularResult.rows
        ]
        res.json({
            page:Number(page),
            limit,
            result:finalResult
        })
        
    } catch (err) {
        console.log('error detected')
        return res.status(500).send('server crashed')
    }
})
post.get('/post/:id',optionalAuth,(req,res)=>{
    const advertId = req.params.id 
    const userId = req.user.id
    const result = await pool.query('SELECT adverts.* categories.name AS category_name,users.name AS author_name FROM adverts JOIN categories ON adverts.category_id = category_id JOIN users ON adverts.user_id = users.id WHERE adverts.id = $1',[id])
    if(result.rows.length === 0){
        return res.status(404).json({message:'Advert not found'})
    }
     const viewsResult = await pool.query(
            'SELECT COUNT(*) FROM views WHERE advert_id = $1',
            [id]
        )
        const viewsCount = parseInt(viewsResult.rows[0].count)
    if (req.user) {
        const existing = await pool.query(
                'SELECT * FROM views WHERE advert_id=$1 AND user_id=$2',
                [id, userId])
        if(existing.rows.length >0) {
        await pool.query(
            'UPDATE views SET updated_at = NOW() WHERE advert_id = $1 AND user_id=$1)',[advertId,userId]
        )} else {
            await pool.query('INSERT INTO views (advert_id,user_id) VALUES ($1,$2)')
        }
    }
    res.json({...result.rows[0],views:viewsCount})
})
post.put('/posts/:id/status',middleware,async(req,res)=>{
    const id = req.params.id;
    const {status} = req.body 
    const userRole = req.user.role
    const userId = req.user.id

    const userTransactions = {
        draft:['moderation','archived'],
        published:['draft','archived'],
        declined:['draft','archived']
    }
    const moderatorTransactions = {
        moderation: ['published','declined'],
        published:['declined']
    }
    try {
        const result = await pool.query('SELECT * FROM  adverts WHERE  id - $1',[id])
        if(result.rows.length === 0) {
            return res.status(404).json('Couldnt find advert')
        }
        const advert = result.rows[0]
        const currentStatus = advert.status
        
        if(userRole === 'moderation'){
            const allowed = moderatorTransactions[currentStatus] || []
            if(!allowed.includes(status)){
                return res.status(403).json({message:`Moderator cannot transition ${currentStatus} -> to ${status}`})
            }
        } else {
            if(advert.user_id !== userId) {
                return res.json({message:'not your advert'})
            }
            const allowed = userTransactions[currentStatus] || []
            if(!allowed.includes(status)) {
                return res.status(403).json({message:`Cannot transition ${currentStatus} to -> ${status}`})
            }
        }
        const updated = await pool.query('UPDATE advert SET status = $1 WHERE id = $2',[status,id])
        res.json(updated.rows[0])
    } catch (err) {
        console.log('error detected',err)
        return res.status(500).json({message:'server crashing'})
    }
})
post.put('/post/:id', middleware, async (req, res) => {
    const advertId = req.params.id
    const userId = req.user.id
    const userRole = req.user.role
    const { title, text, price, photo, category_id } = req.body

    try {
        const result = await pool.query('SELECT * FROM adverts WHERE id = $1', [advertId])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Advert not found' })
        }

        const advert = result.rows[0]

        // user checks
        if (userRole === 'user') {
            if (advert.user_id !== userId) {
                return res.status(403).json({ message: 'Not your advert' })
            }
            if (advert.status !== 'draft') {
                return res.status(403).json({ message: 'Can only edit draft adverts' })
            }
        }

        // build query dynamically
        const changes = []
        const values = []
        let i = 1

        if (title) { changes.push(`title = $${i++}`); values.push(title) }
        if (text) { changes.push(`text = $${i++}`); values.push(text) }
        if (price) { changes.push(`price = $${i++}`); values.push(price) }
        if (photo) { changes.push(`photos = $${i++}`); values.push(photo) }
        if (category_id) { changes.push(`category_id = $${i++}`); values.push(category_id) }

        if (values.length === 0) {
            return res.status(400).json({ message: 'Nothing to update' })
        }

        values.push(advertId)
        const updated = await pool.query(
            `UPDATE adverts SET ${changes.join(', ')} WHERE id = $${i} RETURNING *`,
            values
        )
        res.json(updated.rows[0])

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Server error' })
    }
})
post.delete('/post/:id',middleware,async(req,res)=>{
    const advertId = req.params.id
    const userId = req.user.id
    const userRole = req.user.role
    try {
        const advert = await  pool.query('SELECT * FROM adverts WHERE id = $1',[advertId])
        const advertData = advert.rows[0]
    if (!advertData) {
    return res.status(404).json({ message: 'Advert not found' })
}
        if(userRole === 'user'){
            if(userId !== advertData.user_id){
                return res.status(403).json({message:'its not you advert'})
            }
            if (!['draft', 'archived'].includes(advertData.status)) {
        return res.status(403).json({ message: 'Can only delete draft or archived adverts' })
    }
        }
        const result = await pool.query('DELETE FROM adverts where id = $1 RETURNING *',[advertId])
        res.json(result.rows[0])

    }
    catch (err){
        console.log('errror detected',err)
        return res.status(500).json({message:'server error'})
    }
})

post.get('/categories',async(req,res)=>{
    try {
        const categories = await pool.query('SELECT * FROM categories')
        res.json(categories.rows)
    }
    catch (err) {
        console.log('error detected',err)
        return res.status(500).json({message:'server error'})
    }
})
export default post;