'use strict';

class VGMPlay {

	constructor() {
		this.VGMPlay_Init = Module.cwrap('VGMPlay_Init');
		this.VGMPlay_Init2 = Module.cwrap('VGMPlay_Init2');
	        this.FillBuffer = Module.cwrap('FillBuffer2','number',['number','number']);
	        this.OpenVGMFile = Module.cwrap('OpenVGMFile','number',['string']);
	        this.CloseVGMFile = Module.cwrap('CloseVGMFile');
		this.PlayVGM = Module.cwrap('PlayVGM');
	        this.StopVGM = Module.cwrap('StopVGM');
	        this.VGMEnded = Module.cwrap('VGMEnded');
	        this.GetTrackLength = Module.cwrap('GetTrackLength');
	        this.GetLoopPoint = Module.cwrap('GetLoopPoint');
	        this.SeekVGM = Module.cwrap('SeekVGM','number',['number','number']);
		this.SetSampleRate = Module.cwrap('SetSampleRate','number',['number']);
		this.SetLoopCount = Module.cwrap('SetLoopCount','number',['number']);
		this.SamplePlayback2VGM = Module.cwrap('SamplePlayback2VGM','number',['number']);

		this.dataPtr0 = Module._malloc(16384*2);
		this.dataPtr1 = Module._malloc(16384*2);
		this.dataHeap0 = new Int16Array(Module.HEAPU8.buffer, this.dataPtr0, 16384);
		this.dataHeap1 = new Int16Array(Module.HEAPU8.buffer, this.dataPtr1, 16384);
	}
	
	initialise (loopCount, sampleRate) {
		this.sampleRate = sampleRate;
		this.loopCount = loopCount;

		this.VGMPlay_Init();
		if (this.sampleRate) this.SetSampleRate(this.sampleRate);
		if (this.loopCount) this.SetLoopCount(this.loopCount); else this.loopCount = 2;
		this.VGMPlay_Init2();

		this.initialised = true;
	}

	setLoopCount (loopCount) {
		this.loopCountSetter = loopCount;
		
		if (this.loopCount !== this.loopCountSetter) {
			this.loopCount = this.loopCountSetter;
			this.SetLoopCount(this.loopCount);
		}
	}

	load (fileName) {
		this.fileName = fileName;
		
		if (!this.initialised) this.initialise();

		this.OpenVGMFile(fileName);
	}

	loadURL (url, playIt, callbackPlaybackStarted, callbackTrackEnd) {

		this.playIt = playIt;
		this.callbackPlaybackStarted = callbackPlaybackStarted;
		this.callbackTrackEnd = callbackTrackEnd;

		this.stop();

		try {
			FS.unlink("url.vgm");
		}catch(err) {}

		var xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";

		const classContext = this;

		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {
				var arrayBuffer = xhr.response;
				//alert(xhr.responseText);
				var byteArray = new Uint8Array(arrayBuffer);
				FS.createDataFile("/", "url.vgm", byteArray, true, true);
				classContext.load("url.vgm");
				if (classContext.playIt) classContext.play();
				if (classContext.callbackPlaybackStarted) classContext.callbackPlaybackStarted();
			}
		}
		xhr.open('GET', url, true);
		xhr.send(null);
	}

	play () {
		this.isPaused = false;
		if (this.isPlaying) this.StopVGM(); else this.isPlaying = true;
		this.PlayVGM();
		this.trackLength = this.GetTrackLength()/44100;
	}

	getTrackInfo () {
		this.trackLength = Math.floor(this.GetTrackLength()/44100);
		this.loopPoint = Math.floor(this.GetLoopPoint()/44100);
		this.initialLength = Math.floor(this.trackLength-((this.loopCount-1)*this.loopPoint));
		this.trackInfo = {trackLength:this.trackLength, loopPoint:this.loopPoint, loopCount:this.loopCount, initialLength:this.initialLength};
		return this.trackInfo;
		//return [this.trackLength, this.loopPoint, this.loopCount, this.initialLength];
	}


	stop () {
		if (this.isPlaying) {
			this.StopVGM();
			this.CloseVGMFile();
			this.isPlaying = false;
		}
	}

	generateWave () {}

	getAudioBuffer () {
        	this.FillBuffer(this.dataHeap0.byteOffset, this.dataHeap1.byteOffset);
		this.result = new Int16Array(this.dataHeap0.buffer, this.dataHeap0.byteOffset, 16384);
		/*this.output = new Float32Array();
		for (var i = 0; i < 16384; i++) {
                        //output[i] = Math.random();
                        this.output[i] = this.result[i] / 32768;
			//if (this.output[i] !==0) console.log(this.output[i]);
                }*/
		return this.result;
	}
	seek (seconds) {
		this.SeekVGM(0,this.SamplePlayback2VGM(seconds*44100));
	}
	
}

