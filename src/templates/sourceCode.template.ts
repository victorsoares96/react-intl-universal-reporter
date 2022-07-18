import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import { Occurrence } from '../types';
import { renderOccurrenceTemplate } from './occurrence.template';

const codeWrapperTemplate = _.template(
  fs.readFileSync(
    path.join(__dirname, 'details/code/code-wrapper.html'),
    'utf-8'
  )
);

const codeTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/code/code.html'), 'utf-8')
);

export function renderSourceCodeTemplate(
  sourceCode: string,
  occurrences: Array<Occurrence>,
  parentIndex: number
) {
  return codeWrapperTemplate({
    parentIndex,
    sourceCode: _.map(sourceCode.split('\n'), (code, lineNumber) => {
      const lineMessages = _.filter(occurrences, { line: lineNumber + 1 });
      const type = _.get(lineMessages[0], 'type');

      let template = '';

      // checks if there is a problem on the current line and renders it
      if (!_.isEmpty(lineMessages)) {
        template += _.map(lineMessages, renderOccurrenceTemplate).join('');
      }

      if (type === 'internationalized') {
        template += codeTemplate({
          lineNumber: lineNumber + 1,
          code,
          status: 'warning',
        });
      }

      if (type === 'not-internationalized') {
        template += codeTemplate({
          lineNumber: lineNumber + 1,
          code,
          status: 'error',
        });
      }

      if (!type) {
        template += codeTemplate({
          lineNumber: lineNumber + 1,
          code,
          status: 'success',
        });
      }

      return template;
    }).join('\n'),
  });
}
