var factory = require('../src/modules/factory/index.js')();
var assert = require('assert');
var _      = require('lodash');
var utils  = require('yocto-utils');
var should = require('chai').should();

factory.logger.disableConsole();

var sitemap = {
  urlset: {
    xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    url: [{
      loc: 'http://www.yocto.re/'
    }, {
      loc: 'http://www.yocto.re/nos-services'
    }, {
      loc: 'http://www.yocto.re/nos-travaux'
    }, {
      loc: 'http://www.yocto.re/contact'
    }, {
      loc: 'http://www.yocto.re/nos-travaux/bazar-maurice-mu'
    }, {
      loc: 'http://www.yocto.re/nos-travaux/bfcoi'
    }, {
      loc: 'http://www.yocto.re/nos-travaux/chambre-de-metiers-et-de-l-artisanat-de-la-reunion'
    }]
  }
};

var baseUrl = 'http://wwww.yocto.re';

var config = {
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
        priority   : 0.8
      }
    }
  ],
  exclude : [
    'contact'
  ]
};

var urls = [
  {
    testCase : 'default',
    initial : {
      loc: 'http://www.yocto.re/nos-projet'
    },
    final : {
      loc        : 'http://www.yocto.re/nos-projet',
      changefreq : 'weekly',
      priority   : 0.85
    }
  },
  {
    testCase : 'orverride',
    initial : {
      loc: 'http://www.yocto.re/nos-travaux'
    },
    final : {
      loc        : 'http://www.yocto.re/nos-travaux',
      changefreq : 'daily',
      priority   : 0.5
    }
  },
  {
    testCase : 'exclude',
    initial : {
      loc: 'http://www.yocto.re/contact'
    },
    final : null
  }
];

var sitemapFinal = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\">\n  <url>\n    <loc>http://www.yocto.re/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n  <url>\n    <loc>http://www.yocto.re/nos-services</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>http://www.yocto.re/nos-travaux</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.5</priority>\n  </url>\n  <url>\n    <loc>http://www.yocto.re/nos-travaux/bazar-maurice-mu</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.5</priority>\n  </url>\n  <url>\n    <loc>http://www.yocto.re/nos-travaux/bfcoi</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.5</priority>\n  </url>\n  <url>\n    <loc>http://www.yocto.re/nos-travaux/chambre-de-metiers-et-de-l-artisanat-de-la-reunion</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.5</priority>\n  </url>\n</urlset>";

describe('[ Factory ] - test with predifined result', function() {
  describe('remapSitemap() - Create sitemap with all config', function() {
    it('Value should be exactly the same value as finalSitemap', function (done) {
      factory.remapSitemap(sitemap, config, baseUrl, true).then(function (value) {
        assert.equal(value, sitemapFinal);
        done();
      }).catch(function (error) {
        // reject error
        done(error);
      });
    });
  });

  // test each config
  _.each(urls, function (v) {
    describe('buildUrl() - rebuild url object with config file - testCase : #' + v.testCase , function () {
      it('Value should be exactly the same value as final ', function (done) {
        factory.buildUrl(v.initial, config, baseUrl).then(function (value) {
          assert.deepEqual(value, v.final);
          done();
        }).catch(function (error) {
          // reject error
          done(error);
        });
      });
    });
  });

});
