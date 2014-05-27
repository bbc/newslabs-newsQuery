newsQuery
=========

The newsQuery module provides easy-to-consume access to the BBC News Labs APIs.

The APIs let you query a database of 40+ news sources, including content from the BBC but also other publications including The Guardian, The Mirror, The Huffington Post and others.

The majority of our content is articles but we also have images, video and tweets from a select range of sources.

The BBC News Labs API's are experimental and are cheifly intended for use by R&D teams in news orgs and in universities. If you'd like to more more or have any feedback about them, you can get in touch with @BBC_News_Labs on Twitter.

**Important!** To use this library you must have a BBC News Labs API key (which is free). See instructions below for how to do this.

### How to get an API key

You can obtain an API key from the BBC Developer Portal
http://bbc.apiportal.apigee.com

Registration is free and immediate, you will receive an automated email when you sign up, which contains a link to activate your account. Check your junk mail folder if you can't find it.

1. After registering, create a new application.
2. Select both the "bbcrd-newslabs-apis-product" and "bbcrd-juicer-apis-product" APIs for your application.
3. Your API key will be listed as the "Consumer Key" for your application.

## Additional documentation

You can find full information about how the BBC News Labs semantic APIs work on the #newsHACK site:

The semantic News Labs API:
http://newshack.co.uk/newshack-ii/newslabs-apis/

The News Juicer API:
http://newshack.co.uk/newshack-ii/juicer-apis/

## Usage with examples

### getConcepts()

You need to get a definative URI for a concept before you can search for articles that mention it.

A concept is typically a person, place, organisation or theme (e.g. "law", "economics"). These correspond to entries in dbpedia, which uses an ontology derived from data in Wikipedia.

An example that returns the first 5 concepts matching the term "Rooney":

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConcepts("Rooney", 5)
.then(function(concepts) {
    console.log(concepts);
});
```

The response from getConcepts() is an array of concepts, each with a unique URI (and possibly an image).

Note in the example below 'Wayne Rooney' is a SoccerPlayer, and SoccerPlayers are Atheletes, and Atheletess are People.

Mickey Rooney is classed as a Person, although it has not specifically identified him as an Actor - the granularity of the specificify may vary from concept to concept.

NB: 'Agent', which is as the last type for both, is simply a top level ontology class associated with all People and Organisations (and does not refer to being sports or acting agent). In this context an 'Agent' is a thing that acts in the world, for example, as distinct from something that is an Activity or a Place.

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

If you have the definative URI for a concept you can use it's URI to request detailed information about a concept, such as a description and it's type.

e.g. You can check the "type" field to see if it's categorized as a Person, Place, Organisation, etc (you can also check for more specific types, like SoccerPlayer or Company).

Note that calling getConcept() explicitly on a URI may return more specific type information than is returned along with a concept in other calls, such as getArticlesByConcept().

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConcept("http://dbpedia.org/resource/David_Cameron", 1)
.then(function(concept) {
    console.log(concept);
});
```

The response is a single object, with a description of it

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
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getCoOccuringConcepts("http://dbpedia.org/resource/Ukraine", 5)
.then(function(concepts) {
    console.log(concepts);
});
```

The response from getCoOccuringConcepts() is an array of concepts, returned in order of how many co-occurences there are between the concepts.

i.e. how much times both concepts have been mentioned in the same article, tagged in one image, mentioned in a video, etc.

``` javascript
[ { name: 'Russia',
    uri: 'http://dbpedia.org/resource/Russia',
    occurrences: 9530,
    image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/200px-Flag_of_Russia.svg.png' 
  }
]
```

### getArticlesByConcept()

Once you have the URI for a concept, you can use it to find news articles mentioning it. You can specify a single concept URI or an array of URIs.

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getArticlesByConcept(["http://dbpedia.org/resource/David_Cameron"], 5)
.then(function(articles) {
    console.log(articles);
});
```

Example response from getArticlesByConcept() is shown below.

Note that the response includes quite high level type information for each concept, but it does return the latitude and longitude values for concepts that are identified as places.

This is an example of slightly inconsistent behaviour between function calls - as lat/lon values are not returned for Places by a other calls - but is something being looked at to see if we can improve.

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

You can query how many occurences there are for a given concept between a series of dates, the startDate and endDate can be up to a year apart.

If you don't specify a startDate or an endDate (both should be strings in the form 'YYYY-MM-DD') then the current date will be used for either value.

Tip: If you're looking for a great date handling library, check out moment

``` javascript
var apiKey = '1234567890ABCDEF';
var newsQuery = require('newsquery')(apiKey);
newsQuery.getConceptOccurrencesOverTime("http://dbpedia.org/resource/Ukraine", "2014-05-24", "2014-05-28")
.then(function(articles) {
    console.log(articles);
});
```

The response from getConceptOccurrencesOverTime() is an array of objects with 'date' and 'value' keys. This is particularly useful if you want to pass the array directly to something like D3 to graph the results.

``` javascript
[ { date: '2014-05-24', value: 5 },
  { date: '2014-05-25', value: 13 },
  { date: '2014-05-26', value: 28 },
  { date: '2014-05-27', value: 17 },
  { date: '2014-05-28', value: 9 } ]
```
