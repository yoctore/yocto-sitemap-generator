'use strict';

var logger   = require('yocto-logger');
var _        = require('lodash');
var utils    = require('yocto-utils');
var Q        = require('q');
var schedule = require('node-schedule');

/**
 * Module that permit to write file
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module Scheduler
 */
function Scheduler (l) {

  /**
  * Default logger instance
  *
  * @property logger
  * @type Object
  */
  this.logger = l;
}

/**
 * Method that enable scheduler to rubuild automatically sitemap
 *
 * @param  {Object} config config for cron data
 * @param  {Object} generator the module index.js
 * @return {Object} promise of this method
 */
Scheduler.prototype.enable = function (config, generator) {

  // create async process
  var deferred  = Q.defer();

  this.logger.info('[ Scheduler.enable ] - Before instanciate Scheduler generate first sitemap ');

  // Before instanciate Scheduler generate first sitemap
  // call generator to generate sitemap and writefile
  generator.process(true).then(function () {
    // log info
    this.logger.info('[ Scheduler.enable ] - First sitemap was correctly generated, now ' +
    ' instanciate scheduler');

    // instanciate scheduler
    schedule.scheduleJob(config.cronRule, function () {
      this.logger.info('[ Scheduler.job ] - Auto-Genarting sitemap start ...');
      // call generator to generate sitemap and writefile
      generator.process(true);
    }.bind(this));

    // resolve success
    deferred.resolve(true);
  }.bind(this)).catch(function (error) {
    // log error
    this.logger.error('[ Scheduler.enable ] - first generating failed, so scheduler was not ' +
    'instanciate, more details : ' + utils.obj.inspect(error));
    // reject error
    deferred.reject(error);
  }.bind(this));

  // return result of control flow
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Scheduler.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Scheduler)(l);
};
