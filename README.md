# vgmplay-js

Emscripten and a fairly recent version of Cmake are required to build this. Clone and build with:

```
git clone --recursive https://github.com/niekvlessert/vgmplay-js.git
cd vgmplay-js
cp ~/yrw801.rom files #for ymf278B support
mkdir build
cd build
emcmake cmake ..
make
cp vgmplay*.js /var/www/html/
cp ../vgmplay*.js /var/www/html/
cp ../index.html /var/www/html/
```
