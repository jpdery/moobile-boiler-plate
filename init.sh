#!/bin/bash

# clean up
echo "Cleaning Up"
rm -rf documentation
rm -rf moobile-core
rm -rf moobile-psd
rm -rf moobile-simulator
rm -rf www/css/moobile.android.css
rm -rf www/css/moobile.ios.css
rm -rf www/css/moobile.css
rm -rf www/images/android
rm -rf www/images/ios
rm -rf www/js/libs/moobile-0.2.js
rm -rf www/js/libs/moobile-0.2.min.js

# install moobile-core
echo "Installing moobile-core"
git clone --recursive https://github.com/jpdery/moobile-core.git
rm -rf moobile-core/.git
cp moobile-core/Styles/moobile.css ./www/css
cp moobile-core/Styles/android/css/moobile.android.css ./www/css
cp moobile-core/Styles/ios/css/moobile.ios.css ./www/css
cp -R moobile-core/Styles/android/images/android ./www/images
cp -R moobile-core/Styles/ios/images/ios ./www/images

echo "Building moobile"
moobile-core/build > ./www/js/libs/moobile.js
java -jar yuicompressor-2.4.7.jar ../www/js/libs/moobile.js -o ../www/js/libs/moobile.min.js

# install moobile moobile-simulator
echo "Installing moobile-simulator"
git clone --recursive https://github.com/jpdery/moobile-simulator-2.git moobile-simulator
sed -i -e "s/\(</head>\)\(<script type=\"text/javascript\">Moobile.Simulator.setResourcePath\('resources'\); LocalStorage.set\('application', '../www/index.html'\);</script>)/g" moobile-simulator/index.html

# install psd
echo "Installing moobile-psd"
git clone --recursive https://github.com/jpdery/moobile-psd.git

# install documentation
echo "Installing documentaiton"
git clone --recursive https://github.com/jpdery/moobile-core-doc.git
cd moobile-core-doc
phing
cp -R output/latest ../documentation
cd ..