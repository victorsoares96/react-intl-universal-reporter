export type Result = {
  /**
   * Number of occurrences of non-internationalized strings.
   */
  notInternationalizedCount: number;
  /**
   * Number of occurrences of internationalized strings.
   */
  internationalizedCount: number;
  /**
   * Percentage of occurrences of internationalized strings.
   */
  percentage: number;
};

export type Analyzer = {
  [key in
    | 'words'
    | 'jsx-components'
    | 'jsx-attributes'
    | 'callees'
    | 'object-properties'
    | 'class-properties']?: {
    include?: string[];
    exclude?: string[];
  };
} & {
  mode?: 'jsx-text-only' | 'jsx-only' | 'all';
  message?: string;
  'should-validate-template'?: boolean;
};

export type Template = {
  title: string;
};

export type ReporterSettings = {
  /**
   * A list of patterns to ignore.
   * @type {string[]}
   */
  ignorePatterns: string[];
  /**
   * Repository extensions to be watched.
   * @default ['ts', 'tsx', 'js', 'jsx']
   * @type {string[]}
   */
  extensions: string[];
  /**
   * The output directory to the generated report file.
   * @default './out'
   * @type {string}
   */
  outputDir: string;
  /**
   * Whether to print debug information.
   * @default false
   * @type {boolean}
   */
  debug: boolean;
  /**
   * The i18n analyzer rules settings.
   */
  analyzer: Analyzer;
  /**
   * The intl template settings.
   * @type {Template}
   */
  template: Template;
};

/**
 * Arguments
 * --source: The source path to the repository to be analyzed (required)
 * --config-file: The path to the config file
 */

export type CLIArguments = {
  '--source': string;
  '--config-file'?: string;
  '--extensions'?: string[];
};
