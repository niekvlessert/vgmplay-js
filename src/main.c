#include "../modules/vgmplay/VGMPlay/chips/mamedef.h"
#include <wchar.h>
#include "../modules/vgmplay/VGMPlay/stdbool.h"
#include "../modules/vgmplay/VGMPlay/VGMPlay.h"
#include "../modules/vgmplay/VGMPlay/VGMPlay_Intf.h"

extern UINT32 SampleRate;
extern bool VGMEnd;
extern VGM_HEADER VGMHead;
extern UINT32 VGMMaxLoop;

int main(int argc, char *argv[]) {return 0;}

void FillBuffer2(INT16* Left, INT16* Right){
        WAVE_16BS sample_buffer[ 16384 ];
        FillBuffer(sample_buffer, 16384);
        for (int i = 0; i<16384; i++ ){
                Left[i]=sample_buffer[i].Left;
                Right[i]=sample_buffer[i].Right;
        }
}

void SetSampleRate(UINT32 _SampleRate){
	SampleRate = _SampleRate;
}

void SetLoopCount(UINT32 _LoopCount){
	VGMMaxLoop = _LoopCount;
}

int VGMEnded(void) {
	if (VGMEnd) return 1; else return 0;
}

int GetFileLength(VGM_HEADER* FileHead)
{
        UINT32 SmplCnt;
        // Note: SmplCnt is ALWAYS 44.1 KHz, VGM's native sample rate
        SmplCnt = FileHead->lngTotalSamples + FileHead->lngLoopSamples * (VGMMaxLoop - 0x01);

        return SmplCnt;
}

int GetTrackLength(void) {
        return SampleVGM2Playback(GetFileLength(&VGMHead));
}

int GetLoopPoint(void) {
        return SampleVGM2Playback(VGMHead.lngLoopSamples);
}

