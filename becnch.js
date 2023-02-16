

const time = 3000;

/**
 * @param {Function} func 
 */
exports.bench = function bench(func) {
  const need = performance.now() + time;
  let score = 0;

  while (performance.now() <= need) {
    func();
    if (performance.now() <= need)
      score++;
  }

  return score;
};