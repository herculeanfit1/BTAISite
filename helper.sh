#!/bin/bash
#
# GitHub Repository Backup Helper Script
#
# This script provides guidance for setting up the GitHub backup system.
#

cat << 'EOT'
#######################################################
#  GitHub Repository Backup System - Helper Guide      #
#######################################################

STEP 1: Create the backup repository on GitHub
----------------------------------------------
1. Log in to your GitHub account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name the repository "BridgingTrustAISite-Backups"
4. Set it to Private (recommended)
5. DO NOT initialize with README, .gitignore, or license
6. Click "Create repository"

STEP 2: Ensure your local repository is properly set up
------------------------------------------------------
1. Make sure your local repository at ~/OneDrive/BridgingTrustAI/BTAI-Website is initialized with git
   $ cd ~/OneDrive/BridgingTrustAI/BTAI-Website
   $ git status
   
   If this returns an error, initialize the repository:
   $ git init
   $ git add .
   $ git commit -m "Initial commit"

STEP 3: Set up authentication
----------------------------
For SSH repositories (recommended):
1. If you haven't already, generate an SSH key:
   $ ssh-keygen -t ed25519 -C "your_email@example.com"
   
2. Add the key to your SSH agent:
   $ eval "$(ssh-agent -s)"
   $ ssh-add ~/.ssh/id_ed25519
   
3. Add the public key to your GitHub account:
   - Copy the public key: $ cat ~/.ssh/id_ed25519.pub
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your key and save

4. Test your SSH connection:
   $ ssh -T git@github.com
   
   You should see a message like: "Hi username! You've successfully authenticated..."

STEP 4: Run the setup script
---------------------------
Run the setup script to configure and start the automated backups:

$ ./setup_backup.sh

This will:
- Verify your local repository exists and is a git repository
- Create a launchd service that runs every 6 hours
- Start the backup service
- Set it to start automatically on login

STEP 5: Verify the backup is working
-----------------------------------
Run a manual backup to verify everything is working:

$ ./backup.sh

Then check the backup repository on GitHub to ensure all branches and tags were pushed correctly.

#######################################################
EOT

echo "The guide above provides instructions for setting up the GitHub backup system."
echo "For more detailed information, refer to README.md in the scripts/backup directory." 