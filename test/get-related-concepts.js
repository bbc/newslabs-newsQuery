var assert = require("assert");
var util = require("util");
var config = require(__dirname+'/config.json');
var newsquery = require(__dirname+'/../lib/newsquery')(config.bbcNewsLabs.apiKey);

describe('Get related concepts URI using the semantic API', function(){
    // @fixme Allowing long for this query as sometimes it's slow
    // Even allowing for 10 seconds it still often fails if it isn't cached!
    this.timeout(10000);
    var response = { };
    
    beforeEach(function(done){
        newsquery.getRelatedConcepts("http://dbpedia.org/resource/Ukraine")
        .then(function(concept) {
            response = concept;
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

    it('Concept should have a number of occurences as a number', function(){
        assert.equal(typeof(response[0].occurrences), 'number');
    });

});

// @todo Test finding related concepts filtered by type (e.g. only people, only companies)