var assert = require("assert");
var util = require("util");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Get sources the semantic API knows about', function(){
    var response;
    
    before(function(done){
        newsquery.getSources()
        .then(function(sources) {
            response = sources;
            done();
        });
    });
    
    it('The list of sources should be an array', function(){
        assert.equal((response instanceof Array), true);
    });
        
    it('Should return multiple sources', function(){
        assert.equal((response.length > 1), true);
    });
        
    it('All sources should contain values for source name and uri', function(){
        for (var i = 0; i < response.length; i++) {
            assert.equal((typeof response[i].name === 'string'), true);
            assert.equal((typeof response[i].uri === 'string'), true);
        }
    });

});