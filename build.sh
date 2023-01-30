#!/bin/bash
# A simple script
printf "Bundeling Extension\n"

# creating required folders
mkdirp build/css/minified build/javascript build/images build/menu

# bundling main/root malr files
cp -r menu javascript images background.js manifest.json build/
cleancss --batch --batch-suffix '.min' -o build/css/minified/ css/*.css css/themes/*.css
cd build/images
rm -rf temp github*.png
cd ../..

printf "Bundling Complete\n\n"

