#!/bin/bash
echo "Running GitHub repo initialization..."
gh repo view herculeanfit1/BridgingTrustAISite-Backups && echo "Repo exists" || echo "Please create the repository on GitHub"
