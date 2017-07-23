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

      var apiURL = "https://finance.google.com/finance/info?q=NASDAQ%3a";
      var stockData = [];

      var stock =  req.query.stock;
      var likes = req.query.likes || false;
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      ip = ip.split(',')[0];

      var oneStock = !Array.isArray(stock);

      console.log(stock);

      // if stock is array
       // request first stock info and second
       // search for likes in db
       // if likes
         // search likes for stock
       // bring stockdata together
      // else
      // request api stock info
      // request db like info
      //

      var setStockData = function(error, response, body){
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body.substring(3))[0];

          stockData.push({
             stock: data.t,
             price: data.l,
             likes: 0
          });
        }
      };

      var callbackTwo = function(error, response, body){
        setStockData(error, response, body);
        stockData.length ? res.json({ stockData: stockData }) : res.send('no stock data');
      };

      var callbackOne = function(error, response, body){
        setStockData(error, response, body);
        if(oneStock){
          stockData.length ? res.json({ stockData: stockData }) : res.send('no stock data');
        } else request(apiURL+stock[1], callbackTwo);
      }

      oneStock ? request(apiURL+stock, callbackOne) : request(apiURL+stock[0], callbackOne);

    });// end get

};
