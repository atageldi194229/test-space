function randomizeArray(arr, repeat = 1) {
  while (repeat--) {
    // random nimber between and arr.length(not included)
    let randA = Math.random() * arr.length;
    let randB = Math.random() * arr.length;

    // swap values
    let c = arr[randA];
    arr[randA] = arr[randB];
    arr[randB] = c;
  }
}

module.exports = randomizeArray;
