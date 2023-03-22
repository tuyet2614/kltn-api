"use strict";

/**
 * recommend service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::self-service.self-service");
