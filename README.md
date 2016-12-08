[![NPM](https://nodei.co/npm/yocto-sitemap-generator.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-sitemap-generator/)

![alt text](https://david-dm.org/yoctore/yocto-sitemap-generator.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-sitemap-generator/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-sitemap-generator)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-sitemap-generator/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-sitemap-generator/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-sitemap-generator/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-sitemap-generator)
[![Build Status](https://travis-ci.org/yoctore/yocto-sitemap-generator.svg?branch=master)](https://travis-ci.org/yoctore/yocto-sitemap-generator)

## Overview

This module is a part of yocto node modules for NodeJS.

Please see [our NPM repository](https://www.npmjs.com/~yocto) for complete list of available tools (completed day after day).

This module provide a simple sitemap generator based [sitemap-generator](https://www.npmjs.com/package/sitemap-generator).

## Motivation

Create an simple module that generate automatically sitemap by crawling an site.

## Specification

The generation can be done directly or handle by an scheduler.

- directly : call process() method to generate the sitemap
- scheduler : scheduler will generate sitemap automatically. The module [node-scheduler](https://www.npmjs.com/package/node-schedule) was used.


## Usage

### Basic configuration

> Configuration object will be check by an Joi schema

```javascript

var config = {
  // the path file to write the xml file, optional (default : stiemap.xml)
  pathFile : 'sitemap.xml',
  // Optional, if is not defined or empty the scheduler will not be set
  scheduler  : {
    // Use only cron syntax
    cronRule : '* * * * * *'
  },
  generator : {
    // the url to map
    url : 'http://yocto.re',
    // Optional options
    options : {
      restrictToBasepath: false,
      stripQuerystring: true,
    }
  },
  // Rules to apply to each url found
  rules : {
    // data use into urlset attribute, all is optional (default value below)
    // if value was null, the attribute will not be added into xml file
    urlset : {
      xmlns           : 'http://www.sitemaps.org/schemas/sitemap/0.9',
      xsi             : 'http://www.w3.org/2001/XMLSchema-instance',
      schemaLocation  : 'http://www.sitemaps.org/schemas/sitemap/0.9  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
    },
    // default config applied
    default : {
      params : {
        changefreq : 'weekly',
        priority   : 0.85
      }
    },
    // config to override default params when an route match the regexp
    override : [
      {
        // String that will be use to create a new RegExp
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
    // all route that will be exclude in sitemap
    exclude : [
      // String that will be use to create a new RegExp
      'contact'
    ]
  }
}

var sitemapGenerator = require('yocto-sitemap-generator');

// load config into module
sitemapGenerator.load(config).then(function (value) {
  // loading success
  console.log(value);
}).catch(function (error) {
  // loading failed
  console.log(error);
});

```

### Generation

> First load module with load() method

```javascript

// generate sitemap with config defined
// The first param indicate if the sitemap should be converted to xml file
sitemapGenerator.process(true).then(function (sitemap) {
  // ge success sitemap to xml
  console.log(value);
}).catch(function (error) {
  // loading failed
  console.log(error);
});
```

### Scheduler

> First load module with load() method
"

```javascript

// Enable scheduler that will generate automatically the sitemap
sitemapGenerator.enableScheduler().then(function (sitemap) {
  // enable succes
  console.log(value);
}).catch(function (error) {
  // enable failed
  console.log(error);
});
```
