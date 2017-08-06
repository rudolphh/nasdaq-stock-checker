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

      var stockData = [];
      var stock =  req.query.stock;
      var oneStock = !Array.isArray(stock);

      var apiURL = "https://finance.google.com/finance/info?q=NASDAQ%3a";
      var like = (req.query.like === 'true');

      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      ip = ip.split(',')[0];

      //console.log(stock);
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
          if( stockData.length ){
            if ( stockData.length === 2 ) {
              stockData[0].rel_likes = stockData[0].likes - stockData[1].likes;
              stockData[1].rel_likes = stockData[1].likes - stockData[0].likes;
              delete stockData[0].likes;
              delete stockData[1].likes;
            }
            res.json({ stockData: stockData });
          } else res.send('no stock data');
        });
      };

      var setStockData = function(error, response, body, next){
        // if there was no error, and the stock was found in the api request
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body.substring(3))[0];

          MongoClient.connect(CONNECTION_STRING, function connected(err, db) {
            if( !err ){
              var collection = db.collection('likes');

              collection.findAndModify(
                { stock: data.t },
                [],// no sort order
                like ? { $addToSet: { ips: ip } } : { $set: { stock: data.t } },
                {
                  new: like,
                  upsert: like
                },
                function findDone(errors, doc) {
                  if( !errors ) {
                    //console.log(doc);
                    stockData.push({
                       stock: data.t,
                       price: data.l,
                       likes: doc.value ? doc.value.ips.length : 0
                    });
                    next();
                  } else res.send(errors);// else errors in findAndModify
                }// end foundDone
              );
            } else res.send(err);// else err in db connect
          });// end MongoClient.connect
        } else next(); // the stock was not found in the api
      };// end setStockData

    });// end get
};
