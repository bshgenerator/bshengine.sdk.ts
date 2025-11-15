#!/bin/bash

# Script to update all demo projects with the latest build of the main package
# This script:
# 1. Builds the main package
# 2. Updates dependencies in each demo directory

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Updating demos with latest build...${NC}\n"

# Get the root directory of the project (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

# Step 1: Build the main package
echo -e "${YELLOW}📦 Building main package...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Aborting demo update.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Main package built successfully${NC}\n"

# Step 2: Find and update all demo directories
DEMO_DIR="$ROOT_DIR/demo"

if [ ! -d "$DEMO_DIR" ]; then
    echo -e "${YELLOW}⚠️  No demo directory found.${NC}"
    exit 0
fi

# Process each subdirectory in demo/
for DEMO_SUBDIR in "$DEMO_DIR"/*; do
    if [ -d "$DEMO_SUBDIR" ] && [ -f "$DEMO_SUBDIR/package.json" ]; then
        DEMO_NAME=$(basename "$DEMO_SUBDIR")
        echo -e "${BLUE}📝 Updating demo: ${DEMO_NAME}${NC}"
        
        cd "$DEMO_SUBDIR"
        
        # Install/update dependencies
        npm install
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ ${DEMO_NAME} updated successfully${NC}\n"
        else
            echo -e "${RED}❌ Failed to update ${DEMO_NAME}${NC}\n"
            exit 1
        fi
    fi
done

echo -e "${GREEN}🎉 All demos updated successfully!${NC}"

