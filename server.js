'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const dbSchema = require('./databaseSchema');

let Artist = dbSchema.Artist;
let Artwork = dbSchema.Artwork;
let Album = dbSchema.Album;
let Category = dbSchema.Category;
let Op = dbSchema.Op;
let sequelize = dbSchema.sequelize;

let app = express();

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});



console.log('server started');


app.use((req, res, next) => {
    console.warn(req.method + ' -> ' + req.url);
    next();
});

app.use(bodyParser.json());

app.use(express.static('./artist-manager-front/build'));

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  
app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({ force : true });
        res.status(201).json({ message : 'created' });
    }
    catch(e){
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.message });
    }
});

app.get('/artists', async (req, res) => {
     try {
         let params = {
	    	where : {},
	    	order : [
	    		['lastname','ASC'],
	    		['firstname', 'ASC']
	    	]
	    };
	    let pageSize = 10;
	    if (req.query){
	    	if (req.query.filter){
	    		params.where.lastName = {
	                [Op.like] : `%${req.query.filter}%`
	            };
	    	}
	    	if (req.query.pageSize){
	    		pageSize = parseInt(req.query.pageSize, 10);
	    	}
	    	if (req.query.pageNo){
	    		params.limit = pageSize;
	    		params.offset = parseInt(req.query.pageNo, 10) * pageSize;
	    	}
	    }
        let artists = await Artist.findAll(params);
		res.status(200).json(artists);
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.message });
    }
});

app.get('/artists/:id', async (req, res) => {
    try {
        let artist = await Artist.findById(req.params.id);
        if (artist){
            res.status(200).json(artist);
        }
        else{
            res.status(404).json({ message : 'not found' });
        }
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });
    }
});

app.post('/artists', async (req, res) => {
    try {
        if (req.query.bulk && req.query.bulk == 'on'){
			await Artist.bulkCreate(req.body);
			res.status(201).json({ message : 'created' });
		}
		else {
		    let artist = await Artist.create(req.body);
            res.status(201).json({ message : 'created', id: artist.id });    
		}
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });
    }
});

app.put('/artists/:id', async (req, res) => {
   try {
        let artist = await Artist.findById(req.params.id);
        if (artist){
            await artist.update(req.body, {fields : [ 'firstname', 'lastname', 'birthdate' ]});
            res.status(202).json({ message : 'accepted' });
        }
        else{
            res.status(404).json({ message : 'not found' });
        }
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });   
    }
});

app.delete('/artists/:id', async (req, res) => {
   try {
        let artist = await Artist.findById(req.params.id);
        if (artist){
            await artist.destroy();
            res.status(202).json({ message : 'accepted' });
        }
        else{
            res.status(404).json({ message : 'not found' });
        }
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });
    }
});

app.get('/artists/:id/artworks', async (req, res) => {
    try {
		let artist = await Artist.findById(req.params.id);
		if (artist){
			let artworks = await artist.getArtworks();
			res.status(200).json(artworks);
		}
		else{
			res.status(404).json({message : 'not found'});
		}
	} catch (e) {
		console.warn(e.stack);
		res.status(500).json({ message : 'server error', cause: e.cause });
	}
});

app.post('/artists/:id/artworks', async (req, res) => {
	try {
		let artist = await Artist.findById(req.params.id);
		if (artist){
			let artwork = req.body;
			artwork.artistId = artist.id;
			await Artwork.create(artwork);
			res.status(201).json({ message : 'created' });
		}
		else{
			res.status(404).json({ message : 'not found' });
		}
	} catch (e) {
		console.warn(e.stack);
		res.status(500).json({ message : 'server error', cause: e.cause });
	}
});

app.put('/artists/:aid/artworks/:wid', async (req, res) => {
	try {
		let artist = await Artist.findById(req.params.aid);
		if (!artist){
			res.status(404).json({message : 'not found'});
		}
		else{
			let artworks = await artist.getArtworks({ where : { id : req.params.wid }});
			let artwork = artworks.shift();
			if (!artwork){
				res.status(404).json({ message : 'not found' });
			}
			else{
				await artwork.update(req.body);
				res.status(202).json({ message : 'accepted'});
			}
		}
	} catch (e) {
		console.warn(e.stack);
		res.status(500).json({ message : 'server error', cause: e.cause });
	}
});

app.delete('/artists/:aid/artworks/:wid', async (req, res) => {
	try {
	    let artist = await Artist.findById(req.params.aid);
		if (!artist){
			res.status(404).json({ message : 'not found' });
		}
		else{
			let artworks = await artist.getArtworks({ where : { id : req.params.wid }});
			let artwork = artworks.shift();
			if (!artwork){
				res.status(404).json({message : 'not found'});
			}
			else{
				await artwork.destroy();
				res.status(202).json({message : 'accepted'});
			}
		}
	} catch (e) {
		console.warn(e.stack);
		res.status(500).json({ message : 'server error', cause: e.cause });
	}
});

app.get('/artworks', async (req, res) => {
     try {
         let params = {
	    	where : {},
	    	order : [
	    		['name','ASC'],
	    		['year', 'ASC']
	    	]
	    };
	    let pageSize = 10;
	    if (req.query){
	    	if (req.query.filter){
	    		params.where.name = {
	                [Op.like] : `%${req.query.filter}%`
	            };
	    	}
	    	if (req.query.pageSize){
	    		pageSize = parseInt(req.query.pageSize, 10);
	    	}
	    	if (req.query.pageNo){
	    		params.limit = pageSize;
	    		params.offset = parseInt(req.query.pageNo, 10) * pageSize;
	    	}
	    }
        let artworks = await Artwork.findAll(params);
		res.status(200).json(artworks);
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.message });
    }
});

app.get('/artworks/:id', async (req, res) => {
    try {
        let artwork = await Artwork.findById(req.params.id);
        if (artwork){
            res.status(200).json(artwork);
        }
        else{
            res.status(404).json({ message : 'not found' });
        }
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });
    }
});

app.post('/artworks', async (req, res) => {
    try {
        if (req.query.bulk && req.query.bulk == 'on'){
			await Artwork.bulkCreate(req.body);
			res.status(201).json({ message : 'created' });
		}
		else {
		    let artwork = await Artwork.create(req.body);
            res.status(201).json({ message : 'created', id: artwork.id });    
		}
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });
    }
});

app.put('/artworks/:id', async (req, res) => {
   try {
        let artwork = await Artwork.findById(req.params.id);
        if (artwork){
            await artwork.update(req.body, { fields : [ 'name', 'year' ]});
            res.status(202).json({ message : 'accepted' });
        }
        else{
            res.status(404).json({ message : 'not found' });
        }
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });   
    }
});

app.delete('/artworks/:id', async (req, res) => {
   try {
   	    let artwork = await Artwork.findById( req.params.id );
        if (artwork){
            await artwork.destroy();
            res.status(202).json({ message : 'accepted' });
        }
        else{
            res.status(404).json({ message : 'not found' });
        }
    } catch (e) {
        console.warn(e.stack);
        res.status(500).json({ message : 'server error', cause: e.cause });
    }
});

app.listen(process.env.PORT || 8080 , process.env.IP || "0.0.0.0"); 