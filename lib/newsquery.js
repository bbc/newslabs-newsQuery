/**
 * newsQuery - A module to interface with the BBC News Labs API
 * See http://newshack.co.uk for details #newsHACK
 */

var Q = require('q');
var request = require('request');
var util = require('util');

module.exports = function(apiKey) {
    
    this.apiKey = apiKey;
    this.semanticNewsApiHost = "http://data.bbc.co.uk/v1/bbcrd-newslabs";
    this.juicerApiHost = "http://data.bbc.co.uk/bbcrd-juicer";
    
    /**
      * Get info about a concept & articles related to to it, using it's URI
      *
      * @param    {String}   keywords            A list of keywords to search for
      * @param    {Array}    conceptTypeUris     An optional array of Concept Type URIs to filter on (e.g. ["http://dbpedia.org/ontology/Company"])
      * @param    {Number}   articleLimit        Set a limit on the number of articles to return
      *
      * If something is "a sub class of" another type it will also be returned. 
      * e.g. Searching for "Companies" called "Apple" returns "Apple Computer" 
      * (the computer company) and also "Apple Records" (the record label) as 
      * "Record Label" is a sub class of "company" in the dbpedia ontology.
      */
     this.getConcept = function(conceptUri, articleLimit) {
         if (articleLimit === void(0))
             articleLimit = 10;

        // @fixme articleLimit is zero API endpoint fails! :/
        if (articleLimit === 0)
            articleLimit = 1;
        
         var url = this.semanticNewsApiHost+'/concepts?uri='+encodeURIComponent(conceptUri)+'&limit='+encodeURIComponent(articleLimit)+'&apikey='+encodeURIComponent(this.apiKey);
         return this.getUrl(url)
         .then(function(concept) {
             if (concept.uri) {
                concept.type = this.getParentOntologyClasses(concept.type);
                concept.description = concept.abstract;
                concept.name = concept.label;
                delete concept.abstract;
                delete concept.label;
                delete concept.typeLabel;
            }
            return concept;
         });
     };
     
    /**
     * Search our list of concepts by free text string.
     *
     * Can optionally only return results matching a specific type (e.g. people,
     * places, organisations...)
     *
     * @param    {String}   keywords            A list of keywords to search for
     * @param    {Number}   limit               Set a limit on the number of results to return
     * @param    {Array}    conceptTypeUris     An optional array of Concept Type URIs to filter on (e.g. ["http://dbpedia.org/ontology/Company"])
     *
     * Note: If something is "a sub class of" another type it will also be
     * returned. e.g. Searching for "Companies" called "Apple" return
     * "Apple Computer" (the computer company) and also "Apple Records" (the 
     * record label) as "Record Label" is a sub class of "company" in dbpedia.
     */
    this.getConcepts = function(keywords, limit, conceptTypeUris) {
        if (limit === void(0))
            limit = 10;

        if (limit === 0)
            limit = 1;

        // @fixme The API endpoint is broken! :( Adding +1 to the limit here so the API always returns the correct number of results, as otherwise *sometimes* it doesn't! (e.g. try searching for "Smith" vs "ABC")
        var url = this.semanticNewsApiHost+'/concepts/tagged?q='+encodeURIComponent(keywords)+'&limit='+encodeURIComponent(limit + 1)+'&apikey='+encodeURIComponent(this.apiKey);

        if (conceptTypeUris instanceof Array) {
            for (var i=0; i<conceptTypeUris.length; i++) {
                url += '&class='+encodeURIComponent(conceptTypeUris[i]);
            }
        } else if (conceptTypeUris) {
            url += '&class='+encodeURIComponent(conceptTypeUris);
        }

        return this.getUrl(url)
        .then(function(response) {
            var result = [];
            response[1].forEach(function(conceptName, i) {
                // Don't return more results than was asked for
                // @fixme Should not be necessary, but the API does not always return the correct number of results
                if (result.length >= limit)
                    return;

                var c = { name: conceptName,
                          uri: response[3][i],
                          image: ''
                        };

                c.type = this.getParentOntologyClasses(response[4][i].type);
                
                if (response[4][i].thumbnail)
                     c.image = response[4][i].thumbnail;

                result.push(c);
            });
            return result;
        });
    };
    
    /**
     * Find other concepts mentioned in articles about a concept (co-occurences)
     *
     * @param    {String}   conceptUri          The URI of a concept to search for
     * @param    {Number}   limit               Set a limit on the number of results to return
     * @param    {Array}    conceptTypeUris     An array of Concept Type URIs (e.g. ["http://dbpedia.org/ontology/Company"])
     */
    this.getRelatedConcepts = function(conceptUri, limit, conceptTypeUris) {
        if (limit === void(0))
            limit = 10;

        if (limit === 0)
            limit = 1;

        // Always request 2 more concepts than has been asked for, as we will ignore the first result (which is the concept that has been asked for!) *and* sometimes the API returns one less than requested.
        var url = this.semanticNewsApiHost+'/concepts/co-occurrences/?uri='+encodeURIComponent(conceptUri)+'&limit='+encodeURIComponent(limit + 2)+'&apikey='+encodeURIComponent(this.apiKey);
        
        if (conceptTypeUris instanceof Array) {
            for (var i=0; i<conceptTypeUris.length; i++) {
                url += '&type='+encodeURIComponent(conceptTypeUris[i]);
            }
        }
        return this.getUrl(url)
        .then(function(response) {
            if (!response['co-occurrences'])
                return [];

            var result = [];
            response['co-occurrences'].forEach(function(concept, i) {
                
                // Ignore occurences of this concept
                if (conceptUri == concept.thing)
                    return;
                
                // Don't return more results than was asked for
                if (result.length >= limit)
                    return;

                var c = { name: concept.label,
                          uri: concept.thing,
                          occurrences: parseInt(concept.occurrence),
                          image: ''
                        };

                if (concept.img)
                     c.image = concept.img;

                result.push(c);
            });
            return result;
        });
    };

    /**
     * Search our list of articles (aka 'Creative Works') by concept
     *
     * @param   {Array}     conceptUris     An array of conceptUri strings to fetch (e.g. ["http://dbpedia.org/resource/Europe"] to fetch articles that mention Europe)
     * @param   {Number}    limit           Set a limit on the number of results to return
     * @param   {Number}    offset          Use in conjection with limit to page through result
     *
     */
    this.getArticlesByConcept = function(conceptUris, limit, offset) {
        if (limit === void(0))
            limit = 10;
            
        if (limit === 0)
            limit = 1;
    
        if (offset === void(0))
            offset = 0;

        var url = this.semanticNewsApiHost+'/creative-works?limit='+encodeURIComponent(limit)+'&offset='+encodeURIComponent(offset)+'&apikey='+encodeURIComponent(this.apiKey);

        if (conceptUris instanceof Array) {
            for (var i=0; i<conceptUris.length; i++) {
                url += '&tag='+encodeURIComponent(conceptUris[i]);
            }
        } else {
            url += '&tag='+encodeURIComponent(conceptUris);
        }
        
        return this.getUrl(url)
        .then(function(response) {
                
            if (!response['@graph'])
                return [];

            var result = [];
            response['@graph'].forEach(function(article, i) {
                var a = { id: article.identifier,
                          source: article.product['@id'],
                          url: article.primaryContentOf,
                          dateCreated: article.dateCreated,
                          title: article.title,
                          description: article.description,
                          image: '',
                          concepts: []
                        };

                if (article.thumbnail)
                    a.image = article.thumbnail;

                if (article.tag['@set']) {
                    article.tag['@set'].forEach(function(concept, i) {
                        var c = { name: concept.label,
                                  uri: concept['@id'],
                                  type: concept['@type'],
                                  image: ''
                                };

                        if (concept.thumbnail)
                             c.image = concept.thumbnail;

                        if (concept.lat)
                             c.lat = concept.lat;

                        if (concept.long)
                             c.lon = concept.long;

                        a.concepts.push(c);
                    });
                }
                
                result.push(a);
            });
            return result;
        });
    };
    
    /**
     * @todo Method to search The News Juicer for Articles
     */
    //this.getArticles = function(keywords, sources, limit, offset) {
            // URL Example: {{host}}/articles.json?text=London&product[]=TheGuardian&product[]=NewsWeb&content_format[]=TextualFormat&section[]=China&site[]=&published_after=2010-10-10&published_before=2014-01-01&apikey={{apikey}}

    //};
    
    /**
     * For a given class in the ontology, fetch all it's parent classes.
     * Using a pre-processed file for this (uses more memory but faster).
     * 
     * This makes it easy to check if a concept is a "Company", "Person",
     * "Place", "Organisation" or some other high level type of entity.
     *
     * @param   {String}    uri     A URI of an ontology class e.g. http://dbpedia.org/ontology/Company
     * @return  {Array}             Returns an array of URI strings, in order (closest parent first)
     */
    this.getParentOntologyClasses = function(uri) {
       if (!uri.match(/^http:\/\/dbpedia.org\/ontology\//))
           return [];

        var dbpediaOntology = require(__dirname + '/dbpedia-ontology-flat.json');
        var type = uri.replace(/^http:\/\/dbpedia.org\/ontology\//, '');

        var result = [ uri ];
        if (dbpediaOntology[type]) {
            dbpediaOntology[type].forEach(function(dbpediaType) {
               result.push('http://dbpedia.org/ontology/'+dbpediaType);
            });
        }
        return result;
    };

    this.getUrl = function(url, callback) {
        var deferred = Q.defer();
        request(url, function (error, response, body) {
            if (error || response.statusCode != "200") {
                deferred.resolve({});
            } else {
                deferred.resolve(JSON.parse(body));
            }
        });
        return deferred.promise;
    };

    return this;

};