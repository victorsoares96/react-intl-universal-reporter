/* eslint-disable import/no-extraneous-dependencies */
import { Linter } from 'eslint';

export default {
  parser: '@typescript-eslint/parser',
  plugins: ['react-intl-universal'],
  rules: {
    'react-intl-universal/no-literal-string': 'error',
    'react-intl-universal/no-use-intl': 'warn',
  },
} as Linter.Config<Linter.RulesRecord>;
