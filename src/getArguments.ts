import _ from 'lodash';
import { CLIArguments } from './types';

export function getArguments(args: string[]): CLIArguments {
  if (args.some((arg) => arg === '--help' || arg === '-h') || _.isEmpty(args)) {
    console.log('\nEx: intl-report --source ./repository');
    console.log('\nFlags:');
    console.log(
      '--source: The source path to the repository to be analyzed (required)'
    );
    console.log(
      '--config-file: The path to the config file. Default is used or .intlrc will be sought if not specified.'
    );
    process.exit(0);
  }

  const source = args.find((arg) => arg.startsWith('--source'));
  if (!source) {
    throw new Error('--source is required');
  }

  return Object.fromEntries(_.chunk(args, 2));
}
