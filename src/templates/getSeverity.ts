export function getSeverity(
  notInternationalizedCount: number,
  internationalizedCount: number
) {
  if (notInternationalizedCount !== 0) {
    return 'error';
  }
  if (internationalizedCount !== 0) {
    return 'warning';
  }
  return 'success';
}
