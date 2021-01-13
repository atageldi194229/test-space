const { Test } = require("../models");

(async () => {
  let test = await Test.create({ name: "aqwe", description: "asdasda wdasda" });

  console.log("createdAt: ", test.createdAt.toLocaleDateString());

  let threeDays = 3 * 24 * 60 * 60 * 1000;

  console.log(
    "3 days + createdAt: ",
    new Date(test.createdAt.getTime() + threeDays).toLocaleDateString()
  );
  console.log(
    "3 days + createdAt < updatedAt: ",
    test.createdAt.getTime() + threeDays < test.updatedAt.getTime()
  );
  console.log(
    "3 days + createdAt > updatedAt: ",
    test.createdAt.getTime() + threeDays > test.updatedAt.getTime()
  );

  process.exit();
})();
