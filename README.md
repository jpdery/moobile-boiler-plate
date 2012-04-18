# Moobile Boiler Plate

Provides all the required tools to build a Moobile app.

- Documentation
- Moobile Source
- Moobile iOS PSDs
- Simulator
- YUI Compressor
- Build scripts

## How to your app

From a terminal, use at the root of the project:

	www-src/build > www/js/app.js

## How to compress js files

From a terminal in the `tools` folder the project:

 java -jar yuicompressor-2.4.7.jar ../www/js/libs/moobile-0.1.js -o ../www/js/libs/moobile-0.1.min.js
 java -jar yuicompressor-2.4.7.jar ../www/js/app.js -o ../www/js/app.js