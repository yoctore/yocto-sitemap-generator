var logger    = require('yocto-logger');
var generator = require('../src/')(logger);
var utils = require('yocto-utils');

var xmlParser = require('xml2json');

var config = {
  generator : {
    url : 'http://yocto.re'
  },
  rules : {
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
  generator.process().then(function (value) {

    console.log('\n --> Exemple --> generate success ...  \n ' + utils.obj.inspect(value));
    console.log('\n --> Exemple -->typeof ' + typeof value);

  }).catch(function (error) {

    console.log('\n --> generate -  error : ', error);
  });

}).catch(function (error) {

  console.log('\n --> error : ', error);
});
