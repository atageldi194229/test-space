const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const triggers = [];

fs.readdirSync(__dirname)
  .filter((file) => {
    console.log(file);
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-12) === ".trigger.txt"
    );
  })
  .forEach((file) => {
    let text = fs.readFileSync(path.join(__dirname, file));
    triggers.push({
      name: file.split(".trigger.txt")[0],
      query: text.toString(),
    });
  });

module.exports = triggers;
