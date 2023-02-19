const { bench } = require("./becnch");

const bollerplate = `
console.log(test)
`;

const fn1 = () => new Function(`
{
// Block 1
const test = (a, b) => a + b

return new Function(\`${bollerplate}\`)
}
`);



const fn2 = new Function(`
{
// Block 2
function test(a, b) {
  return a + b;
}

return new Function(\`${bollerplate}\`)
}
`);

// console.log(
//   bench(fn1()),
//   bench(fn2())
// );

fn1()();
fn2()();