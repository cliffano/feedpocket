var assert = require('assert'),
  jscoverageHack = require('../lib/feedtouch'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('feedtouch').addBatch({
	'feedtouch': {
    topic: function () {
      return function (mocks) {
        return sandbox.require('../lib/feedtouch', {
            requires: mocks
          }).FeedTouch;
      };
    },
    'discover should pass error when there is a request error': function (topic) {
      var checks = {},
        mocks = {
          'request': function (opts, cb) {
            assert.equal(opts.url, 'http://wired.com');
            cb(new Error('Dummy error'));  
          }
        },
        cb = function (err, result) {
          checks.err = err;
          checks.result = result;
        };
      (new (topic(mocks))()).discover('http://wired.com', cb);
      assert.equal(checks.err.message, 'Feed discovery error: Dummy error');
      assert.isUndefined(checks.result);
    },
    'discover should pass error when request status is not 200': function (topic) {
      var checks = {},
        mocks = {
          'request': function (opts, cb) {
            assert.equal(opts.url, 'http://wired.com');
            cb(null, { statusCode: 502 });  
          }
        },
        cb = function (err, result) {
          checks.err = err;
          checks.result = result;
        };
      (new (topic(mocks))()).discover('http://wired.com', cb);
      assert.equal(checks.err.message, 'Feed discovery error: Unexpected status code: 502');
      assert.isUndefined(checks.result);
    },
    'discover should pass result when request status is 200': function (topic) {
      var checks = {},
        mocks = {
          'request': function (opts, cb) {
            assert.equal(opts.url, 'http://wired.com');
            cb(null, { statusCode: 200 },
              '<a title="Some Title" href="http://somefeed">atom</a> Blah blah. <link title="Feed Feed" href="http://feedfeed" type="application/atom+xml"></link>');
          }
        },
        cb = function (err, result) {
          checks.err = err;
          checks.result = result;
        };
      (new (topic(mocks))()).discover('http://wired.com', cb);
      assert.isNull(checks.err);
      assert.equal(checks.result.length, 2);
      assert.equal(checks.result[0].title, 'Feed Feed');
      assert.equal(checks.result[0].url, 'http://feedfeed');
      assert.equal(checks.result[1].title, 'Some Title');
      assert.equal(checks.result[1].url, 'http://somefeed');
    },
    'readable should pass result title, url, and content': function (topic) {
      var checks = {},
        mocks = {
          'readabilitySAX': {
            get: function (url, cb) {
              assert.equal(url, 'http://wired.com/article1');
              cb({ title: 'Some Title', link: url, html: '<h1>Content</h1>' });
            }
          }
        },
        cb = function (err, result) {
          checks.err = err;
          checks.result = result;
        };
      (new (topic(mocks))()).readable('http://wired.com/article1', cb);
      assert.isNull(checks.err);
      assert.equal(checks.result.title, 'Some Title');
      assert.equal(checks.result.url, 'http://wired.com/article1');
      assert.equal(checks.result.content, '<h1>Content</h1>');
    }
	}
}).exportTo(module);
