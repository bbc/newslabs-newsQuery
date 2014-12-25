/*
 * This test is named with an underscore so it's run first.
 *
 * You'll neet to set NEWSQUERY_API_KEY environment variable to run these tests.
 * You can then run them with `npm test`.
 *
 * Example usage:
 * > NEWSQUERY_API_KEY="insert-your-api-key-here" npm test
 */

var assert = require("assert");

describe('The environment variable NEWSQUERY_API_KEY should be set in order to run tests', function() {
    it('NEWSQUERY_API_KEY environment variable should be specified', function() {
        assert.equal((process.env.NEWSQUERY_API_KEY.length > 0), true);
    });
});