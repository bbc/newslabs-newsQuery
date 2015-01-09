var assert = require("assert");
var util = require("util");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Find concepts by name using the semantic API', function(){
    var limit = 5;
    var response = { };
    
    before(function(done){
        newsquery.getConcepts("Smith", limit)
        .then(function(concepts) {
            response = concepts;
            done();
        });
    });
    
    it('Should return the expected number of results', function(){
       assert.equal(limit, response.length);
    });
    
    it('Concept should have a name', function(){
        assert.equal(typeof(response[0].name), 'string');
    });

    it('Concept should have a uri', function(){
        assert.equal(typeof(response[0].uri), 'string');
    });
    
    it('The type value should be an array', function(){
        assert.equal((response[0].type instanceof Array), true);
    });

    it('Concept should have an image', function(){
        assert.equal(typeof(response[0].image), 'string');
    });
    
});

describe('Gracefully fail to find concept by name using the semantic API', function(){
    var limit = 5;
    var response = { };
    
    before(function(done){
        newsquery.getConcepts("ABCDEFABCDEF12345678901234567890", limit)
        .then(function(concepts) {
            response = concepts;
            done();
        });
    });
    
    it('Should not find any results', function(){
       assert.equal(0, response.length);
    });
});

// @todo Test finding concepts by type (e.g. only people, only companies)