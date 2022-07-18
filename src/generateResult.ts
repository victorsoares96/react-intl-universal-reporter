import gulp from 'gulp';
import gulpESLintNew from 'gulp-eslint-new';
import ora from 'ora';
import _ from 'lodash';
import { toXML } from 'jstoxml';
import eslintConfig from './eslint_config';
import { Occurrence, ReporterSettings, Results } from './types';
import { findFiles } from './findFiles';
import { getSettings } from './getSettings';

export async function generateResult(
  source: string,
  config?: string | ReporterSettings,
  outputFormat?: 'json' | 'xml'
): Promise<Results> {
  let filesProcessed = 0;

  let reporterSettings: ReporterSettings;

  if (config) {
    if (typeof config === 'string') {
      reporterSettings = await getSettings(config);
    } else {
      reporterSettings = config;
    }
  } else {
    reporterSettings = await getSettings();
  }

  const spinner = ora('Finding files').start();

  const files = await findFiles(
    source,
    reporterSettings.ignorePatterns,
    reporterSettings.extensions,
    reporterSettings.debug
  );

  if (_.isEmpty(files)) {
    spinner.fail('No files found!');
    process.exit(0);
  }

  const totalFiles = files.length;

  spinner.succeed(`Found ${totalFiles} files`);

  spinner.start('Analyzing files');

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

              const result: Results = {
                notInternationalizedCount,
                internationalizedCount,
                percentage,
                results: results.map(
                  ({
                    filePath,
                    messages,
                    errorCount,
                    warningCount,
                    source: fileSource,
                  }) => {
                    const filePercentage = Math.round(
                      (warningCount / (errorCount + warningCount)) * 100
                    );
                    return {
                      filePath,
                      occurrences: messages.map(
                        ({
                          ruleId,
                          line,
                          endLine,
                          column,
                          endColumn,
                          message,
                        }) =>
                          ({
                            type:
                              ruleId ===
                              'react-intl-universal/no-literal-string'
                                ? 'not-internationalized'
                                : 'internationalized',
                            line,
                            endLine,
                            column,
                            endColumn,
                            message,
                          } as Occurrence)
                      ),
                      notInternationalizedCount: errorCount,
                      internationalizedCount: warningCount,
                      percentage: filePercentage,
                      source: fileSource,
                    };
                  }
                ),
              };
              return result as any;
            },
            (results) => {
              if (outputFormat === 'xml') {
                resolve(
                  toXML(
                    { intl: { results } },
                    { indent: '    ', header: true }
                  ) as any
                );
              } else resolve(results as unknown as Results);
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
