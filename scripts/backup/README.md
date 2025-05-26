# GitHub Repository Backup System

This system provides automated backups of your local Git repository to a GitHub backup repository. It creates complete backups of all branches and tags, ensuring you have a full copy of your repository stored securely in the cloud.

## Components

The backup system consists of the following components:

1. **`backup.sh`**: The main backup script that mirrors the repository and pushes to the backup repository.
2. **`setup_backup.sh`**: Setup script for configuring the automatic backup service on macOS.
3. **`helper.sh`**: Helper script with instructions for creating the backup repository and initial setup.

## Setup Instructions

### Prerequisites

- Git installed and configured
- macOS for automated backups via launchd (alternative instructions provided for other OSes)
- GitHub account with permissions to create repositories
- GitHub authentication configured (HTTPS or SSH)

### Setting Up the Backup System

1. **Create the backup repository**

   Run the helper script for step-by-step instructions:

   ```
   ./helper.sh
   ```

   In summary, create an empty repository named `BridgingTrustAISite-Backups` on GitHub.

2. **Verify your local repository**

   Make sure your local repository is properly initialized with Git:

   ```bash
   git status
   ```

   If it's not a Git repository, initialize it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Set up GitHub authentication**

   For HTTPS (simpler):

   - Configure credential helper: `git config --global credential.helper store`

   For SSH (more secure):

   - Generate SSH key if needed: `ssh-keygen -t ed25519 -C "your_email@example.com"`
   - Add the key to your SSH agent: `ssh-add ~/.ssh/id_ed25519`
   - Add to GitHub: Settings → SSH and GPG keys → New SSH key
   - Test connection: `ssh -T git@github.com`

4. **Run the setup script**

   Execute the setup script to configure and start the automated backups:

   ```
   ./setup_backup.sh
   ```

5. **Verify the setup**

   Run a manual backup to test:

   ```
   ./backup.sh
   ```

   Check your backup repository on GitHub to ensure all branches and tags were pushed correctly.

## How It Works

1. The backup script:

   - Creates a temporary directory
   - Clones your local repository
   - Adds the backup repository as a remote
   - Pushes your code to the backup repository
   - Cleans up the temporary directory
   - Logs all operations

2. The launchd service:
   - Runs the backup script every 6 hours
   - Starts automatically when you log in
   - Logs errors and output for troubleshooting

## Managing the Backup Service

### Checking Status

```bash
launchctl list | grep com.bridgingtrust.github-backup
```

### Stopping the Backup Service

```bash
launchctl unload ~/Library/LaunchAgents/com.bridgingtrust.github-backup.plist
```

### Starting the Backup Service

```bash
launchctl load -w ~/Library/LaunchAgents/com.bridgingtrust.github-backup.plist
```

### Running a Manual Backup

```bash
./backup.sh
```

## Troubleshooting

### Backup Failures

Check the logs in `~/logs/github-backup/` for error messages. Common issues include:

1. **Authentication failures**

   - For HTTPS: Check your stored credentials
   - For SSH: Ensure your SSH key is added to your GitHub account and SSH agent

2. **Repository issues**

   - Ensure your local repository is a valid Git repository
   - Check if the GitHub backup repository exists and is accessible

3. **Network issues**
   - Check your internet connection
   - Try the backup again later

### LaunchAgent Issues

If the scheduled backups aren't running:

1. Check the launchd logs:

   ```
   cat ~/logs/github-backup/launchd-error.log
   cat ~/logs/github-backup/launchd-output.log
   ```

2. Ensure the launchd plist is loaded:

   ```
   launchctl list | grep com.bridgingtrust.github-backup
   ```

3. Try unloading and reloading:
   ```
   launchctl unload ~/Library/LaunchAgents/com.bridgingtrust.github-backup.plist
   launchctl load -w ~/Library/LaunchAgents/com.bridgingtrust.github-backup.plist
   ```

## Customization

### Changing the Backup Frequency

To change how often backups run:

1. Edit the plist file:

   ```
   nano ~/Library/LaunchAgents/com.bridgingtrust.github-backup.plist
   ```

2. Modify the `StartInterval` value (in seconds):

   - 3600: every hour
   - 21600: every 6 hours (default)
   - 43200: every 12 hours
   - 86400: every day

3. Reload the LaunchAgent:
   ```
   launchctl unload ~/Library/LaunchAgents/com.bridgingtrust.github-backup.plist
   launchctl load -w ~/Library/LaunchAgents/com.bridgingtrust.github-backup.plist
   ```

### Using on Other Operating Systems

#### Linux (systemd)

1. Create a systemd service file:

   ```
   sudo nano /etc/systemd/system/github-backup.service
   ```

2. Add the following content:

   ```
   [Unit]
   Description=GitHub Repository Backup
   After=network.target

   [Service]
   Type=oneshot
   ExecStart=/path/to/backup.sh
   User=yourusername

   [Install]
   WantedBy=multi-user.target
   ```

3. Create a timer file:

   ```
   sudo nano /etc/systemd/system/github-backup.timer
   ```

4. Add the following content:

   ```
   [Unit]
   Description=Run GitHub backup every 6 hours

   [Timer]
   OnBootSec=5min
   OnUnitActiveSec=6h
   AccuracySec=1min

   [Install]
   WantedBy=timers.target
   ```

5. Enable and start the timer:
   ```
   sudo systemctl enable github-backup.timer
   sudo systemctl start github-backup.timer
   ```

## Security Considerations

- Keep the backup repository private
- Use SSH keys instead of HTTPS with stored credentials for better security
- Ensure log files don't contain sensitive information
