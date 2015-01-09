var assert = require("assert");
var util = require("util");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Get a concept by URI using the semantic API', function(){
    this.timeout(10000);
    var response = { };
    
    before(function(done){
        // @fixme Tried Adam_Smith (the economist) but heis not in our list of known concepts (despite being in dbpedia)
        newsquery.getConcept("http://dbpedia.org/resource/David_Cameron")
        .then(function(concept) {
            response = concept;
            done();
        });
    });
    
    it('Should return the correct name for the concept', function(){
        assert.equal("David Cameron", response.name);
    });
    
    it('Should return a description', function(){
        assert.equal(typeof(response.description), 'string');
    });

    it('Should return 10 related articles by default', function(){
        assert.equal(10, response.articles.length);
    });

    it('The type value should be an array', function(){
        assert.equal((response.type instanceof Array), true);
    });
        
    it('Should return multiple values for the type for this test', function(){
        assert.equal(true, (response.type.length > 1));
    });

});

describe('Get additional articles for a concept using the semantic API', function(){
    this.timeout(10000);
    var response = { };
    
    before(function(done){
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