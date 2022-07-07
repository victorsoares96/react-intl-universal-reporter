import gulp from 'gulp';
import gulpESLintNew from 'gulp-eslint-new';
import path from 'path';
import fs from 'fs';
import ora from 'ora';
import generateTemplate from './templates/template-generator';
import eslintConfig from './eslint_config';
import { Analyzer, ReporterSettings } from './types';

export async function generateReport(
  files: string[],
  output: string,
  debug: boolean,
  analyzer: Analyzer,
  reporterSettings: ReporterSettings
): Promise<NodeJS.ReadWriteStream> {
  let filesProcessed = 0;
  const totalFiles = files.length;

  const spinner = ora('Generating report').start();
  return gulp
    .src(files)
    .pipe(
      gulpESLintNew({
        useEslintrc: false,
        allowInlineConfig: false,
        baseConfig: {
          ...eslintConfig,
          rules: {
            ...eslintConfig.rules,
            'react-intl-universal/no-literal-string': ['error', analyzer],
          },
        },
      })
    )
    .pipe(
      gulpESLintNew
        .format(
          (results) => generateTemplate(results, reporterSettings),
          (results) => {
            const reportName = `intl-report-${new Date().getTime()}.html`;
            if (!fs.existsSync(output)) fs.mkdirSync(output);
            fs.writeFileSync(path.join(output, reportName), results);
            spinner.succeed(
              `Generated report for ${totalFiles} files. See ${output}/${reportName}`
            );
          }
        )
        .on('data', (file) => {
          filesProcessed += 1;
          spinner.text = `Generating report (${filesProcessed}/${totalFiles})`;

          if (debug) {
            console.log(`\nFile processed: ${file.path}`);
          }
        })
    );
}
