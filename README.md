#newsQuery - API for the BBC News Labs Juicer 

[![NPM version](https://badge.fury.io/js/newsquery.svg)](http://badge.fury.io/js/newsquery) [![Build Status](https://travis-ci.org/BBC-News-Labs/newsQuery.svg?branch=master)](https://travis-ci.org/BBC-News-Labs/newsQuery)

The BBC News Labs Juicer API let you run queries on content from an increasing list of over news sources which includes BBC News but also other publications like Sky News, The Guardian, The Mirror, The Independent, The Daily Record, The Huffington Post and other media. It also includes content from other sources, including the BBC News and BBC Parliament TV channels and MP's Twitter accounts. 

The majority of content is in the form of articles from news organisations but there are also images, video and tweets from select sources.

Data about content from other sources - including the BBC News video and image archives - is also held in the Juicer but is not be avalible outside of the BBC network. This content will not normally be surfaced when using this library.

The APIs exposed by this library include an interface to an Elastic Search powered database and our Triplestore Semantic Data platform.

We get our Linked Data concepts (aka tags) from DBPedia.org, which in turn is derived from Wikipedia data. You can see an example of how this entity extraction works at:

http://dbpedia-spotlight.github.io/demo/

The tagging is fully automated and consequently isn't 100% accurate.

### Disclaimer

The Juicer is not a production system or an offical BBC production service; it's an experimental platform for research and development - availability or suitability for any particular purpose is not guaranteed.

This API may be suspended, changed or disabled without prior notice at any time. The API evolves and changes over time and should not be considered stable!

The BBC News Labs Juicer API is are **experimental** and are chiefly intended for use by R&D teams in news organisations and universities. If you'd like to more more or have any feedback about them, please get in touch with @BBC_News_Labs via Twitter.

## Usage with examples

### getSources()

You can get a list of sources the Semantic API knows about with `getSources()`:

``` javascript
var newsQuery = require('newsquery');
newsQuery.getSources()
.then(function(sources) {
    console.log(sources);
});
```

The response is an array of objects with `name` and `uri` properties:

``` javascript
[ { name: 'Sky News',
    uri: 'http://www.bbc.co.uk/ontologies/bbc/SkyNews'
  },
  { name: 'The Guardian',
    uri: 'http://www.bbc.co.uk/ontologies/bbc/TheGuardian'
  } ...
 ]
 ```

### searchArticles()

A simple query to get started is to search articles using a keyword search.

This doesn't actually invoke the BBC News Labs Linked Data platform directly (instead it triggers calls to an Elastic Search powered endpoint), but does return articles along with entities which you can use in Linked Data queries.

``` javascript
newsQuery.searchArticles("Ukraine Russia")
.then(function(articles) {
  console.log(articles);
});
```

The response for a matching query will return  articles, with titles, descriptions, the organisation that published it, the URL for the article and a list of concepts the article was tagged with (including the URI's for each concept, what type of object the concept is and the "confidence score" for each concept that the article has been tagged with).

You can optionally specify a date range if you are only interested in articles published on or around specific date:

``` javascript
newsQuery.searchArticles("Syria", "2014-09-01", "2014-09-07")
.then(function(articles) {
  console.log(articles);
});
```

You can use the ID for the article and one of the additional queries API calls documented to pull back full data (tags, summary, etc.) for the article.

Note that unlike the other API endpoints only text articles (not images or video) from the following sources are currently returned by this method:

 * BBC News (currently displayed as "NewsWeb")
 * The Guardian
 * The Mirror
 * The Independent
 * Express & Star
 * The Huffington Post
 * Daily Record
 * Sky News
 * STV

### getSimilarArticles()

If you have an article ID from any of the searches or calls below you can search for other, similar article using getSimilarArticles().

``` javascript
newsQuery.getSimilarArticles("25663926")
.then(function(articles) {
    console.log(articles);
});
```
The article ID value usually the property labeled `id` or `cps_id` and is a string (in some cases it might look like an integer but that's not true for all cases, so it should be treated like a string).

### getSimilarArticlesFromText()

If you have an article from an external source you can search for articles from other publications that are similar to the article you already have):

``` javascript
newsQuery.getSimilarArticlesFromText("This is a long body of text...")
.then(function(articles) {
    console.log(articles);
});
```

### getConcepts()

You need to get a definitive URI for a concept before you can search the BBC News Labs Linked Data platform for articles that mention that concept.

A concept is typically a person, place, organisation or theme (e.g. "law", "economics", "gravity", "policy"). These correspond to entries in dbpedia, which uses an ontology derived from data in Wikipedia.

An example that returns the first 5 concepts matching the term "Rooney":

``` javascript
newsQuery.getConcepts("Rooney", 5)
.then(function(concepts) {
    console.log(concepts);
});
```

The response from getConcepts() is an array of concepts, each with a unique URI (and possibly an image).

Note in the example below 'Wayne Rooney' is a SoccerPlayer, and SoccerPlayers are Athletes, and Athletes are People.

Mickey Rooney is classed as a Person, although it has not specifically identified him as an Actor - the granularity of the specificity may vary from concept to concept.

NB: An 'Agent', which is as the last type for both, is simply a top level ontology class associated with all People and Organisations (and does not refer to an individial as being sports or acting agent). In this context an 'Agent' is a thing that acts in the world, for example, as distinct from something that is an Activity or a Place.

``` javascript
[ { name: 'Wayne Rooney',
    uri: 'http://dbpedia.org/resource/Wayne_Rooney',
    image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Rooney_CL.jpg/200px-Rooney_CL.jpg',
    type: 
     [ 'http://dbpedia.org/ontology/SoccerPlayer',
       'http://dbpedia.org/ontology/Athlete',
       'http://dbpedia.org/ontology/Person',
       'http://dbpedia.org/ontology/Agent' ] },
  { name: 'Mickey Rooney',
    uri: 'http://dbpedia.org/resource/Mickey_Rooney',
    image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mickey_Rooney_still.jpg/200px-Mickey_Rooney_still.jpg',
    type: 
     [ 'http://dbpedia.org/ontology/Person',
       'http://dbpedia.org/ontology/Agent' ] }
]
````

### getConcept()

If you have the definitive URI for a concept you can use it's URI to request detailed information about a concept, such as a description and it's type.

e.g. You can check the "type" field to see if it's categorized as a Person, Place, Organisation, etc (you can also check for more specific types, like SoccerPlayer or Company).

Note that calling getConcept() explicitly on a URI may return more specific type information than is returned along with a concept in other calls, such as getArticlesByConcept().

``` javascript
newsQuery.getConcept("http://dbpedia.org/resource/David_Cameron", 1)
.then(function(concept) {
    console.log(concept);
});
```

The response is a single object, with a description and additional metadata, typically an image, and at least one article about the subject (you can specify more via the second parameter to the function).

``` javascript
 { description: 'David William Donald Cameron is the Prime Minister of the United Kingdom, First Lord of the Treasury, Minister for the Civil Service and Leader of the Conservative Party. He represents Witney as its Member of Parliament (MP). Cameron studied Philosophy, Politics and Economics (PPE) at Oxford, gaining a first class honours degree. He then joined the Conservative Research Department and became Special Adviser to Norman Lamont, and then to Michael Howard.',
  articles: 
   [ { product: 'http://www.bbc.co.uk/ontologies/bbc/IrishIndependant',
       summary: 'The UK Independence Party has stormed to victory in the European elections and unleashing a political whirlwind in Britain.',
       title: 'Farage throws down gauntlet as Ukip unleashes whirlwind',
       article: 'http://www.independent.ie/world-news/europe/farage-throws-down-gauntlet-as-ukip-unleashes-whirlwind-30306752.html',
       cpsid: 'irish_independant_7ddba5bc3c79dca7f45714c782c73e61625d8b85',
       published: '2014-05-27T01:30:00Z' } ]
  thumbnail: 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Official-photo-cameron.png/200px-Official-photo-cameron.png',
  name: 'David Cameron',
  type: 
   [ 'http://dbpedia.org/ontology/OfficeHolder',
     'http://dbpedia.org/ontology/Person',
     'http://dbpedia.org/ontology/Agent' ],
  uri: 'http://dbpedia.org/resource/David_Cameron' }
```

### getCoOccuringConcepts()

You can fetch concepts that - by being linked through news articles - are linked to a given concept. For example, to get concepts related to "Ukraine":

``` javascript
newsQuery.getCoOccuringConcepts("http://dbpedia.org/resource/Ukraine")
.then(function(concepts) {
    console.log(concepts);
});
```

The response from getCoOccuringConcepts() is an array of concepts, returned in order of how many co-occurrences there are between the concepts.

i.e. how much times both concepts have been mentioned in the same article, tagged in one image, mentioned in a video, etc.

``` javascript
[ { name: 'Russia',
    uri: 'http://dbpedia.org/resource/Russia',
    occurrences: 9530,
    image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/200px-Flag_of_Russia.svg.png' 
  }
]
```


You can also optionally specify:

- A limit on the number of results
- The URI one or more `types` (as a string, or array of strings) of object to get (e.g. "http://www.bbc.co.uk/ontologies/bbc/Person", "http://www.bbc.co.uk/ontologies/bbc/Company" etc.)
- The URI of a specific source you want to filter on (e.g. http://www.bbc.co.uk/ontologies/bbc/SkyNews)

For example the following query would return the top 10 people Sky News mentioned in stories that related to the Ukraine.

``` javascript
newsQuery.getCoOccuringConcepts("http://dbpedia.org/resource/Ukraine",
                                10,
                                "http://www.bbc.co.uk/ontologies/bbc/Person"
                                "http://www.bbc.co.uk/ontologies/bbc/SkyNews")
.then(function(concepts) {
    console.log(concepts);
});
```

### getArticlesByConcept()

Once you have the URI for a concept, you can use it to find news articles mentioning it. You can specify a single concept URI or an array of URIs.

``` javascript
newsQuery.getArticlesByConcept(["http://dbpedia.org/resource/David_Cameron"], 5)
.then(function(articles) {
    console.log(articles);
});
```

Example response from getArticlesByConcept() is shown below.

Note that the response includes quite high level type information for each concept, but it does return the latitude and longitude values for concepts that are identified as places.

This is an example of slightly inconsistent behaviour between function calls - as lat/lon values are not returned for Places by any other calls. This is something we are looking at to see if we can improve.

``` javascript
[ 
  { id: 'the_huffington_post_a819bb600f1a3c9d11a2a635e528f972ab241751',
    source: 'http://www.bbc.co.uk/ontologies/bbc/TheHuffingtonPost',
    url: 'http://www.huffingtonpost.co.uk/2014/05/27/tony-blair-defends-eu-immigration_n_5396082.html?utm_hp_ref=uk&ir=UK',
    dateCreated: '2014-05-27T11:49:15Z',
    title: 'Tony Blair Defends Immigration And EU, Says Ukip \'Do Not Have All The Answers\'',
    description: 'Tony Blair  has moved to unite the left against Ukip in his strongest attack yet against Nigel Farage and the eurosceptic party.  \n \nThe former prime minister, who is still reviled by many left-wingers over his decision to invade Iraq in 2003, said Ukip did "not have all the answers" and should be exposed for having "no actual solutions to the problems of the 21st century". \n \nBlair, 61, told BBC Radio 4\'s Today programme that blaming immigrants for problems is a "backwards and regressive ste...',
    image: 'http://i.huffpost.com/gen/1818157/thumbs/o-TONY-BLAIR-570.jpg',
    concepts: 
     [ { name: 'Brussels',
         uri: 'http://dbpedia.org/resource/Brussels',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/TE-Collage_Brussels.png/200px-TE-Collage_Brussels.png',
         type: [ 'http://dbpedia.org/ontology/Place' ],
         lat: '50.85',
         lon: '4.35' },
       { name: 'David Cameron',
         uri: 'http://dbpedia.org/resource/David_Cameron',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Official-photo-cameron.png/200px-Official-photo-cameron.png',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Great Britain',
         uri: 'http://dbpedia.org/resource/Great_Britain',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Satellite_image_of_Great_Britain_and_Northern_Ireland_in_April_2002.jpg/200px-Satellite_image_of_Great_Britain_and_Northern_Ireland_in_April_2002.jpg',
         type: [ 'http://dbpedia.org/ontology/Place' ],
         lat: '53.826',
         lon: '-2.422' },
       { name: 'BBC Radio 4',
         uri: 'http://dbpedia.org/resource/BBC_Radio_4',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/5/53/BBC_Radio_4.svg/200px-BBC_Radio_4.svg.png',
         type: 
          [ 'http://dbpedia.org/ontology/Organisation',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Ed Miliband',
         uri: 'http://dbpedia.org/resource/Ed_Miliband',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Ed_Miliband_on_August_27,_2010_cropped-an_less_red-2.jpg/200px-Ed_Miliband_on_August_27,_2010_cropped-an_less_red-2.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Nick Clegg',
         uri: 'http://dbpedia.org/resource/Nick_Clegg',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/6/68/NickClegg_worldeconomic.jpg/200px-NickClegg_worldeconomic.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Alan Milburn',
         uri: 'http://dbpedia.org/resource/Alan_Milburn',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Alan_Milburn.JPG/200px-Alan_Milburn.JPG',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Israeli Labor Party',
         uri: 'http://dbpedia.org/resource/Israeli_Labor_Party',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Labor_(Israel)_logo.png/200px-Labor_(Israel)_logo.png',
         type: 
          [ 'http://dbpedia.org/ontology/Organisation',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Iraq',
         uri: 'http://dbpedia.org/resource/Iraq',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_Iraq.svg/200px-Flag_of_Iraq.svg.png',
         type: [ 'http://dbpedia.org/ontology/Place' ],
         lat: '33.333333333333336',
         lon: '44.43333333333333' },
       { name: 'Tony Blair',
         uri: 'http://dbpedia.org/resource/Tony_Blair',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/WORLD_ECONOMIC_FORUM_ANNUAL_MEETING_2009_-_Tony_Blair.jpg/200px-WORLD_ECONOMIC_FORUM_ANNUAL_MEETING_2009_-_Tony_Blair.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Nigel Farage',
         uri: 'http://dbpedia.org/resource/Nigel_Farage',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Nigel_Farage.jpg/200px-Nigel_Farage.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Diane Abbott',
         uri: 'http://dbpedia.org/resource/Diane_Abbott',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Diane_Abbott,_New_Statesman_hustings,_trimmed.jpg/200px-Diane_Abbott,_New_Statesman_hustings,_trimmed.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'UK Independence Party',
         uri: 'http://dbpedia.org/resource/UK_Independence_Party',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/UKIP_logo.png/200px-UKIP_logo.png',
         type: 
          [ 'http://dbpedia.org/ontology/Organisation',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'The Huffington Post',
         uri: 'http://dbpedia.org/resource/The_Huffington_Post',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Huffington_Post.jpg/200px-Huffington_Post.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Organisation',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Europe',
         uri: 'http://dbpedia.org/resource/Europe',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Europe_orthographic_Caucasus_Urals_boundary.svg/200px-Europe_orthographic_Caucasus_Urals_boundary.svg.png',
         type: [ 'http://dbpedia.org/ontology/Place' ] },
       { name: 'Conservative Party (UK)',
         uri: 'http://dbpedia.org/resource/Conservative_Party_(UK)',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Conservative_logo_2006.svg/200px-Conservative_logo_2006.svg.png',
         type: 
          [ 'http://dbpedia.org/ontology/Organisation',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Labour Party (UK)',
         uri: 'http://dbpedia.org/resource/Labour_Party_(UK)',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_Labour_Party.svg/200px-Logo_Labour_Party.svg.png',
         type: 
          [ 'http://dbpedia.org/ontology/Organisation',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'John Hutton, Baron Hutton of Furness',
         uri: 'http://dbpedia.org/resource/John_Hutton,_Baron_Hutton_of_Furness',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Msc_2009-Sunday,_11.00_-_12.30_Uhr-Zwez_005_Hutton_detail.jpg/200px-Msc_2009-Sunday,_11.00_-_12.30_Uhr-Zwez_005_Hutton_detail.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] },
       { name: 'Owen Jones (writer)',
         uri: 'http://dbpedia.org/resource/Owen_Jones_(writer)',
         image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/OwenJones.jpg/200px-OwenJones.jpg',
         type: 
          [ 'http://dbpedia.org/ontology/Person',
            'http://dbpedia.org/ontology/Agent' ] } ]
  }
]
```

### getConceptOccurrencesOverTime()

You can query how many occurrences there are for a given concept between a series of dates, the startDate and endDate can be up to a year apart.

If you don't specify a startDate or an endDate (both should be strings in the form 'YYYY-MM-DD') then the current date will be used for either value.

``` javascript
newsQuery.getConceptOccurrencesOverTime("http://dbpedia.org/resource/Ukraine", "2014-05-24", "2014-05-28")
.then(function(occurrences) {
    console.log(occurrences);
});
```

The response from getConceptOccurrencesOverTime() is an array of objects with 'date' and 'value' keys, in order of oldest to most recent.

``` javascript
[ { date: '2014-05-24', value: 5 },
  { date: '2014-05-25', value: 13 },
  { date: '2014-05-26', value: 28 },
  { date: '2014-05-27', value: 17 },
  { date: '2014-05-28', value: 9 } ]
```

If you want to filter by a specific source, you can specify a source URI - from the list returned by `getSources()` - as an optional 4th parameter.

The below example shows how to get the number of articles related to Russia that appeared in The Guardian in the last 7 days:

``` javascript
var moment = require("moment");

newsQuery.getConceptOccurrencesOverTime(
    "http://dbpedia.org/resource/Russia",
    moment().subtract(7,'days').format('YYYY-MM-DD'),
    moment().format('YYYY-MM-DD'),
    "http://www.bbc.co.uk/ontologies/bbc/TheGuardian")
.then(function(occurrences) {
    console.log(occurrences);
});
```

Note: You can request dates up to a year apart. The bulk of the data goes back over 6 months, we are still in the progress of adding sources.

## Additional documentation

You can find full information about how the raw BBC News Labs Juicer APIs work on the #newsHACK site:

The Semantic News Labs API:
http://newshack.co.uk/newshack-ii/newslabs-apis/

The News Juicer API:
http://newshack.co.uk/newshack-ii/juicer-apis/

Note that the formats of the responses may differ if using the raw APIs, this module attempts to simplify them to make them easier to consume.

## Contributing

Pull requests, feature requests and bug reports are welcome!

### Running tests

To run tests just run `npm test`:

    > npm test
