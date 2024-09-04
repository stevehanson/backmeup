import { Option, program } from 'commander';
import shell from 'shelljs';

const REMOTE_DRIVE = 'nas:/shares/shanson';

program
  .name('backmeup')
  .description('Sync files to and from the network drive!')
  .option('--dry-run')
  .addOption(
    new Option('-t, --to <local|REMOTE>', 'the destination')
      .default('remote')
      .choices(['local', 'remote'])
  )
  .addOption(
    new Option(
      '-p, --path <path>',
      'the local path, relative to home'
    ).conflicts('alias')
  )
  .addOption(
    new Option(
      '-d, --dest-path <path>',
      'the destination path to copy to, defaults to --path'
    ).conflicts('alias')
  )
  .addOption(
    new Option('-a, --alias <name>', 'backup with a proconfigured alias')
      .choices(['dropbox', 'drive'])
      .conflicts(['path', 'dest-path'])
  )
  .addHelpText(
    'afterAll',
    '\nOther useful commands include:\n' +
      '  ssh nas (connect to nas, can cd to /shares/shanson)\n' +
      '  ssh nas ls /shares/shanson/dev (view files on nas)'
  )
  .showHelpAfterError()
  .parse();

let { alias, path, destPath, to, dryRun } = program.opts();

const toRemote = to === 'remote';

if (!destPath) {
  destPath = path;
}

if (alias) {
  if (alias === 'dropbox') {
    const local = 'Dropbox (Personal)';
    const remote = 'Dropbox';

    path = toRemote ? local : remote;
    destPath = toRemote ? remote : local;
  } else if (alias === 'drive') {
    path = 'Drive';
    destPath = 'Drive';
  }
}

if (!path) {
  program.error('Path not specified. Must specify --path or --alias');
}

path = stripLeadingTrailingSlash(path);
destPath = stripLeadingTrailingSlash(destPath);

greet();

const owner = toRemote ? 'shanson' : '$USER';
const baseCommand = `rsync -azP --chown=${owner}`;
const excludes = getExcludes(path);
const dry = dryRun ? '--dry-run' : '';
const src = toRemote ? localPath(path) : remotePath(path);
const target = toRemote ? remotePath(destPath) : localPath(destPath);

const command = `${baseCommand} ${excludes} ${dry} "${src}" "${target}"`;

shell.echo(command);
shell.exec(command);

function greet() {
  console.log('Welcome to the backup utility!');
  if (dryRun) {
    console.log('------ DRY RUN MODE ------');
  }
  console.log('');
}

function getExcludes(path) {
  return path.startsWith('dev')
    ? "--exclude 'node_modules' --exclude 'tmp' --exclude '_un' --exclude 'temp' --exclude 'logs' --exclude 'Pods' --exclude 'build/' --exclude 'vendor/' --exclude '*.ipa'"
    : path.startsWith('Dropbox')
    ? "--exclude 'backup/'"
    : '';
}

function localPath(path) {
  return `$HOME/${path}/`;
}

function remotePath(path) {
  return `${REMOTE_DRIVE}/${path}/`;
}

function stripLeadingTrailingSlash(path) {
  return path
    .replace(`${process.env.HOME}/`, '')
    .replace(/\/$/, '')
    .replace(/^\//, '');
}
