import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { ESLint } from 'eslint';
import { ReporterSettings } from '../types';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const styles = _.template(
  fs.readFileSync(path.join(__dirname, '../helpers/styles.html'), 'utf-8')
);
const scripts = _.template(
  fs.readFileSync(path.join(__dirname, '../helpers/scripts.html'), 'utf-8')
);
const pageTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'main-page.html'), 'utf-8')
);
const resultTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/result.html'), 'utf-8')
);
const resultDetailsTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/details.html'), 'utf-8')
);
const resultSummaryTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/summary.html'), 'utf-8')
);
const codeWrapperTemplate = _.template(
  fs.readFileSync(
    path.join(__dirname, 'details/code/code-wrapper.html'),
    'utf-8'
  )
);
const codeTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/code/code.html'), 'utf-8')
);
const occurrenceTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/code/occurrence.html'), 'utf-8')
);
const summaryTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'summary/summary-details.html'), 'utf-8')
);
const filesTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'summary/files.html'), 'utf-8')
);

/**
 * Renders text along the template of x problems (x errors, x warnings)
 * @param {int} totalErrors Total errors
 * @param {int} totalWarnings Total warnings
 * @returns {string} The formatted string, pluralized where necessary
 */
function renderSummary(
  notInternationalizedCount: number,
  internationalizedCount: number
) {
  const percentage = Math.round(
    (internationalizedCount /
      (notInternationalizedCount + internationalizedCount)) *
      100
  );
  const percentageColor = () => {
    if (percentage >= 75) {
      return '#157F1F';
    }
    if (percentage >= 50) {
      return '#FBB13C';
    }
    return '#9E2B25';
  };
  const strokeDashoffset = Math.round((629 * percentage) / 100);
  return summaryTemplate({
    notInternationalizedCount,
    internationalizedCount,
    totalCount: notInternationalizedCount + internationalizedCount,
    percentage,
    percentageColor: percentageColor(),
    strokeDashoffset,
  });
}

/**
 * Converts the severity number to a string
 * @param {int} severity severity number
 * @returns {string} The color string based on severity number (0 = success, 1 = warning, 2 = error)
 */
function severityString(severity: number) {
  const colors = ['success', 'warning', 'error'];

  return colors[severity];
}

/**
 * Get the color based on whether there are errors/warnings...
 * @param {int} totalErrors Total errors
 * @param {int} totalWarnings Total warnings
 * @returns {string} The color code (success = green, warning = yellow, error = red)
 */
function renderColor(totalErrors: number, totalWarnings: number) {
  if (totalErrors !== 0) {
    return severityString(2);
  }
  if (totalWarnings !== 0) {
    return severityString(1);
  }
  return severityString(0);
}

/**
 * Renders an issue
 * @param {object} message a message object with an issue
 * @returns {string} HTML string of an issue
 */
function renderOccurrence(message: {
  line: number;
  column: number;
  message: string;
}) {
  return occurrenceTemplate({
    lineNumber: message.line,
    column: message.column,
    message:
      message.message !== "Don't use intl" ? message.message : 'Intl Function',
  });
}

/**
 * Renders the source code for the files that have issues and marks the lines that have problems
 * @param {string} sourceCode source code string
 * @param {array} messages array of messages with the problems in a file
 * @param {int} parentIndex file index
 * @returns {string} HTML string of the code file that is being linted
 */
function renderSourceCode(
  sourceCode: any,
  messages: any[],
  parentIndex: number
) {
  return codeWrapperTemplate({
    parentIndex,
    sourceCode: _.map(sourceCode.split('\n'), (code, lineNumber) => {
      const lineMessages = _.filter(messages, { line: lineNumber + 1 });
      const severity = _.get(lineMessages[0], 'severity') || 0;

      let template = '';

      // checks if there is a problem on the current line and renders it
      if (!_.isEmpty(lineMessages)) {
        template += _.map(lineMessages, renderOccurrence).join('');
      }

      // adds a line of code to the template (with line number and severity color if appropriate
      template += codeTemplate({
        lineNumber: lineNumber + 1,
        code,
        status: severityString(severity),
      });

      return template;
    }).join('\n'),
  });
}

/**
 * Renders the result details with tabs for source code and a summary
 * @param {string} sourceCode source code string
 * @param {array} messages array of messages with the problems in a file
 * @param {int} parentIndex file index
 * @returns {string} HTML string of result details
 */
