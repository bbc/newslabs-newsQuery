// var config = require(__dirname+'/test/config.json');
// var newsquery = require(__dirname+'/lib/newsquery')(config.bbcNewsLabs.apiKey);
//
// console.log("wat");
// newsquery.searchArticles("Medical Innovation Bill")
// .then(function(articles) {
//     console.log("wat 2");
//     console.log( JSON.stringify(articles) );
//     response = articles;
//     done();
// });

var request = require('request');
var url = 'http://data.bbc.co.uk/bbcrd-juicer/articles.json?content_format[]=TextualFormat&text=Medical%20Innovation%20Bill&apikey=9OHbOpZpVh9tQZBDjwTlTmsCF2Ce0yGQ&published_after=2014-03-17&product[]=NewsWeb&product[]=TheGuardian&product[]=TheMirror&product[]=TheIndependent&product[]=ExpressStar&product[]=TheHuffingtonPost&product[]=DailyRecord&product[]=SkyNews&product[]=STV';

request(url, function (error, response, body) {
    console.log("requestback");
    if (error || response.statusCode != "200") {
        console.log("error");
        console.log(error);
        console.log(response.statusCode );
    } else {
        console.log("response");
        //JSON.parse(body)
    }
});