class VGMPlay_WebAudio extends VGMPlay { 

	constructor() {
		super();

		this.context = new AudioContext();
		this.destination = this.destination || this.context.destination;
		this.sampleRate = this.context.sampleRate;
		this.node = this.context.createScriptProcessor(16384, 2, 2);
	}

	initialise(loopCount, sampleRate) {
		this.argSampleRate = sampleRate;
		this.loopCount = loopCount;

		this.VGMPlay_Init();
		if (this.argSampleRate && this.sampleRate !== this.argSampleRate) this.SetSampleRate(this.argSampleRate);
		else {
			if (this.sampleRate !== 44100) this.SetSampleRate(this.sampleRate);
		}
		if (this.loopCount) this.SetLoopCount(this.loopCount); else this.loopCount = 2;
		this.VGMPlay_Init2();
			
		this.initialised = true;
	}

	createWebAudio () {
		this.context = new AudioContext();
		this.destination = this.destination || this.context.destination;
		this.sampleRate = this.context.sampleRate;
		this.node = this.context.createScriptProcessor(16384, 2, 2);
		this.noContext = false;
	}

	play () {
		if (this.noContext) this.createWebAudio();

		this.node.connect(this.context.destination);

		this.isPaused = false;

		if (this.isPlaying) {
			this.StopVGM();
		} else {
			this.isPlaying = true;
		}
		this.PlayVGM();
		this.trackLength = this.GetTrackLength();

		this.playAudio();
	}

	playAudio () {
		const classContext = this;

		this.node.onaudioprocess = function (e) {
			this.output0 = e.outputBuffer.getChannelData(0);
			this.output1 = e.outputBuffer.getChannelData(1);
			if (classContext.VGMEnded()) {
				classContext.node.disconnect(classContext.context.destination);
				classContext.stop();
				if (classContext.callbackTrackEnd) classContext.callbackTrackEnd();
			}
			classContext.FillBuffer(classContext.dataHeap0.byteOffset, classContext.dataHeap1.byteOffset);
			this.result0 = new Int16Array(classContext.dataHeap0.buffer, classContext.dataHeap0.byteOffset, 16384);
			this.result1 = new Int16Array(classContext.dataHeap1.buffer, classContext.dataHeap1.byteOffset, 16384);
			for (var i = 0; i < 16384; i++) {
				this.output0[i] = this.result0[i] / 32768;
				this.output1[i] = this.result1[i] / 32768;
			}
		};
	}

	stopAudio () {
		if (!this.noContext) {
			if (!this.isPaused) this.node.disconnect(this.context.destination);
			this.context.close();
			this.noContext = true;
			this.isPaused = true;
		}
	}
	
	togglePause () {
		if (this.isPlaying) {
			if (!this.isPaused) {
				this.node.disconnect(this.context.destination);
				this.isPaused = true;
			} else {
				if (this.noContext) {
					this.createWebAudio();
					this.node.connect(this.context.destination);
					this.playAudio();
				} else {
					this.node.connect(this.context.destination);
				}
				this.isPaused = false;
			}
		}
	}
}
