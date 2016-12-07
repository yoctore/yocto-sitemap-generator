'use strict';

var logger        = require('yocto-logger');
var _             = require('lodash');
var Q             = require('q');
var xmlParser     = require('xml2json');
var async         = require('async');

/**
 *
 * Factorys used by module
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @class YMongoose
 */
function Factory (l) {

  /**
  * Default logger instance
  *
  * @property logger
  * @type Object
  */
  this.logger = l;
}

/**
 * Remap the url into the sitemap generated
 *
 * @param  {Object} sitemap sitemap that was generated
 * @param  {Object} config config use to add params
 * @param  {String} baseUrl the base url to remove for regexp matching
 * @return {Object} promise of this method
 */
Factory.prototype.remapSitemap = function (sitemap, config, baseUrl) {
  // create async process
  var deferred  = Q.defer();

  // array that contains the news urls
  var finalUrls = [];

  // convet to json if needed
  sitemap = _.isString(sitemap) ? JSON.parse(xmlParser.toJson(sitemap)) : sitemap;

  // process each urls in array
  async.each(sitemap.urlset.url, function (url, nextUrl) {
    // method that rebuild each url object by adding params from config object
    this.buildUrl(url, config, baseUrl).then(function (urlRemap) {
      // push url remaped
      finalUrls.push(urlRemap);
      // call next url
      nextUrl();
    }).catch(function () {
      // call next url
      nextUrl();
    });
  }.bind(this), function () {
    // override with new builded array and compact to remove null value
    sitemap.urlset.url = _.compact(finalUrls);

    // resolve sitemap
    deferred.resolve(sitemap);
  });

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that retrieve basic url and set parmas from config object
 *
 * @param  {Object} url object url from sitemap
 * @param  {Object} config config use to add params
 * @param  {String} baseUrl the base url to remove for regexp matching
 * @return {Object} promise of this method
 */
Factory.prototype.buildUrl = function (url, config, baseUrl) {

  // create async process
  var deferred  = Q.defer();
  // final url object
  var finalUrl = {};

  // remove the base url for regexp matching
  var urlTrim = _.replace(url.loc, baseUrl, '');

  // control flow to check if url should be excluded or default param overriden
  async.parallel([
    // check if is an exclude route
    function (done) {
      // read each regexp into exclude array
      _.each(config.exclude, function (v) {
        // check if match
        if (urlTrim.match(new RegExp(v))) {
          // set to null to exclude it
          finalUrl = null;
        }
      });
      // process is done
      done();
    },
    // check if is an overriden route
    function (done) {
      // read each regexp into override array
      _.each(config.override, function (v) {
        // check if match
        if (urlTrim.match(new RegExp(v.regex))) {
          // set params from config object
          finalUrl = _.merge(url, v.params);
        }
      });
      // process is done
      done();
    }
  ], function () {
    // check if default params should be use
    if (!_.isNull(finalUrl) && _.isEmpty(finalUrl)) {
      // set params from default config object
      finalUrl = _.merge(url, config.default.params);
    }

    // resolve final array
    deferred.resolve(finalUrl);
  });

  // return result of control flow
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Factory.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Factory)(l);
};
