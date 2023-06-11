'use strict';

/**
 * my-extension service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::my-extension.my-extension');
