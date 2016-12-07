'use strict';

var logger            = require('yocto-logger');
var _                 = require('lodash');
var utils             = require('yocto-utils');
var Q                 = require('q');
var SitemapGenerator  = require('sitemap-generator');

/**
 *
 * Wrapper of sitemap-generator
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module Generator
 */
function Generator (l) {

  /**
  * Default logger instance
  *
  * @property logger
  * @type Object
  */
  this.logger = l;
}

/**
 * Method that build the sitemap by using the module sitemap-generator
 *
 * @param  {Object} data config data needed
 * @return {Object} promise of this method
 */
Generator.prototype.process = function (data) {
  // create async process
  var deferred  = Q.defer();

  // retrieve startDate date to build eTime
  var startDate = Date.now();
  // create generator
  var generator = new SitemapGenerator(data.url);

  // register event listeners
  generator.on('done', function (sitemap) {
    // console.log(sitemap);

    this.logger.info('[ Generator.process.done ] - sitemap was correctly generate in : ' +
    (Date.now() - startDate) + ' (ms)');
    // return sitemap
    return deferred.resolve(sitemap);
  }.bind(this));

  // register event listeners
  generator.on('fetch', function (status, url) {
    // log fetch url
    this.logger.debug('[ Generator.process.fecth ] - status : < ' + status + ' > for url : ', url);
  }.bind(this));

  // Catch event error
  generator.on('clienterror', function (queueError, errorData) {
    // build error object
    var error = {
      queueError  : queueError,
      errorData   : errorData
    };

    // log error
    this.logger('[ Generator.process.clienterror ] - an error occured, more details : ' +
    utils.obj.inspect(error));

    // reject error
    return deferred.reject(error);
  }.bind(this));

  // start the crawler
  generator.start();

  // return result of control flow
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Generator.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Generator)(l);
};
