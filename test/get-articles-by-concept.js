var assert = require("assert");
var util = require("util");
var config = require(__dirname+'/config.json');
var newsquery = require(__dirname+'/../lib/newsquery')(config.bbcNewsLabs.apiKey);

describe('Get articles by concept using the semantic API', function(){
    // @fixme Allowing long for this query as sometimes it's slower
    // Even allowing for 10 seconds it still often fails if it isn't cached!
    this.timeout(10000);
    var response = { };
    
    beforeEach(function(done){
        newsquery.getArticlesByConcept("http://dbpedia.org/resource/David_Cameron")
        .then(function(concept) {
            response = concept;
            done();
        });
    });

    it('Should return 10 matching articles by default', function(){
        console.log(response[0].mentions['@set'].length);
        assert.equal(10, response.length);
    });

    it('Article should have a subject', function(){
        assert.equal(typeof(response[0].subject), 'string');
    });

    it('Article should have a description', function(){
        assert.equal(typeof(response[0].description), 'string');
    });

    it('Article should have a url', function(){
        assert.equal(typeof(response[0].primaryContentOf), 'string');
    });

    it('Article should have a timestamp', function(){
        assert.equal(typeof(response[0].dateCreated), 'string');
    });

    it('Article should be tagged with at least one useful concept', function(){
        assert.equal(true, (response[0].mentions['@set'].length > 1));
    });

});

// @todo Test finding related concepts filtered by type (e.g. only people, only companies)