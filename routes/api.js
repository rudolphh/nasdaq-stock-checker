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
      var oneStock = !Array.isArray(stock);

      var likes = req.query.likes || false;

      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      ip = ip.split(',')[0];

      //console.log(stock);


      // check for multiple stocks or one?
      // do we like this stock or stocks?

      // if single stock and like
        // if results for the stock
          // query by stock name in likes collection and only add new documents with unique ip fields
          // get count of likes for the particular stock
          // return document with stock, price, and likes
        // else respond 'no stock data'

      // if single and no like
        // if results for the stock
          // query by stock name in likes collection
          // return document with stock, price, and likes count

      // if multiple stocks and like
        // async series checking first as single
        // if first doesn't exist, treat second as single
        // if neither exist respond 'no stock data'
        // else once async series is done
          // get the difference of each as the like field value in stockData

      // do the same without like


      oneStock ? request(apiURL+stock, getStockOne) : request(apiURL+stock[0], getStockOne);


      function getStockOne(error, response, body){
        setStockData(error, response, body, function setComplete(){
          if(oneStock){
            stockData.length ? res.json({ stockData: stockData }) : res.send('no stock data');
          } else request(apiURL+stock[1], getStockTwo);
        });
      }

      function getStockTwo(error, response, body){
        setStockData(error, response, body, function setComplete(){
          stockData.length ? res.json({ stockData: stockData }) : res.send('no stock data');
        });
      };

      var setStockData = function(error, response, body, next){
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body.substring(3))[0];

          stockData.push({
             stock: data.t,
             price: data.l,
             likes: 0
          });
        }
        next();
      };


    });// end get

};
