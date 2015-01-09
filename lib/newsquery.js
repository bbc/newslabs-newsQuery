/**
 * newsQuery - A module to interface with the BBC News Labs API
 * See http://newshack.co.uk for details #newsHACK
 */

var Q = require('q');
var request = require('request');
var moment = require('moment');
var nodeCache = require('node-cache');
var crypto = require('crypto');

module.exports = (function(apiKey, cacheEnabled, cacheOptions) {
    
    // Default API key (pubic shared, rate limited, subject to revokation)
    if (!apiKey)
        apiKey = '9OHbOpZpVh9tQZBDjwTlTmsCF2Ce0yGQ';
    
    this.apiKey = apiKey;
    this.semanticNewsApiHost = "http://data.bbc.co.uk/v1/bbcrd-newslabs";
    this.juicerApiHost = "http://data.bbc.co.uk/bbcrd-juicer";

    this.cache = false;
    this.cacheOptions = { stdTTL: 60 * 5, checkperiod: 100 }; // 5 min cache
    this.cacheReadEnabled = false;
    this.cacheWriteEnabled = false;
    if (cacheEnabled === true) {
        if (cacheOptions)
            this.cacheOptions = cacheOptions;
        this.cache = new nodeCache(this.cacheOptions);
        this.cacheReadEnabled = true;
        this.cacheWriteEnabled = true;
    }

    /**
      * Get a list of sources the Semantic API knows about
      *
      * @return   {Array}
      */
     this.getSources = function() {
         "use webservice";
         
         var cacheValue = this.cacheRead('sources');
         if (cacheValue !== false)
             return cacheValue;
         
         var url = this.semanticNewsApiHost+'/products?apikey='+encodeURIComponent(this.apiKey);
         return this.getUrl(url)
         .then(function(response) {
             if (!response['@graph'])
                 throw "The Semantic News API did not return a list of sources";
             
             var sources = [];
             response['@graph'].forEach(function(product, i) {
                sources.push({  name: product.label,
                                uri: product['@id']
                             });
            });
            this.cacheWrite('sources', sources);
            return sources;
         });
     };

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
         "use webservice";
         
         var cacheId = crypto.createHash('sha1').update( "getConcept" + JSON.stringify({ method: getConcept, conceptUri: conceptUri, articleLimit: articleLimit}) ).digest("hex");         
         var cacheValue = this.cacheRead(cacheId);
         if (cacheValue !== false)
             return cacheValue;

         // Default article limit
         if (articleLimit === void(0))
             articleLimit = 10;

        // If limit is zero API endpoint fails
        articleLimit = parseInt(articleLimit) || 0;
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
            this.cacheWrite(cacheId, concept);
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
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "getConcepts" + JSON.stringify({ method: getConcepts, keywords: keywords, limit: limit, conceptTypeUris: conceptTypeUris }) ).digest("hex");         
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;

        // Default limit
        if (limit === void(0))
            limit = 10;

        // If limit is zero API endpoint fails
        limit = parseInt(limit) || 0;
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
            var concepts = [];
            response[1].forEach(function(conceptName, i) {
                // Don't return more results than was asked for
                // @fixme Should not be necessary, but the API does not always return the correct number of results
                if (concepts.length >= limit)
                    return;

                var c = { name: conceptName,
                          uri: response[3][i],
                          image: ''
                        };

                c.type = this.getParentOntologyClasses(response[4][i].type);
                
                if (response[4][i].thumbnail)
                     c.image = response[4][i].thumbnail;

                concepts.push(c);
            });
            this.cacheWrite(cacheId, concepts);
            return concepts;
        });
    };
    
    /**
     * Find other concepts mentioned in articles about a concept (co-occurences)
     *
     * @param    {String}   conceptUri          The URI of a concept to search for
     * @param    {Number}   limit               Set a limit on the number of results to return
     * @param    {Array}    conceptTypeUris     An array of Concept Type URIs (e.g. ["http://dbpedia.org/ontology/Company"])
     * @param    {String}   sourceUri           An optional source URI to filter on (e.g. "http://www.bbc.co.uk/ontologies/bbc/SkyNews")
     */
    this.getCoOccuringConcepts = function(conceptUri, limit, conceptTypeUris, sourceUri) {
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "getCoOccuringConcepts" + JSON.stringify({ cmethod: getCoOccuringConcepts, onceptUri: conceptUri, limit: limit, conceptTypeUris: conceptTypeUris, sourceUri: sourceUri }) ).digest("hex");         
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;

        // Default limit
        if (limit === void(0))
            limit = 10;

        // If limit is zero API endpoint fails
        limit = parseInt(limit) || 0;
        if (limit === 0)
            limit = 1;

        // Always request one more concept than has been asked for, as we will ignore the first result (it's the concept that has been passed)
        var url = this.semanticNewsApiHost+'/concepts/co-occurrences/?uri='+encodeURIComponent(conceptUri)+'&limit='+encodeURIComponent(limit + 1)+'&apikey='+encodeURIComponent(this.apiKey);
        
        if (conceptTypeUris instanceof Array) {
            for (var i=0; i<conceptTypeUris.length; i++) {
                url += '&type='+encodeURIComponent(conceptTypeUris[i]);
            }
        } else if (conceptTypeUris) {
            url += '&type='+encodeURIComponent(conceptTypeUris);
        }
        
        if (sourceUri)
            url += '&product='+encodeURIComponent(sourceUri);

        return this.getUrl(url)
        .then(function(response) {
            if (!response['co-occurrences'])
                return [];

            var concepts = [];
            response['co-occurrences'].forEach(function(concept, i) {
                
                // Ignore occurences of this concept
                if (conceptUri == concept.thing)
                    return;
                
                // Don't return more results than was asked for
                if (concepts.length >= limit)
                    return;

                var c = { name: concept.label,
                          uri: concept.thing,
                          occurrences: parseInt(concept.occurrence),
                          image: ''
                        };

                if (concept.img)
                     c.image = concept.img;

                concepts.push(c);
            });
            this.cacheWrite(cacheId, concepts);
            return concepts;
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
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "getArticlesByConcept" + JSON.stringify({ method: getArticlesByConcept, conceptUris: conceptUris, limit: limit, offset: offset }) ).digest("hex");         
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;

        // Default limit
        if (limit === void(0))
            limit = 10;
        
        // If limit is zero API endpoint fails
        limit = parseInt(limit) || 0;
        if (limit === 0)
            limit = 1;
    
        if (offset === void(0))
            offset = 0;
      
        offset = parseInt(offset) || 0;

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

            var articles = [];
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
                                  image: ''
                                };
                                
                        if (concept['@type'])
                            c.type = this.getParentOntologyClasses('http://dbpedia.org/ontology/'+concept['@type']);

                        if (concept.thumbnail)
                             c.image = concept.thumbnail;

                        if (concept.lat)
                             c.lat = concept.lat;

                        if (concept.long)
                             c.lon = concept.long;

                        a.concepts.push(c);
                    });
                }
                
                articles.push(a);
            });
            this.cacheWrite(cacheId, articles);
            return articles;
        });
    };

    /**
     * Get total number of occurences of a concept, for all articles that have been indexed so far.
     *
     * @param   {String}     conceptUri     A conceptUri string (e.g. "http://dbpedia.org/resource/Europe")
     * @return  {Number}                    Returns the total number of times the concept is mentioned, in all articles that have been indexed.
     */
    this.getConceptOccurrences = function(conceptUri) {
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "getConceptOccurrences" + JSON.stringify({ method: getConceptOccurrences, conceptUri: conceptUri }) ).digest("hex");
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;

        var url = this.semanticNewsApiHost+'/concepts/co-occurrences/?uri='+encodeURIComponent(conceptUri)+'&limit=1'+'&apikey='+encodeURIComponent(this.apiKey);
        return this.getUrl(url)
        .then(function(response) {
            var numberOfOccurences = 0;
            
            if (response['co-occurrences'][0].occurrence)
                numberOfOccurences = response['co-occurrences'][0].occurrence;

            this.cacheWrite(cacheId, numberOfOccurences);
            return numberOfOccurences;
        });
    };
        
    /**
     * Returns the number of occurences for a concept on a given time period.
     *
     * If either startDate or endDate are not specified they will default to today.
     * 
     * @param   {String}    conceptUri      A conceptUri string (e.g. "http://dbpedia.org/resource/Europe")
     * @param   {String}    startDate       A date string in the form "YYYY-MM-DD" (should be BEFORE endDate)
     * @param   {String}    endDate         A date string in the form "YYYY-MM-DD" (should be AFTER startDate)
     * @return  {Array}                     Returns an array of objects from startDate to endDate with the number of occurrences of the concept on each day.
     * @param   {String}   sourceUri        An optional source URI to filter on (e.g. "http://www.bbc.co.uk/ontologies/bbc/SkyNews")
     *
     * e.g.[ { date: "2014-05-12", value: 5 }, { date: "2014-05-13", value: 6 } ]
     */
    this.getConceptOccurrencesOverTime = function(conceptUri, startDate, endDate, sourceUri) {
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "getConceptOccurrencesOverTime" + JSON.stringify({ method: getConceptOccurrencesOverTime, conceptUri: conceptUri, startDate: startDate, endDate: endDate, sourceUri: sourceUri }) ).digest("hex");         
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;
            
        var promises = [];

        if (!startDate)
            startDate = moment().format('YYYY-MM-DD');

        if (!endDate)
            endDate = moment().format('YYYY-MM-DD');

        var dates = [];
        if (startDate == endDate) {
            dates.push(startDate);
        } else {
            // Limits requests to last year, maximum
            for (var i = 0; i < 365; i++) {
                var date = moment(startDate, 'YYYY-MM-DD').add(i, 'days').format('YYYY-MM-DD');
                if (date == endDate)
                    break;
                dates.push(date);
            }
       }
        
        var result = {};
        dates.forEach(function(date) {
            var after = date;
            var before = moment(date, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
            var url = this.semanticNewsApiHost+'/concepts/co-occurrences/?uri='+encodeURIComponent(conceptUri)+'&after='+after+'&before='+before+'&limit=1'+'&apikey='+encodeURIComponent(this.apiKey);
            
            if (sourceUri)
                url += '&product='+encodeURIComponent(sourceUri);
            
            var promise = this.getUrl(url)
            .then(function(response) {
                if (response['co-occurrences'] && response['co-occurrences'][0].occurrence) {
                    return { date: date, value: parseInt(response['co-occurrences'][0].occurrence) };
                } else {
                    return { date: date, value: 0 };
                }
            });
            promises.push(promise);
        });
        
        Q.all(promises)
        .then(function(occurences) {
            this.cacheWrite(cacheId, occurences);
        });
        
        return Q.all(promises);
    };

    /**
     * Search articles in the Juicer directly using keywords (not Linked Data)
     *
     * CAUTION! This method is new and experimental!
     *
     * @param   {String}    keywords        A list of keywords to search for
     * @param   {String}    publishedAfter  A date string in the form "YYYY-MM-DD" (should be BEFORE publishedBefore)
     * @param   {String}    publishedBefore A date string in the form "YYYY-MM-DD" (should be AFTER publishedAfter)
     * @return  {Array}                     Returns an array of article objects (with URLs, titles, descriptions, concepts mentioned in the article and other properties)
     *
     * @todo Add support for specifying sources, pagination, and other options.
     */
    this.searchArticles = function(keywords, publishedAfter, publishedBefore) {
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "searchArticles" + JSON.stringify({ keywords: keywords, publishedAfter: publishedAfter, publishedBefore: publishedBefore }) ).digest("hex");
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;

        var url = this.juicerApiHost+"/articles.json?content_format[]=TextualFormat&text="+encodeURIComponent(keywords)+'&apikey='+encodeURIComponent(this.apiKey);

        if (publishedAfter)
            url += "&published_after="+publishedAfter;

        if (publishedBefore)
            url += "&published_before="+publishedBefore;

        // For now only returnign results from the following sources
        url += "&product[]=NewsWeb";
        url += "&product[]=TheGuardian";
        url += "&product[]=TheMirror";
        url += "&product[]=TheIndependent";
        url += "&product[]=ExpressStar";
        url += "&product[]=TheHuffingtonPost";
        url += "&product[]=DailyRecord";
        url += "&product[]=SkyNews";
        url += "&product[]=STV";
        
        return this.getUrl(url)
        .then(function(response) {
            var articles = response.articles;
            articles.forEach(function(article, i) {
                article.id = article.cps_id;
                delete article.cps_id;
            }); 
            this.cacheWrite(cacheId, articles);
            return articles;
        });
    };
    
    /**
     * Get articles similar to an existing article
     *
     * CAUTION! This method is new and experimental!
     *
     * @param   {String}    articleId       The ID of an article you want to find similar articles to (usually labelled the 'id' or 'cps_id' property)
     * @return  {Array}                     Returns an array of similar article objects (with URLs, titles and a relevancy score)
     */
    this.getSimilarArticles = function(articleId) {
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "getSimilarArticles" + JSON.stringify({ articleId: articleId }) ).digest("hex");
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;

        var url = this.juicerApiHost+"/articles/"+encodeURIComponent(articleId)+'/similar.json?apikey='+encodeURIComponent(this.apiKey);
        return this.getUrl(url)
        .then(function(response) {
            var articles = response.results;
            articles.forEach(function(article, i) {
                article.id = article.cps_id;
                delete article.cps_id;
            }); 
            this.cacheWrite(cacheId, articles);
            return articles;
        });
    };
    
    
    /**
     * Get articles similar to an existing article
     *
     * CAUTION! This method is new and experimental!
     *
     * @param   {String}    text    A blob of text to use as the source to find articles that are similar.
     * @return  {Array}             Returns an array of similar article objects (with URLs, titles and a relevancy score)
     */
    this.getSimilarArticlesFromText = function(text) {
         "use webservice";
         
        var cacheId = crypto.createHash('sha1').update( "getSimilarArticlesTo" + JSON.stringify({ text: text }) ).digest("hex");
        var cacheValue = this.cacheRead(cacheId);
        if (cacheValue !== false)
            return cacheValue;

        var url = this.juicerApiHost+"/similar_to.json?format=json&apikey="+encodeURIComponent(this.apiKey);
        return this.postJson(url, { 'like_text': text })
        .then(function(response) {
            var articles = response.results;
            articles.forEach(function(article, i) {
                article.id = article.cps_id;
                delete article.cps_id;
            }); 
            this.cacheWrite(cacheId, articles);
            return articles;
        });
    };

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
        request(url, function(error, response, body) {
            if (error || response.statusCode != "200") {
                deferred.resolve({});
            } else {
                deferred.resolve(JSON.parse(body));
            }
        });
        return deferred.promise;
    };
    
    this.postForm = function(url, postData, callback) {
        var deferred = Q.defer();
        
        var params = { url: url };
    
        // Handles postData as an object of params: values or a text blob.
        if (typeof(postData) === 'object') {
            params.headers = {'content-type': 'application/x-www-form-urlencoded'};
            params.form = postData;
        } else{
            params.body = postData;
        }
        
        request.post(params, function(error, response, body) {
            if (error || response.statusCode != "200") {
                deferred.resolve({});
            } else {
                deferred.resolve(JSON.parse(body));
            }
        });
        return deferred.promise;
    };
    
    
    this.postJson = function(url, postData, callback) {
        var deferred = Q.defer();
        
        var params = {  url: url,
                        body: JSON.stringify(postData)
                    };

        request.post(params, function(error, response, body) {
            if (error || response.statusCode != "200") {
                deferred.resolve({});
            } else {
                deferred.resolve(JSON.parse(body));
            }
        });
        return deferred.promise;
    };


    this.cacheRead = function(id) {
        if (this.cacheReadEnabled === false || this.cache === false)
            return false;

        var cacheResponse = this.cache.get(id);
        if (Object.getOwnPropertyNames(cacheResponse).length == 0)
            return false;

        // Return response as promise so it can be easily returned from funtions
        var deferred = Q.defer();
        deferred.resolve(cacheResponse[id]);
        return deferred.promise;
    };
    
    this.cacheWrite = function(id, data) {
        if (this.cacheWriteEnabled === false || this.cache === false)
            return true;

        return this.cache.set(id, data);
    };

    return this;

})();