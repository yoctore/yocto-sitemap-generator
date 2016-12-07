'use strict';

var logger        = require('yocto-logger');
var _             = require('lodash');
var utils         = require('yocto-utils');
var Q             = require('q');
var fs            = require('fs');
var path          = require('path');

/**
 *
 * Utility tool to automaticly generate sitemap
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module SitemapGenerator
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
  this.schema      = require('./modules/schema')(l);
  this.generator  = require('./modules/generator')(l);
  this.factory    = require('./modules/factory')(l);
  this.scheduler  = require('./modules/scheduler')(l);
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
 * @param {Boolean} writeFile indicate if the file should be created
 * @return {Object} promise of this metod
 */
SitemapGenerator.prototype.process = function (writeFile) {

  // create async process
  var deferred  = Q.defer();

  writeFile = writeFile || false;

  // generate sitemap
  this.generate().then(function (sitemap) {
    this.logger.info('[ SitemapGenerator.process ] - generate succes so convert it to json');

    // Re builds urls by adding value
    this.factory.remapSitemap(sitemap, this.config.rules, this.config.generator.url,
    writeFile).then(function (sitemap) {
      // log succes
      this.logger.debug('[ SitemapGenerator.process ] - the sitemap was correctly remaped');

      // check if file should be written
      if (writeFile === false) {
        // return success
        return deferred.resolve(sitemap);
      }

      // write file
      this.writeFile(sitemap).then(function () {

        deferred.resolve(true);
      }).catch(function (error) {
        // reject error
        deferred.reject(error);
      });
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

/**
 * Method that write sitemap into an file
 *
 * @return {Object} promise of this metod
 */
SitemapGenerator.prototype.writeFile = function (sitemap) {

  // create async process
  var deferred  = Q.defer();

  var pathFile = path.normalize(process.cwd() + '/' + this.config.pathFile);

  this.logger.info('[ SitemapGenerator.writeFile ] - sitemap generated will be writen into' +
  ' file : ' + pathFile);

  fs.writeFile(pathFile, sitemap, function (error) {
    // check if an error occured
    if (error) {
      this.logger.info('[ SitemapGenerator.writeFile ] - an error occured when writting file, ' +
      'more details : ' + utils.obj.inspect(error));
      // return the error
      return deferred.reject(error);
    }

    this.logger.info('[ SitemapGenerator.writeFile ] - sitemap was correctly written into file');

    // return sitemap for success writing
    deferred.resolve(sitemap);
  }.bind(this));

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that generate sitemap and process to rebuild the sitemap by adding params
 *
 * @return {Object} promise of this metod
 */
SitemapGenerator.prototype.enableScheduler = function () {

  // create async process
  var deferred  = Q.defer();

  // check if scheduler have config;
  if (_.isEmpty(this.config.scheduler)) {

    var message = 'This scheduler have no configuration';

    // log error
    this.logger.error('[ SitemapGenerator.enableScheduler ] - ' + message);

    // reject because config not found
    deferred.reject(message);

    // return result of control flow
    return deferred.promise;
  }

  // enable scheduler
  this.scheduler.enable(this.config.scheduler, this).then(function () {
    // log succes
    this.logger.debug('[ SitemapGenerator.enableScheduler ] - the enableScheduler was correctly ' +
    ' configured, the cron rule is : ' +  this.config.scheduler.cronRule);

    // return success
    deferred.resolve(true);
  }.bind(this)).catch(function (error) {
    // log error
    this.error('[ SitemapGenerator.enableScheduler ] - an error occured when configure scheduler,' +
    ' more details : ', utils.obj.inspect(error));
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
