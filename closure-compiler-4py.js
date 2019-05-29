const ClosureCompiler = require('google-closure-compiler').compiler;

let stdIn = process.stdin;
//resume开启流模式flowing-mode
stdIn.resume();
let input = undefined;
stdIn.on('data', function (chunk) {
  //去掉下一行可一直监听输入，即保持标准输入流为开启模式
  stdIn.pause();
  input = chunk;
});
stdIn.on('end', function () {
  // process.stdout.write(input);

  let inputString = input.toString();
  let commandArray = inputString.split(' ');
  let option = { js: [] };
  for (let index = 0; index < commandArray.length; index++) {
    let element = commandArray[index];
    if (element === 'google-closure-compiler') {
      continue;
    } else if (element.indexOf('--') === 0) {
      let key = element.replace('--', '');
      let value = commandArray[++index];
      option[key] = value;
    } else {
      option.js.push(element);
    }
  }

  const closureCompiler = new ClosureCompiler(option);
  closureCompiler.run((exitCode, stdOut, stdErr) => {
    if (exitCode === 0) {
      /// 往标准输出填入编译结果，py端可以通过stdout获得stdOut信息
      console.log(stdOut);
    }
  });
});
