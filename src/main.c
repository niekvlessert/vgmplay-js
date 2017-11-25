#include "../modules/vgmplay/VGMPlay/chips/mamedef.h"
#include <wchar.h>
#include "../modules/vgmplay/VGMPlay/stdbool.h"
#include "../modules/vgmplay/VGMPlay/VGMPlay.h"
#include "../modules/vgmplay/VGMPlay/VGMPlay_Intf.h"

extern UINT32 SampleRate;

int main(int argc, char *argv[]) {return 0;}

int FillBuffer2(INT16* Left, INT16* Right){
        WAVE_16BS sample_buffer[ 16384 ];
        FillBuffer(sample_buffer, 16384);
        for (int i = 0; i<16384; i++ ){
                Left[i]=sample_buffer[i].Left;
                Right[i]=sample_buffer[i].Right;
        }
        return 1;
}

int SetSampleRate(UINT32 _SampleRate){
	SampleRate = _SampleRate;
	return 1;
}
