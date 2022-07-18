import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import { renderSummaryTemplate } from './templates/summary.template';

import { ReporterSettings, Results } from './types';
import { renderResultsTemplate } from './templates/results.template';

const pageTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'templates', 'main-page.html'), 'utf-8')
);

const styles = _.template(
  fs.readFileSync(path.join(__dirname, 'helpers/styles.html'), 'utf-8')
);

const scripts = _.template(
  fs.readFileSync(path.join(__dirname, 'helpers/scripts.html'), 'utf-8')
);

export async function generateReport(
  result: Results,
  config: ReporterSettings
) {
  const { template } = config;

  const { internationalizedCount, notInternationalizedCount, results } = result;

  const currentDir = process.cwd() || '';

  return pageTemplate({
    title: template.title,
    reportSummary: renderSummaryTemplate(
      notInternationalizedCount,
      internationalizedCount
    ),
    results: renderResultsTemplate(results, currentDir),
    styles: styles(),
    scripts: scripts(),
  });
}
