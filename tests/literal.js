const {
  Test,
  sequelize,
  Sequelize: { Op },
} = require("../models");

(async () => {
  let limit = 20;
  let offset = 0;
  let threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;

  let tests = await Test.findAll({
    limit,
    offset,
    order: [
      sequelize.literal("(solve_count * 2 + like_count) DESC"),
      ["createdAt", "desc"],
    ],
    where: {
      isPublic: true,
      allowedAt: {
        [Op.gte]: new Date(new Date() - threeMonths),
      },
    },
    attributes: ["id", "name", "description", "image", "language", "keywords"],
  });

  console.log(JSON.stringify(tests, null, 2));

  process.exit();
})();
