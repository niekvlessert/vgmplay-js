# vgmplay-js

Emscripten is required to build this. Clone and build with:

```
git clone --recursive https://github.com/niekvlessert/vgmplay-js.git
./fix_vgmplay.sh
mkdir build
cd build
emcmake cmake ..
mkdir files #put some vgm files in the directory like this... 1.vgm, 2.vgm etc.
make
cp vgmplay* /var/www/html/
cp index.html /var/www/html/
```
