var assert = require("assert");
var util = require("util");
var config = require(__dirname+'/config.json');
var newsquery = require(__dirname+'/../lib/newsquery')(config.bbcNewsLabs.apiKey);

describe('Get a concept by URI using the semantic API', function(){
    var response = { };
    
    beforeEach(function(done){
        // @fixme Tried Adam_Smith (the economist) but heis not in our list of known concepts (despite being in dbpedia)
        newsquery.getConcept("http://dbpedia.org/resource/David_Cameron")
        .then(function(concept) {
            response = concept;
            done();
        });
    });
    
    it('Should return the correct concept', function(){
        assert.equal("David Cameron", response.label);
    });
    
    it('Should return a description', function(){
        assert.equal(typeof(response.abstract), 'string');
    });

    it('Should return 10 related articls by default', function(){
        assert.equal(10, response.articles.length);
    });
    
});

describe('Get articles for a concept using the semantic API', function(){
    var response = { };
    
    beforeEach(function(done){
        newsquery.getConcept("http://dbpedia.org/resource/David_Cameron", 20)
        .then(function(concept) {
            response = concept;
            done();
        });
    });

    it('Should return 20 related articles', function(){
        assert.equal(20, response.articles.length);
    });
    
});