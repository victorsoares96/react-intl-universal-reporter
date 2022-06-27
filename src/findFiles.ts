import path from 'path';
import glob from 'glob-promise';

export async function findFiles(
  source: string,
  ignorePatterns: string[],
  extensions: string[],
  debug: boolean
): Promise<string[]> {
  const files = await glob(
    path.join(source, `**/*.{${extensions.join(',')}}`),
    { nodir: true, ignore: ignorePatterns }
  );

  if (debug) {
    console.log('DEBUG: Files to be analyzed:', files);
    console.log(`DEBUG: Total: ${files.length} files`);
  }

  return files;
}
