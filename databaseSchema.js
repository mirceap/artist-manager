'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const CURRENT_YEAR = 2019;

const sequelize = new Sequelize('artist_manager','root','',{
	dialect : 'mysql',
	define : {
		timestamps : false
	}
});

// table definitions
const Artist = sequelize.define('artist', {
    firstname: {
        type: Sequelize.STRING,
        allowNull : false,
	    validate : { 
	        len : [3, 255]
	    }
    },
    lastname:{
        type: Sequelize.STRING,
        allowNull : false,
	    validate : { 
	        len : [3, 255]
	    }
    },
    birthdate: {
        type: Sequelize.DATEONLY
    }
});

const Artwork = sequelize.define('artwork', {
    uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull : false,
	    validate : { 
	        len : [3, 255]
	    }
    },
    year: {
        type: Sequelize.INTEGER,
        validate :{
			isNumeric : true,
			min : 0,
			max : CURRENT_YEAR
		}
    }
});

const Album = sequelize.define('album', {
    name: {
        type: Sequelize.STRING,
        allowNull : false,
	    validate : { 
	        len : [3, 255]
	    }
    }
});

const Category = sequelize.define('category', {
    name: {
        type: Sequelize.STRING,
        allowNull : false,
	    validate : { 
	        len : [2, 255]
	    }
    }
});

// const ArtistAlbum = sequelize.define('artist_album', {
//   importance: Sequelize.INTEGER
// });

// table associations
Artist.hasMany(Artwork);
Artwork.belongsTo(Artist);

Album.hasMany(Artwork);
//Album.belongsToMany(Artist, through: { ArtistAlbum });
//Album.belongsToMany(Category, );

Category.hasMany(Artwork);
Category.hasMany(Album);

module.exports = { 
    Artwork,
    Artist,
    Album,
    Category,
    sequelize
};