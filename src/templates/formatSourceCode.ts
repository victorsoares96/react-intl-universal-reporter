export function formatSourceCode(sourceCode: string) {
  return sourceCode.replace(/</g, '&#60;').replace(/>/g, '&#62;');
}
