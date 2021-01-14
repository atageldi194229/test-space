const { SolvingTest, sequelize } = require("../models");

(async () => {
  await SolvingTest.findAll({
    where: { userId: 1 },
    attributes: ["id"],
    include: [
      {
        association: "Test",
        where: {
          id: 1,
          allowedAt: sequelize.literal(
            "(`SolvingTest`.`is_public` = FALSE OR `Test`.`allowed_at` IS NOT NULL AND `Test`.`is_public` = TRUE)"
          ),
        },
        attributes: ["id"],
      },
    ],
  });
})();
