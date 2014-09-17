var assert = require("assert");

describe('The environment variable NEWSQUERY_API_KEY should be set in order to run tests', function() {
    it('NEWSQUERY_API_KEY environment variable should be specified', function() {
        assert.equal((process.env.NEWSQUERY_API_KEY.length > 0), true);
    });
});