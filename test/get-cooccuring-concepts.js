var assert = require("assert");
var util = require("util");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Get related concepts URI using the semantic API', function(){
    // @fixme Allowing long for this query as sometimes it's slow
    // Even allowing for 10 seconds it still often fails if it isn't cached!
    this.timeout(20000);
    var response = { };
    
    before(function(done){
        newsquery.getCoOccuringConcepts("http://dbpedia.org/resource/Ukraine")
        .then(function(concepts) {
            response = concepts;
            done();
        });
    });
    
    it('Should return 10 matching concepts by default', function(){
        assert.equal(10, response.length);
    });
    
    it('Concept should have a name', function(){
        assert.equal(typeof(response[0].name), 'string');
    });

    it('Concept should have a uri', function(){
        assert.equal(typeof(response[0].uri), 'string');
    });
    
    it('Concept should have an image', function(){
        assert.equal(typeof(response[0].image), 'string');
    });

    it('Concept should have a number of occurrences as a number', function(){
        assert.equal(typeof(response[0].occurrences), 'number');
    });

});

describe('Get list of concepts of a specific type from a specific source using the semantic API', function(){
    // @fixme Allowing long for this query as sometimes it's slow
    // Even allowing for 10 seconds it still often fails if it isn't cached!
    this.timeout(10000);
    var response = { };
    
    before(function(done){
        newsquery.getCoOccuringConcepts("http://dbpedia.org/resource/Ukraine", 5, "http://dbpedia.org/ontology/Person", "http://www.bbc.co.uk/ontologies/bbc/SkyNews")
        .then(function(concepts) {
            response = concepts;
            done();
        });
    });
    
    it('Should return exactly 5 matching concepts by default', function(){
        assert.equal(5, response.length);
    });
    
    it('Concept should have a name', function(){
        assert.equal(typeof(response[0].name), 'string');
    });

    it('Concept should have a uri', function(){
        assert.equal(typeof(response[0].uri), 'string');
    });

    it('Concept should have an image', function(){
        assert.equal(typeof(response[0].image), 'string');
    });

    it('Concept should have a number of occurrences as a number', function(){
        assert.equal(typeof(response[0].occurrences), 'number');
    });

});