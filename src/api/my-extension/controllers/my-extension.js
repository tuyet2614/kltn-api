'use strict';

/**
 * custom-register controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::my-extension.my-extension", ({ strapi }) => ({
  async customRegister(ctx) {
    const { username, email, password, passwordConfirm } = ctx.request.body;
    const userService = strapi.plugins['users-permissions'].services.user;
    if (password !== passwordConfirm) {
      return ctx.throw(400, 'Password and password confirmation do not match.');
    }
    const listuser = await  userService.fetchAll({ email });
    if (listuser.find(x => x.email === email)) {
      return ctx.throw(400, 'Email already exists.');
    }

    const user = await userService.add({
      email,
      username,
      password,
    });

    return user;
  },
}));
