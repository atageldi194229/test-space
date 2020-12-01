const { sequelize } = require("../models");

(async () => {
  let data = await sequelize.query("SELECT username, id FROM users");

  console.log(data);
  console.log(data[0][0].username);

  let query =
    "SELECT CASE WHEN SUM(is_tsc_unlimited) >= 1 THEN 'UNLIMITED' ELSE SUM(tsc - tsc_used) END TSC , CASE WHEN SUM(is_tcc_unlimited) >= 1 THEN 'UNLIMITED' ELSE SUM(tcc - tcc_used) END TCC FROM `payments` WHERE status = 1 and user_id = 1 and DATEDIFF(NOW(), allowed_at) <= 30";

  process.exit();
})();
