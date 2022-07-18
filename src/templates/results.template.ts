import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { Result } from '../types';
import { getSeverity } from './getSeverity';
import { renderSummaryTemplate } from './summary.template';
import { isFullyInternationalized } from './isFullyInternationalized';
import { formatSourceCode } from './formatSourceCode';
import { renderResultDetailsTemplate } from './resultsDetails.template';

const resultTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/result.html'), 'utf-8')
);

function renderResultTemplate(
  index: number,
  currentDir: string,
  result: Result
) {
  const {
    filePath,
    notInternationalizedCount,
    internationalizedCount,
    percentage,
    occurrences,
    source,
  } = result;

  let template = resultTemplate({
    index,
    fileId: _.camelCase(filePath),
    filePath: result.filePath.replace(currentDir, ''),
    color: getSeverity(notInternationalizedCount, internationalizedCount),
    summary: renderSummaryTemplate(
      notInternationalizedCount,
      internationalizedCount
    ),
    occurrencesCount: notInternationalizedCount + internationalizedCount,
    progress: percentage,
    rowColor: isFullyInternationalized(notInternationalizedCount)
      ? 'success'
      : 'error',
    internationalizedCount,
    notInternationalizedCount,
    zeroOccurrences: notInternationalizedCount + internationalizedCount === 0,
  });

  // only renders the source code if there are occurrences present in the file
  if (!_.isEmpty(occurrences)) {
    // reads the file to get the source code if the source is not provided
    const sourceCode = formatSourceCode(
      source || fs.readFileSync(filePath, 'utf8')
    );

    template += renderResultDetailsTemplate(
      sourceCode,
      occurrences,
      index,
      internationalizedCount,
      notInternationalizedCount
    );
  }

  return template;
}

export function renderResultsTemplate(results: Result[], currentDir: string) {
  return _.map(results, (result, index) =>
    renderResultTemplate(index, currentDir, result)
  ).join('\n');
}
