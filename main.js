const { bench } = require("./becnch");

const fn1 = () => {
  for (let i = 0; i < 100; i++);
};

const fn2 = () => {
  for (let i = 0; i < 10000; i++);
};

console.log(
  bench(fn1),
  bench(fn2)
);