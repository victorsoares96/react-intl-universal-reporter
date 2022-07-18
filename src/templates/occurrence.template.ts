import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { Occurrence } from '../types';

const occurrenceTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'details/code/occurrence.html'), 'utf-8')
);

export function renderOccurrenceTemplate({
  line,
  column,
  type,
  message,
}: Occurrence) {
  return occurrenceTemplate({
    lineNumber: line,
    column,
    message: type === 'not-internationalized' ? message : 'Intl Function',
  });
}
