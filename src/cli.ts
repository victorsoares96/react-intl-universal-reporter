import { generateReport } from './generateReport';
import { generateResult } from './generateResult';
import { getArguments } from './getArguments';
import { getSettings } from './getSettings';
import { saveReport } from './saveReport';

(async () => {
  try {
    const args = getArguments(process.argv.slice(2));

    const source = args['--source'];
    const configFile = args['--config-file'];

    const settings = await getSettings(configFile);

    const results = await generateResult(
      source,
      settings,
      // ! The parameter in this function has been changed to json if the user wants to have the output in xml or js(json) if he uses this function outside the cli
      settings.outputFormat === 'html' ? 'json' : 'xml'
    );

    let report: string;

    if (settings.outputFormat === 'html') {
      report = await generateReport(results, settings);
      await saveReport(settings.outputDir, report, settings.outputFormat);
    }

    if (settings.outputFormat === 'xml') {
      report = String(results);
      await saveReport(settings.outputDir, report, settings.outputFormat);
    }
  } catch (error: any) {
    throw new Error(error);
  }
})();
