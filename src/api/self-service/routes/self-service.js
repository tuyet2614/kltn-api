"use strict";

/**
 * self-service router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::self-service.self-service");
