const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_ice_cream_shop')
const app = express()

app.use(express.json());
app.use(require('morgan')('dev'));

app.get('/api/flavors', async (req,res,next)=>{
    try{
        const SQL = `
        SELECT * from iceCream ORDER BY created_at DESC;       
        `
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch(err){
        next(err);
    }

});
app.get('/api/flavors/:id', async (req,res,next)=>{

    try{
        const SQL = `
        SELECT name from iceCream
        WHERE id = $1;
        `
        const response = await client.query(SQL,[req.params.id])
        res.send(response.rows[0]);
    }

    catch(err){
        next(err);
    }
});
app.post('/api/flavors', async(req,res,next)=>{
    try{
        const SQL = `
        INSERT INTO iceCream(name,is_favorite)
        VALUES($1,$2)
        RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);
        res.send(response.rows[0]);
    }

    catch(err){
        next(err);
    }

});
app.delete('/api/flavors/:id', async(req,res,next)=>{
    try{
        const SQL = `
            DELETE from iceCream
            WHERE id = $1
        
        `;

        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);

    }

    catch(err){
        next(err);
    }

});
app.put('/api/flavors/:id', async(req,res,next)=>{
    try{
        const SQL = `
        UPDATE iceCream
        SET name = $1, is_favorite = $2, updated_at = now()
        WHERE id = $3 RETURNING *
        
        `;

        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id])
        res.send(response.rows[0]);
    }

    catch(err){
        next(err);

    }
});


const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
    DROP TABLE IF EXISTS iceCream;
CREATE TABLE iceCream(
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
is_favorite BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now()
);
    
    `;
    await client.query(SQL);
    console.log('tables created');
    SQL = ` 
    INSERT INTO iceCream(name, is_favorite) VALUES('chocolate',true);
    INSERT INTO iceCream(name, is_favorite) VALUES('vanilla',false);
    INSERT INTO iceCream(name, is_favorite) VALUES('rocky_road',false);
    INSERT INTO iceCream(name, is_favorite) VALUES('cotton_candy',true);
    `;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    })
  };
  
  init();