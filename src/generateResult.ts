import gulp from 'gulp';
import gulpESLintNew from 'gulp-eslint-new';
import ora from 'ora';
import eslintConfig from './eslint_config';
import { Result } from './types';
import { findFiles } from './findFiles';
import { getSettings } from './getSettings';

export async function generateResult(
  source: string,
  configFile?: string
): Promise<Result> {
  let filesProcessed = 0;

  const reporterSettings = await getSettings(configFile);

  const files = await findFiles(
    source,
    reporterSettings.ignorePatterns,
    reporterSettings.extensions,
    reporterSettings.debug
  );

  const totalFiles = files.length;

  const spinner = ora('Generating results').start();

  return new Promise((resolve, reject) => {
    gulp
      .src(files)
      .pipe(
        gulpESLintNew({
          useEslintrc: false,
          allowInlineConfig: false,
          baseConfig: {
            ...eslintConfig,
            rules: {
              ...eslintConfig.rules,
              'react-intl-universal/no-literal-string': [
                'error',
                reporterSettings.analyzer,
              ],
            },
          },
        })
      )
      .pipe(
        gulpESLintNew
          .format(
            (results) => {
              let notInternationalizedCount = 0;
              let internationalizedCount = 0;

              results.forEach(({ errorCount, warningCount }) => {
                notInternationalizedCount += errorCount;
                internationalizedCount += warningCount;
              });

              const percentage = Math.round(
                (internationalizedCount /
                  (notInternationalizedCount + internationalizedCount)) *
                  100
              );

              return {
                notInternationalizedCount,
                internationalizedCount,
                percentage,
              } as any;
            },
            (results) => {
              resolve(results as unknown as Result);
              spinner.succeed(`Finish! ${totalFiles} files processed`);
            }
          )
          .on('data', () => {
            filesProcessed += 1;
            spinner.text = `Generating result (${filesProcessed}/${totalFiles})`;
          })
          .on('error', (err) => {
            spinner.fail(`Error: ${err}`);
            reject(err);
          })
      );
  });
}
