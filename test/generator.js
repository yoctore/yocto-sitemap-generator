var schema = require('../src/modules/schema/')();
var assert = require('assert');
var _      = require('lodash');
var utils  = require('yocto-utils');
var should = require('chai').should();

schema.logger.disableConsole();

var config = {
  scheduler  : {
    cronRule : '* * * * * * *'
  },
  generator : {
    url : 'http://yocto.re'
  },
  rules : {
    urlset : {
      xmlns           : 'http://www.sitemaps.org/schemas/sitemap/0.9',
      xsi             : 'http://www.w3.org/2001/XMLSchema-instance',
      schemaLocation  : 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
    },
    default : {
      params : {
        changefreq : 'weekly',
        priority   : 0.85
      }
    },
    override : [
      {
        regex   : 'nos-travaux',
        params  : {
          changefreq : 'daily',
          priority   : 0.5
        }
      },
      {
        regex   : 'nos-services',
        params  : {
          changefreq : 'daily',
          priority   : 1
        }
      }
    ],
    exclude : [
      'contact'
    ]
  }
};

describe('[ Schema ] - test with predefined value', function() {

  // test an valid config
  describe('validate() use correct data for schema < load >', function() {
    it('An success promise should be return', function (done) {
      schema.validate(config, 'load').then(function (value) {
        assert(true);
        done();
      }).catch(function (error) {
        // reject error
        done(error);
      });
    });
  });

  // test an valid config
  describe('validate() use wrong data for schema < load >', function() {
    it('An failed promise should be return', function (done) {
      schema.validate({}, 'load').then(function (value) {
        assert.fail(value);
        done(value);
      }).catch(function (error) {
        // reject error
        assert(true);
        done();
      });
    });
  });



});
