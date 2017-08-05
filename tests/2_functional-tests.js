/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('GET /api/stock-prices => stockData object', function() {
      var first_likes;
      var likes;
      var rel_likes;

      test('1 stock', function(done) {
        this.timeout(5000);
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.property(res.body.stockData[0], 'stock');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'likes');
            first_likes = res.body.stockData[0].likes;
            done();
          });
      });

      test('1 stock with like', function(done) {
        this.timeout(5000);
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'amzn', like: 'true' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, 'AMZN');
            assert.property(res.body.stockData[0], 'stock');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'likes');
            assert.isAbove(res.body.stockData[0].likes, 0, 'likes is above zero');
            likes = res.body.stockData[0].likes;
            done();
          });
      });

      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        this.timeout(5000);
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'amzn', like: 'true' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, 'AMZN');
            assert.property(res.body.stockData[0], 'stock');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'likes');
            assert.equal(res.body.stockData[0].likes, likes, 'likes are still equal');
            done();
          });
      });


      test('2 stocks', function(done) {
        this.timeout(5000);
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['amzn', 'goog'] })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.isArray(res.body.stockData);
            assert.isObject(res.body.stockData[0]);
            assert.isObject(res.body.stockData[1]);
            assert.property(res.body.stockData[0], 'stock');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'rel_likes');
            // rel_likes for amzn will be one as it has a like prev
            rel_likes = Math.abs(res.body.stockData[0].rel_likes); 
            done();
          });
      });

      test('2 stocks with like', function(done) {
        this.timeout(5000);
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['amzn', 'goog'], like: 'true' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.isArray(res.body.stockData);
            assert.isObject(res.body.stockData[0]);
            assert.isObject(res.body.stockData[1]);
            assert.property(res.body.stockData[1], 'stock');
            assert.property(res.body.stockData[1], 'price');
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.equal(Math.abs(res.body.stockData[0].rel_likes), 0);
            done();
          });
      });

    });

});
