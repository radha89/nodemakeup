//tutorial: https://www.smashingmagazine.com/2015/04/web-scraping-with-nodejs/

//requiring the module so we can access them later on
var request = require("request");
var cheerio = require("cheerio");

/*
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
*/

var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    assert = require('assert');


var connUrl = 'mongodb://localhost:27017/test';
MongoClient.connect(connUrl, {native_parser:true}, function(err, db) {
  assert.equal(null, err);

	// this is the same as running `use makeupdb` from the
	// shell
	db = db.getSiblingDB('makeupdb');

	console.log("Connected correctly to server.");
	

	//use makeupdb;


	//define url to download 
	var url = "http://www.nyxcosmetics.ca/en_CA/highlight-contour";

	var prodList = [];
	var priceList = [];
	var products = [];

	request(url, function(error, response, body) {
		if(!error) {

			
			//load page into cheerio
			var $ = cheerio.load(body);
			
			$(".product_tile_wrapper").each(function(i, elem) {
				prodList[i] = $(this).find($(".product_name")).attr("title");
				priceList[i] = $(this).find($(".product_price")).attr("data-pricevalue");
			});
			prodList.join(', ');
			console.log(prodList);
			console.log(priceList);

			for(var i = 0; i < prodList.length; i++) {
				var prod = {
					name: prodList[i], 
					price: priceList[i]
				};
				products.push(prod);
			}

			//insert the prods into the database
			//in the 'allProducts' collection
			db.posts.insert(products);
		} else {
			console.log("We've encountered an error!")
		}
	});

  	//db.close();
});