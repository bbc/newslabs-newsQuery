var Q = require('q');
var request = require('request');

/**
 * newsQuery - A module to interface with the BBC News Labs API
 * See http://newshack.co.uk for details #newsHACK
 */
module.exports = function(apiKey) {
    
    this.apiKey = apiKey;
    this.semanticNewsApiHost = "http://data.bbc.co.uk/v1/bbcrd-newslabs";
    this.juicerApiHost = "http://data.bbc.co.uk/bbcrd-juicer";
    
    /**
     * Search our list of concepts by free text string
     *
     * @param    {String}   keywords
     * @param    {Number}   limit
     */
    this.getConcepts = function(keywords, limit) {
        return getConceptsByType(keywords, null, limit);
    };

    /**
     * Search our list of concepts by free text string and only return results
     * matching a specific type
     *
     * @param    {String}   keywords
     * @param    {Array}    conceptUris    An array of Concept URIs (e.g. ["http://dbpedia.org/ontology/Company"])
     * @param    {Number}   limit
     *
     * Note: If something is "a sub class of" another type it will also be
     * returned. e.g. Searching for "Companies" called "Apple" return
     * "Apple Computer" (the computer company) and also "Apple Records" (the 
     * record label) as "Record Label" is a sub class of "company" in dbpedia.
     */
    this.getConceptsByType = function(keywords, conceptUris, limit) {
        if (limit === void(0))
            limit = 10;
            
        var url = this.semanticNewsApiHost+'/concepts/tagged?q='+encodeURIComponent(keywords)+'&limit='+encodeURIComponent(limit)+'&apikey='+encodeURIComponent(this.apiKey);
    
        if (conceptUris instanceof Array) {
            for (var i=0; i<conceptUris.length; i++) {
                url += '&class='+encodeURIComponent(conceptUris[i]);
            }
        }
        
        return this.getUrl(url)
        .then(function(json) {
            var response = JSON.parse(json);
            var result = [];
            for (var i=0; i<response[1].length; i++) {
                result[i] = {
                    name: response[1][i],
                    uri: response[3][i],
                    type: response[2][i],
                    typeUri: response[4][i].type,
                    thumbnail: response[4][i].thumbnail
                }
            }
            return result;
        });
    };

    /**
     * Search our list of articles (aka 'Creative Works') by concept
     */
    this.getArticlesByConcept = function(conceptUris, conceptType, limit, offset) {
        if (limit === void(0))
            limit = 10;
    
        if (offset === void(0))
            offset = 0;

        var url = this.semanticNewsApiHost+'/creative-works?limit='+encodeURIComponent(limit)+'&offset='+encodeURIComponent(offset)+'&apikey='+encodeURIComponent(this.apiKey);
        
        for (var i=0; i<conceptUris.length; i++) {
            url += '&tag='+encodeURIComponent(conceptUris[i]);
        }
        
        return this.getUrl(url)
        .then(function(json) {
            var response = JSON.parse(json);
            return response['@graph'];
        });
    }
    
    /**
     * @todo Method to search The News Juicer for Articles
     */
    this.getArticles = function(keywords, sources, limit, offset) {
            // URL Example: {{host}}/articles.json?text=London&product[]=TheGuardian&product[]=NewsWeb&content_format[]=TextualFormat&section[]=China&site[]=&published_after=2010-10-10&published_before=2014-01-01&apikey={{apikey}}

    };

    this.getUrl = function(url, callback) {
        var deferred = Q.defer();
        request(url, function (error, response, body) {
            if (error || response.statusCode != "200") {
                //console.log('Call to "'+url+'" failed with the error: "'+error+'"');
                deferred.resolve([]);
                return deferred.promise;
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    };

    return this;

};