function AudioBufferLoader() {
  this.bufferLoader;
  this.context = new webkitAudioContext();

  var urls = [];
  var finishedLoading;

  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] == "function"){
      finishedLoading = arguments[arguments.length -1]; // コールバック取得
    } else {
      urls.push(arguments[i]);
    }
  }

  this.bufferLoader = new BufferLoader(this.context, urls, finishedLoading);
  this.bufferLoader.load();


  /*デフォルトコールバック*/
  // function finishedLoading() {
  //   var self = this;
  //   // Create two sources and play them both together.
  //   var source1 = self.context.createBufferSource();
  //   var source2 = self.context.createBufferSource();
  //   source1.buffer = self.bufferList[0];
  //   source2.buffer = self.bufferList[1];

  //   source1.connect(self.context.destination);
  //   source2.connect(self.context.destination);
  //   source1.start();
  //   source2.start();
  // }

};



function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}