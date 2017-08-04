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

      //console.log(ip);

      oneStock ? request(apiURL+stock, getStockOne) : request(apiURL+stock[0], getStockOne);


      function getStockOne(error, response, body){
        setStockData(error, response, body, function setComplete(){
          if(oneStock){
            stockData.length ? res.json({ stockData: stockData }) : res.send('no stock data');
          } else {
            request(apiURL+stock[1], getStockTwo);
          }
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

          MongoClient.connect(CONNECTION_STRING, function connected(err, db) {
            if( !err ){
              var collection = db.collection('likes');

              collection.findAndModify(
                { stock: data.t },
                [],// sort order
                likes ? { $addToSet: { ips: ip } } : { $set: { stock: data.t } },
                {
                  new: likes ? true : false,
                  upsert: likes ? true : false
                },
                function foundOrNot(errors, doc) {
                  if( !errors ) {
                    console.log(doc);

                    stockData.push({
                       stock: data.t,
                       price: data.l,
                       likes: doc.value ? doc.value.ips.length : 0
                    });

                    next();
                  } else res.send(errors);// else errors in findAndModify
                }// end foundOrNot
              );
            } else res.send(err);// else err in db connect

          });// end MongoClient.connect
        }// end if (!error && response.statusCode)
      };// end setStockData


    });// end get

};
