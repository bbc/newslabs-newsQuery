var assert = require("assert");
var util = require("util");
var moment = require("moment");
var newsquery = require(__dirname+'/../lib/newsquery');

describe('Get the number of occurences of a concept today', function(){
    var response = { };

    before(function(done){
        newsquery.getConceptOccurrencesOverTime("http://dbpedia.org/resource/Ukraine")
        .then(function(occurences) {
            response = occurences;
            done();
        });
    });
    
    it('Should return one result', function(){
        assert.equal(1, response.length);
    });
    
    it('Date should be a string', function(){
        assert.equal(typeof(response[0].date), 'string');
    });
    
    it('Value should be a number', function(){
        assert.equal(typeof(response[0].value), 'number');
    });
});

describe('Get the number of occurences of a concept over the last 30 days', function(){
    this.timeout(10000);
    
    var response = { };

    before(function(done){
        newsquery.getConceptOccurrencesOverTime("http://dbpedia.org/resource/Ukraine", moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
        .then(function(occurences) {
            response = occurences;
            done();
        });
    });
    
    it('Should return results for the last 30 days', function(){
        assert.equal(30, response.length);
    });
});


describe('Get the number of occurences of a concept from a specific source over the last 7 days', function(){
    var response = { };

    before(function(done){
        newsquery.getConceptOccurrencesOverTime("http://dbpedia.org/resource/Russia",
                                                moment().subtract(7, 'days').format('YYYY-MM-DD'),
                                                moment().format('YYYY-MM-DD'),
                                                "http://www.bbc.co.uk/ontologies/bbc/TheGuardian"
                                                )
        .then(function(occurences) {
            response = occurences;
            done();
        });
    });
    
    it('Should return results for the last 7 days', function(){
        assert.equal(7, response.length);
    });
});

