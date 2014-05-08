newsQuery
=========

The newsQuery module provides access to the BBC News Labs APIs.

To access these APIs (and so, to use this library) you must have signed up for an API key and selected to use both "bbcrd-newslabs-apis-product" and "bbcrd-juicer-apis-product" for your application:

http://bbc.apiportal.apigee.com

Initially this is a very limited implementation; an MVP that exposes the most useful core functionality, with the intent to extend it over time.

## API documentation

You can find full information about the underlying APIs this module uses on the #newsHACK site.

The semantic News Labs API:
http://newshack.co.uk/newshack-ii/newslabs-apis/

The News Juicer API:
http://newshack.co.uk/newshack-ii/juicer-apis/

## Example usage

### getConcepts()

Looking up concepts with "Rooney" in them (free text search for concepts):

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConcepts("Rooney", 5)
.then(function(concepts) {
    console.log(concepts);
});
```

### getConceptsByType()

Lookup companies with the name "Apple" in them:

Note: Will include "Apple Records" (type Record Label) as well as "Apple Computer" (type Company) as "Record Label" is a subclass of "Company".

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConceptsByType("Apple", ["http://dbpedia.org/ontology/Company"], 5)
.then(function(response) {
    console.log(concepts);
});
```
Lookup people in the UK active in politics called "Cameron":

Note: Will include non-UK Politicians, as some UK politicians are merely tagged "Politician" rather than specifically as "MemberOfParliament" or "OfficeHolder". "OfficeHolder" also includes some people who may not technically be politicians (e.g. "Samantha Cameron").

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConceptsByType("Cameron", ["http://dbpedia.org/ontology/MemberOfParliament", "http://dbpedia.org/ontology/Politician" ,"http://dbpedia.org/ontology/OfficeHolder"], 5)
.then(function(people) {
    console.log(response);
});
```

### getArticlesByConcept()

Get articles tagged "Europe":

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getArticlesByConcept(["http://dbpedia.org/resource/Europe"], 10)
.then(function(articles) {
    console.log(articles);
});
```