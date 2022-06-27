import _ from 'lodash';
import ora from 'ora';
import { findFiles } from './findFiles';
import { generateReport } from './generateReport';
import { getArguments } from './getArguments';
import { getSettings } from './getSettings';

(async () => {
  const spinner = ora('Finding files').start();
  try {
    const args = getArguments(process.argv.slice(2));

    const reporterSettings = await getSettings(args['--config-file']);

    const files = await findFiles(
      args['--source'],
      reporterSettings.ignorePatterns,
      reporterSettings.extensions,
      reporterSettings.debug
    );
    spinner.succeed(`Found ${files.length} files`);

    if (_.isEmpty(files)) {
      spinner.fail('No files found!');
      process.exit(0);
    }

    generateReport(
      files,
      reporterSettings.outputDir,
      reporterSettings.debug,
      reporterSettings.analyzer,
      reporterSettings
    );
  } catch (error: any) {
    spinner.stop();
    throw new Error(error);
  }
})();
