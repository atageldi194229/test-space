const { User } = require("../models");

User.prototype.func = function () {
  console.log("id", this.id);
  console.log("username", this.username);
};

(async () => {
  let user = await User.findByPk(1);
  user.func();
})();
