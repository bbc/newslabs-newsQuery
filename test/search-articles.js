var assert = require("assert");
var util = require("util");
var moment = require("moment");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Search articles by keywords', function(){
    this.timeout(20000);
    var response;

    before(function(done){
        newsquery.searchArticles("Ukraine Russia")
        .then(function(articles) {
            response = articles;
            done();
        });
    });

    it('The list of articles should be an array', function(){
        assert.equal((response instanceof Array), true);
    });

    it('Should return multiple articles', function(){
        assert.equal((response.length > 1), true);
    });

    it('All articles should contain an id and a url', function(){
        for (var i = 0; i < response.length; i++) {
            assert.equal((typeof response[i].url === 'string'), true);
            assert.equal((typeof response[i].id === 'string'), true);
        }
    });

});

describe('Search articles in the last 3 months by keywords', function(){
    this.timeout(20000);
    var response;

    before(function(done){
        newsquery.searchArticles("Europe", moment().subtract(3, 'months').format('YYYY-MM-DD'))
        .then(function(articles) {
            response = articles;
            done();
        });
    });

    it('The list of articles should be an array', function(){
        assert.equal((response instanceof Array), true);
    });

    it('Should return multiple articles', function(){
        assert.equal((response.length > 1), true);
    });

});