#!/bin/bash
#
# GitHub Repository Backup Setup Script for macOS
#
# This script sets up an automated backup system using launchd to run the backup
# script every 6 hours.
#

# Configuration variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
PLIST_FILE="$HOME/Library/LaunchAgents/com.bridgingtrust.github-backup.plist"
LOG_DIR="$HOME/logs/github-backup"
SOURCE_REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"  # Current project directory

# Error handling function
error_exit() {
  echo "ERROR: $1" >&2
  exit 1
}

# Check if script is running on macOS
if [[ "$(uname)" != "Darwin" ]]; then
  error_exit "This script is designed for macOS. For other operating systems, please refer to the documentation."
fi

# Check if source repository exists
if [ ! -d "$SOURCE_REPO" ]; then
  error_exit "Source repository not found at $SOURCE_REPO. Please make sure the path is correct."
fi

# Check if source repository is a git repository
if [ ! -d "$SOURCE_REPO/.git" ]; then
  error_exit "The source directory does not appear to be a git repository. Please make sure it's initialized with git."
fi

# Make backup script executable
chmod +x "$BACKUP_SCRIPT" || error_exit "Failed to make backup script executable"

# Create log directory
mkdir -p "$LOG_DIR" || error_exit "Failed to create log directory"

# Create the plist file with the backup job configuration
echo "Creating LaunchAgent plist file at $PLIST_FILE"
mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST_FILE" << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.bridgingtrust.github-backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>$BACKUP_SCRIPT</string>
    </array>
    <key>StartInterval</key>
    <integer>21600</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/launchd-error.log</string>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/launchd-output.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOL

# Load the LaunchAgent
echo "Loading LaunchAgent..."
launchctl unload "$PLIST_FILE" 2>/dev/null
launchctl load -w "$PLIST_FILE" || error_exit "Failed to load LaunchAgent"

echo "Success! GitHub backup system is now configured and running."
echo ""
echo "Useful commands:"
echo "  Check status: launchctl list | grep com.bridgingtrust.github-backup"
echo "  Stop backup:  launchctl unload \"$PLIST_FILE\""
echo "  Start backup: launchctl load -w \"$PLIST_FILE\""
echo "  Run manual backup: $BACKUP_SCRIPT"
echo ""
echo "Logs can be found in: $LOG_DIR"

exit 0 