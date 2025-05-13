#!/bin/bash
set -e

# Root paths
ROOT_DIR=$(pwd)
DIST_DIR="$ROOT_DIR/frontend/dist"
CUSTOM_DIR="$ROOT_DIR/custom"
BACKEND_DIR="$ROOT_DIR/backend"
PKG_JSON="$ROOT_DIR/package.json"

# Read version
VERSION=$(jq -r .version "$PKG_JSON")
RELEASE_NAME="life-tracker-v$VERSION"

# Output base directory
PARENT_DIR=$(dirname "$ROOT_DIR")
BUILD_BASE="$PARENT_DIR/LifeTrackerBuilds"
RELEASE_DIR="$BUILD_BASE/$RELEASE_NAME"
ZIP_NAME="$RELEASE_NAME.zip"

# Build frontend
npm run build

# Prepare directory
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# Copy frontend
cp -r "$DIST_DIR" "$RELEASE_DIR/frontend"

# Copy backend
cp -r "$BACKEND_DIR" "$RELEASE_DIR/backend"

# Copy user-editable content
cp -r "$CUSTOM_DIR" "$RELEASE_DIR/custom"

# Copy metadata
cp "$ROOT_DIR/README.md" "$PKG_JSON" "$RELEASE_DIR/"

# Create zip
cd "$BUILD_BASE"
zip -r "$ZIP_NAME" "$RELEASE_NAME" > /dev/null

echo "✅ Bundle ready:"
echo "📁 $RELEASE_DIR"
echo "📦 $BUILD_BASE/$ZIP_NAME"