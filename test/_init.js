var assert = require("assert");

describe('Should be able to load config file to run tests', function(){
    var config = require(__dirname+'/config.json');
    
    it('Config should contain API Key as a string', function(){
        assert.equal(typeof(config.bbcNewsLabs.apiKey), 'string');
    });
    
    it('API key should not be empty', function(){
        assert.equal(true, (config.bbcNewsLabs.apiKey.length > 0));
    });
});