function renderResultDetails(
  sourceCode: string,
  messages: any[],
  parentIndex: number,
  internationalizedCount: number,
  notInternationalizedCount: number
) {
  // const topIssues = messages.length < 10 ? '' : _.groupBy(messages, 'severity');

  /* console.log({
		sourceCode, messages, parentIndex, internationalizedCount, notInternationalizedCount,
	}); */
  return resultDetailsTemplate({
    parentIndex,
    sourceCode: renderSourceCode(sourceCode, messages, parentIndex),
    detailSummary: resultSummaryTemplate({
      topIssues: '',
      internationalizedOccurrences: _.map(
        messages.filter(({ message }) => message === "Don't use intl"),
        renderOccurrence
      ).join(''),
      notInternationalizedOccurrences: _.map(
        messages.filter(({ message }) => message !== "Don't use intl"),
        renderOccurrence
      ).join(''),
      internationalizedCount,
      notInternationalizedCount,
      totalCount: internationalizedCount + notInternationalizedCount,
    }),
  });
}

/**
 * Formats the source code before adding it to the HTML
 * @param {string} sourceCode Source code string
 * @returns {string} Source code string which will not cause issues in the HTML
 */
function formatSourceCode(sourceCode: string) {
  return sourceCode.replace(/</g, '&#60;').replace(/>/g, '&#62;');
}

/**
 * Verify that the file is a fully internationalized
 * @param {number} internationalizedCount Count of internationalized occurrences.
 * @param {number} notInternationalizedCount Count of non-internationalized occurrences.
 * @returns {boolean} True if the file is fully internationalized.
 */
function isFullyInternationalized(notInternationalizedCount: number) {
  return notInternationalizedCount === 0;
}

/**
 * Creates the test results HTML
 * @param {Array} results Test results.
 * @param {String} currDir Current working directory
 * @returns {string} HTML string describing the results.
 */
function renderResults(results: any[], currDir: string) {
  return _.map(results, (result, index) => {
    const internationalizedCount = result.warningCount;
    const notInternationalizedCount = result.errorCount;
    const progress = Math.round(
      (internationalizedCount /
        (notInternationalizedCount + internationalizedCount)) *
        100
    );

    let template = resultTemplate({
      index,
      fileId: _.camelCase(result.filePath),
      filePath: result.filePath.replace(currDir, ''),
      color: renderColor(result.errorCount, result.warningCount),
      summary: renderSummary(result.errorCount, result.warningCount),
      problemCount: result.errorCount + result.warningCount,
      progress,
      rowColor: isFullyInternationalized(notInternationalizedCount)
        ? 'success'
        : 'error',
      internationalizedCount,
      notInternationalizedCount,
      zeroOccurrences: result.errorCount + result.warningCount === 0,
      totalCount: internationalizedCount + notInternationalizedCount,
    });

    // only renders the source code if there are issues present in the file
    if (!_.isEmpty(result.messages)) {
      // reads the file to get the source code if the source is not provided
      const sourceCode = formatSourceCode(
        result.source || fs.readFileSync(result.filePath, 'utf8')
      );

      template += renderResultDetails(
        sourceCode,
        result.messages,
        index,
        result.warningCount,
        result.errorCount
      );
    }

    return template;
  }).join('\n');
}

/**
 * Renders list of problem files
 * @param {array} files
 * @param {String} currDir Current working directory
 * @return {string} HTML string describing the files.
 */
function renderProblemFiles(files: any[], currDir: string) {
  return _.map(files, (fileDetails) =>
    filesTemplate({
      fileId: _.camelCase(fileDetails.filePath),
      filePath: fileDetails.filePath.replace(currDir, ''),
      errorCount: fileDetails.errorCount,
      warningCount: fileDetails.warningCount,
    })
  ).join('\n');
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

export default async function generateTemplate(
  results: ESLint.LintResult[],
  reporterSettings: ReporterSettings
) {
  const currWorkingDir = process.cwd() || '';
  const problemFiles = _(results)
    .reject({
      errorCount: 0,
      warningCount: 0,
    })
    .orderBy(['errorCount', 'warningCount'], ['desc', 'desc'])
    .take(5)
    .value(); // top five files with most problems

  let totalErrors = 0;
  let totalWarnings = 0;

  // Iterate over results to get totals
  results.forEach((result) => {
    totalErrors += result.errorCount;
    totalWarnings += result.warningCount;
  });

  return pageTemplate({
    title: reporterSettings.template.title,
    reportColor: renderColor(totalErrors, totalWarnings),
    reportSummary: renderSummary(totalErrors, totalWarnings),
    mostProblems: renderProblemFiles(problemFiles, currWorkingDir),
    results: renderResults(results, currWorkingDir),
    styles: styles(),
    scripts: scripts(),
  });
}
