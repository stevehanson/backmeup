# Backup utility

This is designed specifically for me but could be adapted by others if interested. I use this simple utility to sync files back and forth to my network drive.

Usage:

```
Usage: backmeup [options]

Sync files to and from the network drive!

Options:
  --dry-run
  -t, --to <local|REMOTE>  the destination (choices: "local", "remote", default: "remote")
  -p, --path <path>        the local path, relative to home
  -d, --dest-path <path>   the relative destination path to copy to/from, defaults to --path
  -a, --alias <name>       backup with a proconfigured alias (choices: "dropbox", "drive")
  -h, --help               display help for command
```
