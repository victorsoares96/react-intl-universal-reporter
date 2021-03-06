import fs from 'fs';
import path from 'path';
import glob from 'glob-promise';
import _ from 'lodash';
import ora from 'ora';
import { ReporterSettings } from './types';
import reporterDefaultSettings from './intlrc-default.json';

export async function getSettings(
  reporterSettingsPath?: string
): Promise<ReporterSettings> {
  try {
    const spinner = ora('Finding settings').start();

    if (reporterSettingsPath) {
      if (!fs.existsSync(reporterSettingsPath)) {
        spinner.fail(
          `Settings file not found from path: ${reporterSettingsPath}`
        );
      } else {
        spinner.info(`Using settings from ${reporterSettingsPath}`);
        const reporterSettings = await import(
          path.resolve(reporterSettingsPath)
        );

        return _.defaults(
          {},
          reporterSettings.default,
          reporterDefaultSettings
        );
      }
    }

    const files = await glob('**/.intlrc.{json,js}', {});

    if (_.isEmpty(files)) {
      spinner.warn('No .intlrc file found. Using default settings');
      return reporterDefaultSettings as ReporterSettings;
    }

    if (files.length > 1) {
      throw new Error('More than one .intlrc file found');
    }

    const [file] = files;
    spinner.info(`Using settings from ${file}`);
    const reporterSettings = await import(path.resolve(file));

    return _.defaults({}, reporterSettings.default, reporterDefaultSettings);
  } catch (error: any) {
    throw new Error(error);
  }
}
