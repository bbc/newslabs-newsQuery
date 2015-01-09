var assert = require("assert");
var util = require("util");
var moment = require("moment");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Get articles similar to supplied text', function(){
    this.timeout(20000);
    var response;

    before(function(done){
        newsquery.getSimilarArticlesFromText("Got my tax return back. Last year I paid £14,250 in income tax, £4,175 National Insurance, £1,620 council tax and e. £8,400 VAT #doingmybit")
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