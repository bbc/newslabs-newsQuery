var assert = require("assert");
var util = require("util");
var config = require(__dirname+'/config.json');
var newsquery = require(__dirname+'/../lib/newsquery')(config.bbcNewsLabs.apiKey);

describe('Find concepts by name using the semantic API', function(){
    var limit = 5;
    var response = { };
    
    beforeEach(function(done){
        newsquery.findConcepts("Smith", limit)
        .then(function(concepts) {
            response = concepts;
            done();
        });
    });
    
    it('Should return the expected number of results', function(){
       assert.equal(limit, response.length);
    });
});

describe('Gracefully fail to find by name using the semantic API', function(){
    var limit = 5;
    var response = { };
    
    beforeEach(function(done){
        newsquery.findConcepts("ABCDEFABCDEF12345678901234567890", limit)
        .then(function(concepts) {
            response = concepts;
            done();
        });
    });
    
    it('Should not find any results', function(){
       assert.equal(0, response.length);
    });
});