#!/bin/bash
# A simple script
printf "Bundeling Extension\n"

# creating required folders
mkdirp build/css/minified build/javascript build/bbeditor build/images build/menu

# bundling main/root malr files
cp -r menu javascript images background.js manifest.json build/
cleancss --batch -o build/css/minified/ css/*.css css/themes/*.css
cd build/images
rm -rf temp github*.png
cd ../..

#bundling bbeditor files
cp -r bbeditor build/
cd build/bbeditor
minify jquery.wysibb.js > wysibb.min.js
cleancss --batch --batch-suffix '' theme/default/*.css
rm -rf lang preset jquery.*.js *.md *-MIT

printf "Bundling Complete\n\n"

