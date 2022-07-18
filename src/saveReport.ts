import fs from 'fs';
import path from 'path';
import ora from 'ora';

export async function saveReport(
  outputDir: string,
  report: string,
  outputFormat: 'html' | 'xml'
) {
  const spinner = ora('Saving report').start();

  try {
    let reportName = `intl-report-${new Date().getTime()}`;

    if (outputFormat === 'xml') {
      reportName += '.xml';
    }

    if (outputFormat === 'html') {
      reportName += '.html';
    }

    if (!fs.existsSync(outputDir)) await fs.promises.mkdir(outputDir);

    const outputPath = path.join(outputDir, reportName);

    await fs.promises.writeFile(
      path.join(outputDir, reportName),
      report,
      'utf-8'
    );

    spinner.succeed(`Save report on ${outputPath}`);
  } catch (error: any) {
    spinner.fail(error);
    throw new Error(error);
  }
}
