const { User, Price, PrivilegedUser } = require("../models");

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

  await PrivilegedUser.create({
    username: "atasan",
    password: PrivilegedUser.hashPassword("sakura"),
    role: "a",
  });

  await Price.create({
    type: 0,
    data: JSON.stringify([
      {
        ranges: {
          start: 0,
          end: 50,
        },
        price: 2,
      },
      {
        ranges: {
          start: 50,
          end: 100,
        },
        price: 1,
      },
    ]),
  });

  await Price.create({
    type: 1,
    data: JSON.stringify([
      {
        ranges: {
          start: 0,
          end: 50,
        },
        price: 2,
      },
      {
        ranges: {
          start: 50,
          end: 100,
        },
        price: 1,
      },
    ]),
  });

  await Price.create({
    type: 2,
    data: 200,
  });

  await Price.create({
    type: 3,
    data: 200,
  });

  console.log("The End.");
  process.exit();
})();
