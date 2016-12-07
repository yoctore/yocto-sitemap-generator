'use strict';

var logger        = require('yocto-logger');
var _             = require('lodash');
var utils         = require('yocto-utils');
var Q             = require('q');

/**
 *
 * Utility tool to automaticly generate sitemap
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @class YMongoose
 */
function SitemapGenerator (l) {

  /**
  * Default logger instance
  *
  * @property logger
  * @type Object
  */
  this.logger           = l;

  /**
  * The config to write file
  *
  * @property logger
  * @type Object
  */
  this.config           = {};

  // Require modules
  this.schema    = require('./modules/schema')(l);
  this.generator = require('./modules/generator')(l);
  this.factory   = require('./modules/factory')(l);
}

/**
 * Method that load config for this module
 *
 * @param  {Object} data the data used for configuration
 * @return {Object} promise of this method
 */
SitemapGenerator.prototype.load = function (data) {
  // create async process
  var deferred  = Q.defer();
  this.schema.validate(data, 'load').then(function (value) {
    // set config
    this.config = value;

    this.logger.info('[ SitemapGenerator.load ] - config load with success');
    // schema load success
    deferred.resolve(value);
  }.bind(this)).catch(function (error) {
    // log
    this.logger.error('[ SitemapGenerator.load ] - error when loading module');
    // reject error
    deferred.reject(error);
  });

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that generate sitemap with config data
 *
 * @return {Object} promise of this metod
 */
SitemapGenerator.prototype.generate = function () {
  // create async process
  var deferred  = Q.defer();

  this.logger.info('[ SitemapGenerator.generate ] - generation of xml by crawler will start ' +
  ' with options : ' + utils.obj.inspect(this.config.generator));

  // generate sitemap
  this.generator.process(this.config.generator).then(function (value) {
    // success
    deferred.resolve(value);
  }).catch(function (error) {
    // an error occured so reject error
    deferred.reject(error);
  });

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that generate sitemap and process to rebuild the sitemap by adding params
 *
 * @return {Object} promise of this metod
 */
SitemapGenerator.prototype.process = function () {

  // create async process
  var deferred  = Q.defer();

  this.logger.info('[ SitemapGenerator.process ] - start ...');

  // generate sitemap
  this.generate().then(function (sitemap) {
    this.logger.info('[ SitemapGenerator.process ] - generate succes so convert it to json');

    // Re builds urls by adding value
    this.factory.remapSitemap(sitemap, this.config.rules, this.config.generator.url).then(
    function (sitemap) {
      // log succes
      this.logger.debug('[ SitemapGenerator.process ] - the sitemap was correctly remaped');

      // return success
      deferred.resolve(sitemap);
    }.bind(this)).catch(function (error) {
      // log error
      this.error('[ SitemapGenerator.process ] - an error occured when remaping sitemap,' +
      ' more details : ', utils.obj.inspect(error));
      deferred.reject(error);
    });
  }.bind(this)).catch(function (error) {
    // an error occured so reject error
    deferred.reject(error);
  });

  // return result of control flow
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ SitemapGenerator.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (SitemapGenerator)(l);
};
