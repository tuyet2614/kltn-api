'use strict';

/**
 * custom-register controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const axios = require("axios");
module.exports = createCoreController("api::my-extension.my-extension", ({ strapi }) => ({
  async forgotPassword(ctx) {
    const sendForgotPassword = async (
      recipientEmail,
      recipientUsername,
      token,
      templateId
    ) => {
      const frontendLink = 'http://localhost:3000'

      await strapi.plugins['email'].services.email.send({
        to: recipientEmail,
        templateId: templateId,
        dynamic_template_data: {
          header: `Hi ${recipientUsername},`,
          text:
            "We're sending you this email because you requested a password reset. Click this button below to change your password!",
          c2a_link: frontendLink + '/auth/forgot-password/' + token,
          c2a_button: 'Reset Password',
        }
      })
        .then(r => console.log('sendForgotPassword sent successfully!'))
        .catch(_e => {
          console.log("sendForgotPassword" + _e)
        });

    }
    const { email } = ctx.request.body;
    const userService = strapi.plugins['users-permissions'].services.user;
    const listuser = await userService.fetchAll();
    let u = listuser.find(x => x.email === email)
    if (!u) {
      return ctx.throw(400, 'User not found.');
    } else {
      let message = 'User existing'
      const entity = await strapi.query('api::token.token').create({data: {
        valid_until: new Date().getTime() + (24 * 60 * 60 * 1000),
        created_by_user: u.id,
        issue_email: email,
        issue_type: 'ForgotPassword',
        issue_subject: 'Forgot Passowrd',
        retry_count: 0
      }})
      await sendForgotPassword(u.email, u.username, entity.id, 'd-1b47054d837f4181ac09f3d253a0d9e5')
      return message
    }
  },
  async confirmChangePassword(ctx) {
    let entity
    let param = ctx.request.body
    const userService = strapi.plugins['users-permissions'].services.user;
    const r = await strapi.query('api::token.token').findOne({
      where: { id: param.token },
    });
    if (!r) return { status: '404', message: 'The token does not exist.' }
    else {
      if (r.activatedDate) return { status: '404', message: 'Token is not valid or has expired.' }
      else {
        const listuser = await userService.fetchAll();
        let u = listuser.find(x => x.email === r.issue_email)

        if (!u) return { status: '400', message: 'User not existing. Please check your email address!' }
        let _validUntil = new Date(r.valid_until)
        let today = new Date()
        const emailAdmin = process.env.EMAIL_ADMIN
        const passwordAdmin = process.env.PASSWORD_ADMIN
        const userAdmin = await axios.post('http://localhost:1337/admin/login' , {
          email: emailAdmin,
          password: passwordAdmin
        })
        const token = userAdmin?.data?.data?.token
        if (_validUntil > today && !r.activated_date && token) {
          entity = await  axios.put(`http://localhost:1337/content-manager/collection-types/plugin::users-permissions.user/${u.id}`, {
            resetPasswordToken: null, password: param.password
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          })
          await strapi.query('api::token.token').update({
            where: { id: r.id },
            data: {
              activated_date: new Date().getTime()
            },
          });
        } else {
          return { status: '400', message: 'Token is not valid or has expired.' }
        }
      }
    }
    return entity
  },
}));
