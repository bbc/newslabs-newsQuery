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
    /* Example response...
    [ { name: 'Wayne Rooney',
        uri: 'http://dbpedia.org/resource/Wayne_Rooney',
        type: 'soccer player',
        typeUri: 'http://dbpedia.org/ontology/SoccerPlayer',
        thumbnail: 'http://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Rooney_CL.jpg/200px-Rooney_CL.jpg' },
      { name: 'Mickey Rooney',
        uri: 'http://dbpedia.org/resource/Mickey_Rooney',
        type: 'person',
        typeUri: 'http://dbpedia.org/ontology/Person',
        thumbnail: 'http://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mickey_Rooney_still.jpg/200px-Mickey_Rooney_still.jpg' } ... ]
    */
});
```

### getConceptsByType()

Lookup companies with the name "Apple" in them:

Note: Will include "Apple Records" (type Record Label) as well as "Apple Computer" (type Company) as "Record Label" is a subclass of "Company".

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConceptsByType("Apple", ["http://dbpedia.org/ontology/Company"], 5)
.then(function(concepts) {
    console.log(concepts);
});
```
Lookup people in the UK active in politics called "Cameron":

Note: Will include non-UK Politicians, as some UK politicians are merely tagged "Politician" rather than specifically as "MemberOfParliament" or "OfficeHolder". "OfficeHolder" also includes some people who may not technically be politicians (e.g. "Samantha Cameron").

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConceptsByType("Cameron", ["http://dbpedia.org/ontology/MemberOfParliament", "http://dbpedia.org/ontology/Politician" ,"http://dbpedia.org/ontology/OfficeHolder"], 5)
.then(function(concepts) {
    console.log(concepts);
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
    /* Example response...
    [ { primaryContentOf: 'http://www.bbc.co.uk/news/world-europe-27310008',
        subject: 'Europe',
        '@type': 'NewsItem',
        tag: { '@set': [Object] },
        primaryFormat: { '@id': 'http://www.bbc.co.uk/ontologies/creativework/TextualFormat' },
        primaryTopicOf: 'http://www.bbc.co.uk/news/world-europe',
        product: { '@id': 'http://www.bbc.co.uk/ontologies/bbc/NewsWeb' },
        title: 'Everything you wanted to know about Europe but were afraid to ask',
        description: 'Ahead of the elections for the European Parliament later this month, BBC Newsnight wants to hear your questions on all things EU.',
        dateCreated: '2014-05-08T16:45:51Z',
        '@id': 'http://www.bbc.co.uk/news/world-europe-27310008',
        mentions: { '@set': [Object] },
        identifier: '27310008' },
      { primaryContentOf: 'http://www.huffingtonpost.co.uk/2014/05/08/ukip-leaflets-eastern-europeans-cheap_n_5288745.html?utm_hp_ref=uk&ir=UK',
        subject: 'UK - The Huffington Post',
        '@type': 'NewsItem',
        tag: { '@set': [Object] },
        primaryFormat: { '@id': 'http://www.bbc.co.uk/ontologies/creativework/TextualFormat' },
        product: { '@id': 'http://www.bbc.co.uk/ontologies/bbc/TheHuffingtonPost' },
        title: 'Ukip Paid Eastern Europeans To Give Out Leaflets As \'They\'re Cheapest\'',
        thumbnail: 'http://i.huffpost.com/gen/1780944/thumbs/s-FARAGE-POSTER-mini.jpg',
        description: 'Ukip  has defended their decision to employ Eastern Europeans to distribute election leaflets, despite the party regularly warning that EU migrants threaten British jobs, as the firm offered "the cheapest possible price".  \nOn Wednesday, the Huffington Post UK revealed that Ukip had used a door-to-door distribution firm, which employed Eastern Europeans to hand out the party\'s leaflets. \nAndrew Spalis, distribution operative at  door-to-door distribution firm Fast Leaflet , told HuffPostUK th...',
        dateCreated: '2014-05-08T16:23:26Z',
        '@id': 'http://www.huffingtonpost.co.uk/2014/05/08/ukip-leaflets-eastern-europeans-cheap_n_5288745.html?utm_hp_ref=uk&ir=UK',
        mentions: { '@set': [Object] },
        identifier: 'the_huffington_post_b187153f19eea9790e90ae8e1efc25c09860eb6b' } ... ]
    */
});
```