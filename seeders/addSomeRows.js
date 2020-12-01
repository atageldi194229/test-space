const { User } = require("../models");

(async () => {
  await User.create({
    username: "qwerty",
    password: "qwerty",
    birthDate: "01-01-2019",
    firstName: "qwerty",
    lastName: "qwerty",
    phoneNumber: "+99368597458",
    email: "qwerty@gmail.com",
  });

  console.log("The End.");
})();
