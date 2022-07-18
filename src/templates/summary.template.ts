import fs from 'fs';
import path from 'path';
import _ from 'lodash';

const summaryTemplate = _.template(
  fs.readFileSync(path.join(__dirname, 'summary/summary-details.html'), 'utf-8')
);

export function renderSummaryTemplate(
  notInternationalizedCount: number,
  internationalizedCount: number
) {
  const percentage = Math.round(
    (internationalizedCount /
      (notInternationalizedCount + internationalizedCount)) *
      100
  );

  const percentageColor = () => {
    if (percentage >= 75) {
      return '#157F1F';
    }
    if (percentage >= 50) {
      return '#FBB13C';
    }
    return '#9E2B25';
  };

  const strokeDashoffset = Math.round((629 * percentage) / 100);

  return summaryTemplate({
    notInternationalizedCount,
    internationalizedCount,
    totalCount: notInternationalizedCount + internationalizedCount,
    percentage,
    percentageColor: percentageColor(),
    strokeDashoffset,
  });
}
