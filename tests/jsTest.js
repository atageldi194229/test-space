const changeObj = (obj) => {
  obj.b = "It worked";
};

function main() {
  let a = { key: 1 };
  changeObj(a);
  console.log(a);
}

main();
