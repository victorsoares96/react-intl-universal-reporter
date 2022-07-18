import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import { Occurrence } from '../types';
import { renderSourceCodeTemplate } from './sourceCode.template';
import { renderOccurrenceTemplate } from './occurrence.template';

const resultDetailsTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/details.html'), 'utf-8')
);

const resultSummaryTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/summary.html'), 'utf-8')
);

export function renderResultDetailsTemplate(
  sourceCode: string,
  occurrences: Array<Occurrence>,
  parentIndex: number,
  internationalizedCount: number,
  notInternationalizedCount: number
) {
  return resultDetailsTemplate({
    parentIndex,
    sourceCode: renderSourceCodeTemplate(sourceCode, occurrences, parentIndex),
    detailSummary: resultSummaryTemplate({
      topIssues: '',
      internationalizedOccurrences: _.map(
        occurrences.filter(({ type }) => type === 'internationalized'),
        renderOccurrenceTemplate
      ).join(''),
      notInternationalizedOccurrences: _.map(
        occurrences.filter(({ type }) => type === 'not-internationalized'),
        renderOccurrenceTemplate
      ).join(''),
      internationalizedCount,
      notInternationalizedCount,
      totalCount: internationalizedCount + notInternationalizedCount,
    }),
  });
}
