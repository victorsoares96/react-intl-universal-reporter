export type OccurrenceType = 'internationalized' | 'not-internationalized';

/**
 * The occurrence can have two types internationalized and non-internationalized.
 * The non-internationalized occurrence represents what is identified as wrong by the [no-literal-string](https://github.com/victorsoares96/eslint-plugin-react-intl-universal) rule.
 * The internationalized occurrence represents the pieces of code that match `intl.get` or `intl.getHTML`
 */
export type Occurrence = {
  /**
   * Indicates if the occurrence type is internationalized or not.
   * @see {@link OccurrenceType}
   */
  type: OccurrenceType;
  /**
   * The message returned by the rule.
   */
  message: string;
  /**
   * The line number of the occurrence.
   */
  line: number;
  /**
   * The end line number of the occurrence.
   */
  endLine: number;
  /**
   * The column number of the occurrence.
   */
  column: number;
  /**
   * The end column number of the occurrence.
   */
  endColumn: number;
};

export type Result = {
  /**
   * Path of the processed file.
   * @example 'src/components/App.tsx'
   */
  filePath: string;
  /**
   * List of internationalized(or not) occurrences found by the analysis.
   * @see {@link Occurrence}
   */
  occurrences: Array<Occurrence>;
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
  /**
   * Source code of the processed file.
   * @example 'import React from \'react\';\nimport { IntlProvider } from \'react-intl\';\nimport messages from \'./messages.json\';\n\nconst App = () => (\n  <IntlProvider locale="en" messages={messages}>\n    <div>Hello World</div>\n  </IntlProvider>\n);\n\nexport default App;'
   */
  source?: string;
};

export type Results = {
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
  /**
   * Detailed result of the analysis performed on each file.
   */
  results: Array<Result>;
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
   * The output format.
   */
  outputFormat: 'html' | 'xml';
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
};

export type ReportOptions = {
  /**
   * The report title
   */
  title: string;
};
