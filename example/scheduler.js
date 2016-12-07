var logger    = require('yocto-logger');
var generator = require('../src/')(logger);
var utils = require('yocto-utils');

var xmlParser = require('xml2json');

var config = {
  scheduler  : {
    cronRule : '*/50 * * * * *'
  },
  generator : {
    url : 'http://yocto.re'
  },
  rules : {
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

// load config
generator.load(config).then(function () {

  console.log('\n --> config success ... ');

  // load config
  generator.enableScheduler().then(function (value) {

    console.log('\n --> Exemple --> generate success ...  \n ' + utils.obj.inspect(value));
    console.log('\n --> Exemple -->typeof ' + typeof value);

  }).catch(function (error) {

    console.log('\n --> generate -  error : ', error);
  });
}).catch(function (error) {

  console.log('\n --> error : ', error);
});
