#This will make the only changed needed on Vgmplay to make it work with Emscripten.
sed -i 's/\#ifdef VGM_LITTLE_ENDIAN/\#if defined\(VGM_LITTLE_ENDIAN\) \&\& \!defined\(EMSCRIPTEN\)/g' modules/vgmplay/VGMPlay/VGMPlay.c
