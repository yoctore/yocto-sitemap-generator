
var factory = require('../src/modules/factory')();
var utils = require('yocto-utils');


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
  default : {
    params : {
      changeFreq : 'weekly',
      priority   : 0.85
    }
  },
  override : [
    {
      regex   : 'nos-travaux',
      params  : {
        changeFreq : 'daily',
        priority   : 0.5
      }
    },
    {
      regex   : 'nos-services',
      params  : {
        changeFreq : 'daily',
        priority   : 1.5
      }
    }
  ],
  exclude : [
    'contact'
  ]
};

factory.remapSitemap(sitemap, config, baseUrl).then(function (value) {

  console.log('\n --> value : ', utils.obj.inspect(value));
}).catch(function (error) {

  console.log('\n --> error : ', error)
});
