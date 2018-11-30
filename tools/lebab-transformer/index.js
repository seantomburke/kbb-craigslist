const chalk = require('chalk');
const {
  convertToES6,
  printAlreadyES6,
  printNoInputMessage,
  printOverwriteSuccess,
  printDryRunSuccess
} = require('./utils');

// Each transform option for lebab.io safe and unsafe
const transformOptions = {
  safe: [
    'arrow',
    'arrow-return',
    'for-of',
    'for-each',
    'arg-rest',
    'arg-spread',
    'obj-method',
    'obj-shorthand',
    'no-strict',
    'exponent',
    'multi-var'
  ],
  unsafe: ['let', 'class', 'commonjs', 'template', 'default-param', 'destruct-param', 'includes']
};

// The inputs to the script
const inputs = process.argv.slice(2);

// Parse through the options and create an object of options
const cliOptions = inputs
  .filter(option => option.includes('--'))
  .map(option => option.replace(/--/, ''))
  .reduce((options, option) => {
    const newOptions = options;
    newOptions[option] = true;
    return newOptions;
  }, {});

let lebabOptions = transformOptions.safe;

// Safe mode will run only safe options, unsafe mode will run all options
if (cliOptions.safe) {
  console.info(chalk.green('Running in safe mode'));
} else {
  console.info(chalk.red('Running in unsafe mode (output file(s) must be verified manually)'));
  console.info(chalk.red('use --safe to run in safe mode'));
  lebabOptions = lebabOptions.concat(transformOptions.unsafe);
}

if (cliOptions.write) {
  console.info(chalk.red('Overwriting files. If this was not intended ctrl-c immediately'));
} else {
  console.info(chalk.green('Dry run'));
  console.info(chalk.green('Files will not be written'));
}

// Filter out --options in the script input
const files = inputs.filter(filename => !filename.includes('--'));

// Eslint used for --fixing all style errors

console.info(chalk.cyan('Generating ES6 File(s) for:'));

// list all files
files.forEach(file => {
  console.info(chalk.cyan(file));
});

console.info(chalk.cyan('\n'));

if (!files.length) {
  // If no file name is provided, print how to
  printNoInputMessage();
  process.exit(0);
} else {
  let errors = 0;
  // Transform each file passed in as an argument
  files.forEach(file => {
    errors += convertToES6(file, cliOptions, lebabOptions);
  });

  // If there are errors that means the conversion happened
  if (errors) {
    if (cliOptions.write) {
      printOverwriteSuccess();
    } else {
      printDryRunSuccess();
    }
  } else {
    // If there are no errors, then nothing changed
    printAlreadyES6();
  }
  process.exit(0);
}
