module.exports = {
  routes: [
    {
      method: "POST",
      path: "/forgot-password",
      handler: "my-extension.forgotPassword",
    },
    {
      method: "POST",
      path: "/confirm-forgot-password",
      handler: "my-extension.confirmChangePassword",
    },
  ],
};
