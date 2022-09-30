import inquirer from "inquirer";
import shell from "shelljs";

const REMOTE_DRIVE = "nas:/shares/shanson";
const isDryRun = process.argv.some((arg) => arg.includes("dry"));
const isHelp = process.argv.some((arg) => arg.includes("help"));

console.log("Welcome to the backup utility!");

if (isDryRun) {
  console.log("------ DRY RUN MODE ------");
}
console.log(""); // new line

const usefulCommands =
  "Other useful commands include:\n" +
  "\tssh nas (connect to nas, can cd to /shares/shanson)\n" +
  "\tssh nas ls /shares/shanson/dev (view files on nas)";

if (isHelp) {
  console.log('Usage: "./backup.sh [help] [--dry-run]"');
  console.log(usefulCommands);
  process.exit(0);
}

inquirer
  .prompt([
    {
      name: "type",
      type: "checkbox",
      message: "What would you like to sync?",
      validate: (input) => {
        if (!input.length) {
          return "You must select at least one option";
        }

        return true;
      },
      choices: [
        { value: "dev", name: "~/dev" },
        { value: "dotfiles", name: "dotfiles" },
        { value: "dropbox", name: "Dropbox" },
      ],
    },
    {
      name: "destination",
      type: "list",
      message: "Where would you like to sync to?",
      choices: [
        { value: "drive", name: "Shared drive (Back up)" },
        { value: "local", name: "Local (Sync from backup)" },
      ],
    },
    {
      name: "subdirectory",
      type: "input",
      when: (answers) => answers.type.length === 1,
      message:
        "Limit to subdirectory (type here without leading or trailing slashes?)",
    },
  ])
  .then((answers) => {
    runBackups(answers);
  })
  .catch((error) => {
    console.error(error);
  });

function runBackups(answers) {
  const backupMessage =
    answers.destination === "drive" ? "to remote drive" : "to local drive";

  if (answers.type.includes("dev")) {
    logOperation(`Performing backup of dev directory ${backupMessage}.`);
    runBackup(answers, "dev", "dev");
  }

  if (answers.type.includes("dotfiles")) {
    logOperation(`Performing backup of dotfiles directory ${backupMessage}.`);
    runBackup(answers, "dotfiles", "dotfiles");
  }

  if (answers.type.includes("dropbox")) {
    logOperation(`Performing backup of dotfiles directory ${backupMessage}.`);
    runBackup(answers, "Dropbox (Personal)", "Dropbox");
  }

  if (answers.type.includes("Drive")) {
    logOperation(`Performing backup of Drive directory ${backupMessage}.`);
    runBackup(answers, "Drive", "Drive");
  }
}

function runBackup(answers, localPath, remotePath) {
  const baseCommand = "rsync -arv";
  const excludes = remotePath.includes("dev")
    ? "--exclude 'node_modules/*' --exclude 'tmp' --exclude 'temp' --exclude 'logs' --exclude 'Pods/*' --exclude 'build/*' --exclude '*.ipa'"
    : remotePath.includes("Dropbox")
    ? "--exclude 'backup/*'"
    : "";

  const isBackup = answers.destination === "drive";

  const subdirectory = answers.subdirectory ? `${answers.subdirectory}/` : "";
  const fullRemotePath = `${REMOTE_DRIVE}/${remotePath}/${subdirectory}`;
  const fullLocalPath = `$HOME/${localPath}/${subdirectory}`;
  const from = isBackup ? fullLocalPath : fullRemotePath;
  const to = isBackup ? fullRemotePath : fullLocalPath;
  const command = `${baseCommand} ${excludes} "${from}" "${to}"`;

  console.log(command);
  if (!isDryRun) {
    shell.exec(command);
  }
}

function logOperation(message) {
  console.log(`\n---- ${message} ----\n`);
}
