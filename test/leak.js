
var N = process.env.N || 100;
var listener = function() {};
var iterations = 0;

function go(){
  for (var i = 0; i < N; ++i) {
    var o = {};
    Object.observe(o, listener);
    Object.unobserve(o, listener);
    o = null;
    iterations++;
  }
}

function print() {
  console.log('ran %d times', iterations);
  console.log(process.memoryUsage());
};

function test() {
  go();
  print();
  setTimeout(test, 10);
};

test();
