var pitchShifter = (function () {

  // constractor
  var pitchShifter = function (ctx, audioBuffer) {
    this.audioContext = ctx;
    this.audioSources = [];
    this.pitchShifterProcessor;
    this.spectrumAudioAnalyser;
    this.sonogramAudioAnalyser;
    this.canvas;
    this.canvasContext;
    this.barGradient;
    this.waveGradient;

    this.spectrumFFTSizeNames = ['MP3 file', 'Microphone'];
    this.audioSourceIndex = 0;
    this.audioVisualisationNames = ['Spectrum', 'Wave', 'Sonogram'];
    this.audioVisualisationIndex = 0;
    this.validGranSizes = [256, 512, 1024, 2048, 4096, 8192];
    this.grainSize = this.validGranSizes[2];
    this.pitchRatio = 1.0;
    this.overlapRatio = 0.50;
    this.spectrumFFTSize = 128;
    this.spectrumSmoothing = 0.8;
    this.sonogramFFTSize = 512;
    this.sonogramSmoothing = 0;

    this.initAudio(audioBuffer);
    this.initProcessor();
  }

  var p = pitchShifter.prototype;

  p.hannWindow = function (length) {
    var window = new Float32Array(length);
    for (var i = 0; i < length; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
    }
    return window;
  };

  p.linearInterpolation = function (a, b, t) {
    return a + (b - a) * t;
  };

  p.initAudio = function (audioBuffer) {
    var self = this;
    if (!navigator.webkitGetUserMedia) {
      alert('Your browser does not support the Media Stream API');
    } else {
      navigator.webkitGetUserMedia(
        {audio: true, video: false},

        function (stream) {
          // this.spectrumFFTSize[1] = this.audioContext.createMediaStreamSource(stream);
        },

        function (error) {
          alert('Unable to get the user media');
        }
        );
    }

    this.spectrumAudioAnalyser = this.audioContext.createAnalyser();
    this.spectrumAudioAnalyser.fftSize = this.spectrumFFTSize;
    this.spectrumAudioAnalyser.smoothingTimeConstant = this.spectrumSmoothing;

    this.sonogramAudioAnalyser = this.audioContext.createAnalyser();
    this.sonogramAudioAnalyser.fftSize = this.sonogramFFTSize;
    this.sonogramAudioAnalyser.smoothingTimeConstant = this.sonogramSmoothing;

    // var bufferLoader = new BufferLoader(
    //   this.audioContext, ['idle.mp3'], function (bufferList) {
    //     self.audioSources[0] = self.audioContext.createBufferSource();
    //     self.audioSources[0].buffer = bufferList[0];
    //     self.audioSources[0].loop = true;
    //     self.audioSources[0].connect(self.pitchShifterProcessor);
    //     self.audioSources[0].start(0);
    //   }
    // );
  
    this.audioSources[0] = audioBuffer;
    // self.audioSources[0].buffer = audioBuffer.buffer;
    this.audioSources[0].loop = true;
  };

  p.initProcessor = function () {
    var self = this;
    if (this.pitchShifterProcessor) {
      this.pitchShifterProcessor.disconnect();
    }
    if (this.audioContext.createScriptProcessor) {
      this.pitchShifterProcessor = this.audioContext.createScriptProcessor(this.grainSize, 1, 1);
    } else if (this.audioContext.createJavaScriptNode) {
      this.pitchShifterProcessor = this.audioContext.createJavaScriptNode(this.grainSize, 1, 1);
    }

    this.pitchShifterProcessor.buffer = new Float32Array(this.grainSize * 2);
    this.pitchShifterProcessor.grainWindow = this.hannWindow(this.grainSize);

    this.audioSources[0].connect(this.pitchShifterProcessor);

    this.pitchShifterProcessor.onaudioprocess = function (event) {

      var inputData = event.inputBuffer.getChannelData(0);
      var outputData = event.outputBuffer.getChannelData(0);

      for (i = 0; i < inputData.length; i++) {

        // Apply the window to the input buffer
        inputData[i] *= this.grainWindow[i];

        // Shift half of the buffer
        this.buffer[i] = this.buffer[i + self.grainSize];
        // console.log(this.buffer[200])

        // Empty the buffer tail
        this.buffer[i + self.grainSize] = 0.0;
      }

      // Calculate the pitch shifted grain re-sampling and looping the input
      var grainData = new Float32Array(self.grainSize * 2);
      for (var i = 0, j = 0.0; i < self.grainSize; i++, j += self.pitchRatio) {

        var index = Math.floor(j) % self.grainSize;
        var a = inputData[index];
        var b = inputData[(index + 1) % self.grainSize];
        grainData[i] += self.linearInterpolation(a, b, j % 1.0) * this.grainWindow[i];
      }

      // Copy the grain multiple times overlapping it
      for (i = 0; i < self.grainSize; i += Math.round(self.grainSize * (1 - self.overlapRatio))) {
        for (j = 0; j <= self.grainSize; j++) {
          this.buffer[i + j] += grainData[j];
        }
      }

      // Output the first half of the buffer
      for (i = 0; i < self.grainSize; i++) {
        outputData[i] = this.buffer[i];
      }

    };
    
    this.pitchShifterProcessor.connect(this.spectrumAudioAnalyser);
    this.pitchShifterProcessor.connect(this.sonogramAudioAnalyser);
    this.pitchShifterProcessor.connect(this.audioContext.destination);
  };

  p.initSliders = function () {
    $("#this.pitchRatioSlider").slider({
      orientation: "horizontal",
      min: 0.5,
      max: 2,
      step: 0.01,
      range: 'min',
      value: this.pitchRatio,
      slide: function (event, ui) {

        this.pitchRatio = ui.value;
        $("#this.pitchRatioDisplay").text(this.pitchRatio);
      }
    });

    $("#this.overlapRatioSlider").slider({
      orientation: "horizontal",
      min: 0,
      max: 0.75,
      step: 0.01,
      range: 'min',
      value: this.overlapRatio,
      slide: function (event, ui) {

        this.overlapRatio = ui.value;
        $("#this.overlapRatioDisplay").text(this.overlapRatio);
      }
    });

    $("#this.grainSizeSlider").slider({
      orientation: "horizontal",
      min: 0,
      max: this.validGranSizes.length - 1,
      step: 1,
      range: 'min',
      value: this.validGranSizes.indexOf(this.grainSize),
      slide: function (event, ui) {

        this.grainSize = this.validGranSizes[ui.value];
        $("#this.grainSizeDisplay").text(this.grainSize);

        initProcessor();

        if (this.spectrumFFTSize[this.audioSourceIndex]) {
          this.spectrumFFTSize[this.audioSourceIndex].connect(this.pitchShifterProcessor);
        }
      }
    });

    $("#audioVisualisationSlider").slider({
      orientation: "horizontal",
      min: 0,
      max: this.audioVisualisationNames.length - 1,
      step: 1,
      value: this.audioVisualisationIndex,
      slide: function (event, ui) {

        this.audioVisualisationIndex = ui.value;
        $("#audioVisualisationDisplay").text(this.audioVisualisationNames[this.audioVisualisationIndex]);
      }
    });

    $("#this.spectrumFFTSizelider").slider({
      orientation: "horizontal",
      min: 0,
      max: this.spectrumFFTSizeNames.length - 1,
      step: 1,
      value: this.audioSourceIndex,
      slide: function (event, ui) {

        if (this.spectrumFFTSize[this.audioSourceIndex]) {
          this.spectrumFFTSize[this.audioSourceIndex].disconnect();
        }

        this.audioSourceIndex = ui.value;
        $("#audioSourceDisplay").text(this.spectrumFFTSizeNames[this.audioSourceIndex]);

        if (this.spectrumFFTSize[this.audioSourceIndex]) {
          this.spectrumFFTSize[this.audioSourceIndex].connect(this.pitchShifterProcessor);
        }
      }
    });

    $("#this.pitchRatioDisplay").text(this.pitchRatio);
    $("#this.overlapRatioDisplay").text(this.overlapRatio);
    $("#this.grainSizeDisplay").text(this.grainSize);
    $("#audioVisualisationDisplay").text(this.audioVisualisationNames[this.audioVisualisationIndex]);
    $("#audioSourceDisplay").text(this.spectrumFFTSizeNames[this.audioSourceIndex]);
  };

  p.initCanvas = function () {

    canvas = document.querySelector('canvas');
    canvasContext = canvas.getContext('2d');

    barGradient = canvasContext.createLinearGradient(0, 0, 1, canvas.height - 1);
    barGradient.addColorStop(0, '#550000');
    barGradient.addColorStop(0.995, '#AA5555');
    barGradient.addColorStop(1, '#555555');

    waveGradient = canvasContext.createLinearGradient(canvas.width - 2, 0, canvas.width - 1, canvas.height - 1);
    waveGradient.addColorStop(0, '#FFFFFF');
    waveGradient.addColorStop(0.75, '#550000');
    waveGradient.addColorStop(0.75, '#555555');
    waveGradient.addColorStop(0.76, '#AA5555');
    waveGradient.addColorStop(1, '#FFFFFF');
  };

  p.renderCanvas = function () {

    switch (this.audioVisualisationIndex) {

      case 0:

      var frequencyData = new Uint8Array(this.spectrumAudioAnalyser.frequencyBinCount);
      this.spectrumAudioAnalyser.getByteFrequencyData(frequencyData);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.fillStyle = barGradient;

      var barWidth = canvas.width / frequencyData.length;
      for (i = 0; i < frequencyData.length; i++) {
        var magnitude = frequencyData[i];
        canvasContext.fillRect(barWidth * i, canvas.height, barWidth - 1, -magnitude - 1);
      }

      break;

      case 1:

      var timeData = new Uint8Array(this.spectrumAudioAnalyser.frequencyBinCount);
      this.spectrumAudioAnalyser.getByteTimeDomainData(timeData);
      var amplitude = 0.0;
      for (i = 0; i < timeData.length; i++) {
        amplitude += timeData[i];
      }
      amplitude = Math.abs(amplitude / timeData.length - 128) * 5 + 1;

      var previousImage = canvasContext.getImageData(1, 0, canvas.width - 1, canvas.height);
      canvasContext.putImageData(previousImage, 0, 0);

      var axisY = canvas.height * 3 / 4;
      canvasContext.fillStyle = '#FFFFFF';
      canvasContext.fillRect(canvas.width - 1, 0, 1, canvas.height);
      canvasContext.fillStyle = waveGradient;
      canvasContext.fillRect(canvas.width - 1, axisY, 1, -amplitude);
      canvasContext.fillRect(canvas.width - 1, axisY, 1, amplitude / 2);

      break;

      case 2:

      frequencyData = new Uint8Array(this.sonogramAudioAnalyser.frequencyBinCount);
      this.sonogramAudioAnalyser.getByteFrequencyData(frequencyData);

      previousImage = canvasContext.getImageData(1, 0, canvas.width - 1, canvas.height);
      canvasContext.putImageData(previousImage, 0, 0);

      var bandHeight = canvas.height / frequencyData.length;
      for (var i = 0, y = canvas.height - 1; i < frequencyData.length; i++, y -= bandHeight) {

        var color = frequencyData[i] << 16;
        canvasContext.fillStyle = '#' + color.toString(16);
        canvasContext.fillRect(canvas.width - 1, y, 1, -bandHeight);
      }

      break;
    }

    window.requestAnimFrame(renderCanvas);
  };

  // return {

  //   init: function () {

  //     if ('AudioContext' in window) {
  //       audioContext = new AudioContext();
  //     } else {
  //       alert('Your browser does not support the Web Audio API');
  //       return;
  //     }

  //     initAudio();
  //     initProcessor();
  //     // initSliders();
  //     // initCanvas();

  //     window.requestAnimFrame(renderCanvas);
  //   }
  // }
  return pitchShifter;
}());

// window.requestAnimFrame = (function () {

//   return (window.requestAnimationFrame ||
//     window.webkitRequestAnimationFrame ||
//     window.mozRequestAnimationFrame ||
//     function (callback) {
//       window.setTimeout(callback, 1000 / 60);
//     });
// })();

// window.addEventListener("DOMContentLoaded", pitchShifter.init, true);
