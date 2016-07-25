var MongoClient = require('mongodb').MongoClient;
        var mongo = require('mongodb');
		var version = mongo.version;

		console.log(version) //ensure current version

var connUrl = 'mongodb://127.0.0.1:27017/makeupdb';


//requiring the modules so we can access them later on
var request = require("request");
var cheerio = require("cheerio");


//display on html page
var http = require('http');

var hostname = '127.0.0.01';
var port = 1337;

http.createServer(function(request, response) {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end("Hello World");
}).listen(port, hostname, function() {
	console.log("Server running at http://" + hostname + ":" + port + "/");
});


//connect to database 
MongoClient.connect(connUrl, function (err, db) {
    if (err) {
        throw err;
    } 
    else {
        console.log("successfully connected to the database");



        //define url to download 
		var url = "http://www.nyxcosmetics.ca/en_CA/highlight-contour";

		//these arrays will store the scraped information from webpage
		var prodList = [];
		var priceList = [];

		//this is the array that will be used to organize and display ithe scraped info
		var products = [];

		request(url, function(error, response, body) {
			if(!error) {

				
				//load page into cheerio
				var $ = cheerio.load(body);
				
				//for each product on the page store in respective arrays
				$(".product_tile_wrapper").each(function(i, elem) {
					prodList[i] = $(this).find($(".product_name")).attr("title");
					priceList[i] = $(this).find($(".product_price")).attr("data-pricevalue");
				});

				for(var i = 0; i < prodList.length; i++) {
					//store product info as an object
					var prod = {
						name: prodList[i], 
						price: priceList[i]
					};
					products.push(prod);
				}

				//console.log(products);

				//in the 'posts' collection
				var collection = db.collection('posts');


				//NEW line added - remove old data and...
				collection.remove({}, function(error, result) {
					console.log(error);
					console.log(result);
					console.log("remove");
				});

				//replace with new data
				collection.insert(products, function(error, result) {
					console.log(error);
					console.log(result);
					console.log("inserted");
				});


				//verify the number of products inside the db
				collection.count({}, function(error, numOfDocs) {
					if(error) {
						return callback(err);
					}
					console.log("number of documents in database: " + numOfDocs);
				});

			} else {
				console.log("We've encountered an error!")
			}

		});
	}

    
});