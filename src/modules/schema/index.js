'use strict';

var logger = require('yocto-logger');
var _      = require('lodash');
var utils  = require('yocto-utils');
var Q      = require('q');
var joi    = require('joi');

/**
 *
 * Utility tool to automaticly generate sitemap
 *
 * @date : 06/12/2016
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 *
 * @module Schema
 */
function Schema (l) {

  /**
  * Default logger instance
  *
  * @property logger
  * @type Object
  */
  this.logger = l;
}

/**
 * Method that use joi to validate an object with it schema
 *
 * @param  {Object} data the data to check
 * @param  {Object} schemaName the name of the schema to use
 * @return {Object} promise of this method
 */
Schema.prototype.validate = function (data, schemaName) {
  // create async process
  var deferred  = Q.defer();

  this.logger.debug('[ Schema.validate ] - validate schema for schemaName = ' + schemaName);
  // make joi validation
  var result = joi.validate(data, this.getSchema(schemaName));

  // check if joi validation failed
  if (_.isEmpty(result.error)) {

    // success
    deferred.resolve(result.value);
  } else {

    // Log error
    this.logger.error('[ Schema.validate ] - joi validation failed, details : ' +
    utils.obj.inspect(result.error));

    // reject error
    deferred.reject(result.error);
  }

  // return result of control flow
  return deferred.promise;
};

/**
 * Method that retrieve an schema
 *
 * @param  {String} schemaName the name of schema
 * @return {Object} return the joi object
 */
Schema.prototype.getSchema = function (schemaName) {

  var paramRules = joi.object().optional().keys({
    changefreq  : joi.string().empty().allow([ 'always', 'hourly', 'daily', 'weekly',
    'monthly', 'yearly', 'never' ]),
    priority    : joi.number().optional().min(0).max(1),
    lastmod     : joi.string().optional().trim().empty()
  }).default({});

  // Default urlset value
  var defaultUrlset = {
    xmlns           : 'http://www.sitemaps.org/schemas/sitemap/0.9',
    xsi             : 'http://www.w3.org/2001/XMLSchema-instance',
    schemaLocation  : 'http://www.sitemaps.org/schemas/sitemap/0.9 ' +
    'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
  };

  // All schemas
  var schemas = {
    load            : joi.object().required().keys({
      pathFile  : joi.string().optional().trim().empty().default('sitemap.xml'),
      scheduler : joi.object().optional().keys({
        cronRule : joi.string().required().trim().empty(),
      }).default({}),
      generator : joi.object().required().keys({
        url     : joi.string().trim().required().empty(),
        options : joi.object().optional().keys({
          restrictToBasepath : joi.boolean().optional(),
          stripQuerystring   : joi.boolean().optional()
        }).default({})
      }),
      rules     : joi.object().optional().keys({
        urlset    : joi.object().optional().keys({
          xmlns           : joi.string().trim().empty().default(defaultUrlset.xmlns).allow(null),
          xsi             : joi.string().trim().empty().default(defaultUrlset.xsi).allow(null),
          schemaLocation  : joi.string().trim().empty().default(defaultUrlset.schemaLocation)
          .allow(null),
        }).default(defaultUrlset),
        default   : joi.object().optional().keys({
          params : paramRules
        }).default({
          params : {}
        }),
        override  : joi.array().optional().items(
          joi.object().keys({
            regex  : joi.string().required().trim().empty(),
            params : paramRules
          })
        ).default([]),
        exclude   : joi.array().optional().items(
          joi.string().trim().empty()
        ).default([])
      })
    })
  };

  // return this schema
  return schemas[schemaName];
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Schema.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }
  // default statement
  return new (Schema)(l);
};
