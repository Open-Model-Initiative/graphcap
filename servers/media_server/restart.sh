#!/bin/sh
# SPDX-License-Identifier: Apache-2.0

# Simple script to restart the media server
echo "Restarting media server..."
pkill -f "node.*server.js" || true
npm run dev 