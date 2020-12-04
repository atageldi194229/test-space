const { Payment } = require("../models");

(async () => {
  let data = await Payment.balance(1);
})();
