const { User } = require("../models");

(async () => {
  await User.create({
    username: "atasan",
    password: User.hashPassword("atasan"),
    birthDate: "01-01-2019",
    firstName: "qwerty",
    lastName: "qwerty",
    phoneNumber: "+99368597458",
    email: "qwerty@gmail.com",
    active: true,
  });

  console.log("The End.");
  process.exit();
})();
