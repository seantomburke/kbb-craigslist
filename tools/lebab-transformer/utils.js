const fs = require('fs');
const lebab = require('lebab');
const chalk = require('chalk');
const { CLIEngine: Eslint } = require('eslint');
const JsDiff = require('diff');

/**
 * Prints the usage message
 */
const printNoInputMessage = () => {
  console.error('\r\n');
  console.error(chalk.red('You need to provide at least one filename.'));
  console.info('\n');
  console.info(chalk.bold('Usage: '));
  console.info(chalk.yellow('lebab-transform file1.js file2.js'));
  console.info('\r\n');
};

/**
 * Prints the success message when using --write
 *
 * @param {Array} warnings
 */
const printOverwriteSuccess = () => {
  console.info('\r\n');
  console.info(chalk.green('Your files have been updated to the new ES6 format!'));
};

/**
 * Prints the success message when doing a dry run without --write
 *
 * @param {Array} warnings
 */
const printDryRunSuccess = () => {
  console.info('\r\n');
  console.info(chalk.green('Review the ES6 changes above.'));
  console.info(
    chalk.green(
      'If everything looks good, run this command again with the option --write to write the changes.'
    )
  );
  console.info('\r\n');
  console.error(
    chalk.red(
      'Please review all warnings and changes, and fix or confirm your code before committing'
    )
  );
};

/**
 * Print message if file is already in ES6
 */
const printAlreadyES6 = () => {
  console.info('\r\n');
  console.info(chalk.green('File is already in es6. Nothing to convert.'));
  console.info('\r\n');
};

/**
 * Prints the warnings
 *
 * @param {string} filename
 * @param {Array} warnings
 */
const printWarnings = (filename, warnings) => {
  let messages = [`\r\n ${chalk.underline(filename)}`];
  messages = messages.concat(
    warnings.map(
      ({ line, msg, type }) =>
        `\r\r${chalk.dim(line)}:\t${chalk.yellow('warn')}\t${chalk.bold(msg)}\t(${chalk.dim(type)})`
    )
  );
  messages = messages.concat([`\r\n ${chalk.yellow(warnings.length)} ${chalk.yellow('warning(s)')} \r\n`]);
  process.stderr.write(messages.join('\r\n'), { encoding: 'utf8' });
};

/**
 * Print the diff from the original file and the new changes
 * @param diff
 * @param filename
 * */
const printDiff = (diff, filename) => {
  let diffErrors = 0;

  if (diff.length > 1) {
    console.info(chalk.underline(filename));
    diff.forEach(({ added, value, removed }) => {
      if (added) {
        process.stdout.write(chalk.green(`\n+${value}`));
        diffErrors += 1;
      } else if (removed) {
        process.stdout.write(chalk.red(`\n-${value}`));
        diffErrors += 1;
      } else {
        process.stdout.write(chalk.grey(value));
      }
    });
  }

  return diffErrors;
};

/**
 *  @param {string} inputFile
 */
const convertToES6 = (inputFile, cliOptions, lebabOptions) => {
  const eslint = new Eslint({ envs: ['browser'], fix: true, useEslintrc: true });
  const outputFile = inputFile;
  let convertErrors = 0;

  try {
    const jsCode = fs.readFileSync(inputFile, { encoding: 'utf8' });
    // Transform the code with Lebab
    const { code, warnings } = lebab.transform(jsCode, lebabOptions);

    // If there was code that was converted, overwrite the inputfile
    if (code) {
      if (cliOptions.write) {
        console.info(chalk.cyan(`Generated: ${outputFile}`));
        fs.writeFileSync(outputFile, code);
      }

      // Running eslint --fix
      const report = cliOptions.write
        ? eslint.executeOnFiles([outputFile])
        : eslint.executeOnText(code);

      // Do an eslint --fix
      Eslint.outputFixes(report);

      const es6Code = cliOptions.write ? fs.readFileSync(outputFile, { encoding: 'utf8' }) : code;

      // Diff the original and new code
      const diff = JsDiff.diffLines(jsCode, es6Code, {
        newlineIsToken: true
      });

      // Print the diff between the original and new file
      convertErrors += printDiff(diff, outputFile);

      // If there are warnings, print them
      if (warnings.length) {
        printWarnings(inputFile, warnings);
        convertErrors += 1;
      }
    }
  } catch (IOError) {
    console.log(IOError);
    console.info(chalk.red(IOError));
  }
  return convertErrors;
};

module.exports = {
  printAlreadyES6,
  printNoInputMessage,
  printDiff,
  convertToES6,
  printOverwriteSuccess,
  printDryRunSuccess
};
