var assert = require("assert");
var util = require("util");
var moment = require("moment");
var config = require(__dirname+'/config.json');
var newsquery = require(__dirname+'/../lib/newsquery')(config.bbcNewsLabs.apiKey);

describe('Get the number of occurences of a concept today', function(){
    var response = { };

    beforeEach(function(done){
        newsquery.getConceptOccurrencesOverTime("http://dbpedia.org/resource/Ukraine")
        .then(function(concept) {
            response = concept;
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
    var response = { };

    beforeEach(function(done){
        newsquery.getConceptOccurrencesOverTime("http://dbpedia.org/resource/Ukraine", moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
        .then(function(concept) {
            response = concept;
            done();
        });
    });
    
    it('Should return results for the last 30 days', function(){
        assert.equal(30, response.length);
    });
});

