var assert = require("assert");
var util = require("util");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Get articles by concept using the semantic API', function(){
    // @fixme Allowing long for this query as sometimes it's slower
    // Even allowing for 10 seconds it still often fails if it isn't cached!
    this.timeout(30000);
    var response  = { };
    
    before(function(done){
        newsquery.getArticlesByConcept("http://dbpedia.org/resource/David_Cameron")
        .then(function(articles) {
            response = articles;
            done();
        });
    });

    it('Should return 10 matching articles by default', function(){
        assert.equal(10, response.length);
    });

    it('Article should have an id', function(){
        assert.equal(typeof(response[0].id), 'string');
    });

    it('Article should have a source', function(){
        assert.equal(typeof(response[0].source), 'string');
    });

    it('Article should have a title', function(){
        assert.equal(typeof(response[0].title), 'string');
    });

    it('Article should have a description', function(){
        assert.equal(typeof(response[0].description), 'string');
    });

    it('Article should have a url', function(){
        assert.equal(typeof(response[0].url), 'string');
    });

    it('Article should have a date created timestamp', function(){
        assert.equal(typeof(response[0].dateCreated), 'string');
    });

    it('Article should be tagged with at least one useful concept', function(){
        assert.equal(true, (response[0].concepts.length > 1));
    });
    
    it('Concept associated with article should have a name', function(){
        assert.equal(typeof(response[0].concepts[0].name), 'string');
    });

    it('Concept associated with article should have a uri', function(){
        assert.equal(typeof(response[0].concepts[0].uri), 'string');
    });

    it('The type for concepts on an Article should be an array', function(){
        assert.equal((response[0].concepts[0].type instanceof Array), true);
    });
    
    it('Article should have at least one concept associated with it', function(){
        assert.equal((response[0].concepts[0].type.length > 0), true);
    });
    
    it('Concept associated with article should have an image', function(){
        assert.equal(typeof(response[0].concepts[0].image), 'string');
    });

});

// @todo Test finding related concepts filtered by type (e.g. only people, only companies)