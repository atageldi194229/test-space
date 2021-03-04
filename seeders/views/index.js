const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const views = [];

fs.readdirSync(__dirname)
  .filter((file) => {
    console.log(file);
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-9) === ".view.txt"
    );
  })
  .forEach((file) => {
    let text = fs.readFileSync(path.join(__dirname, file));
    views.push({
      name: file.split(".view.txt")[0],
      query: text.toString(),
    });
  });

module.exports = views;
