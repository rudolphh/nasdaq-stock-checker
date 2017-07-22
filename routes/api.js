/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var request = require('request');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){

       var stock =  req.query.stock;
       var likes = req.query.likes || false;
       var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
       ip = ip.split(',')[0];

       console.log(stock);

       // if stock is array
         // request first stock info and second
         // search for likes in db
         // bring stockdata together
       // else 

       request("https://finance.google.com/finance/info?q=NASDAQ%3a"+stock,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var data = JSON.parse(body.substring(3))[0];
            var stockDoc = {
              stockData: {
                stock: data.t,
                price: data.l,
                likes: 0
              }
            }
            res.json(stockDoc);
          }
        });
    });

};
