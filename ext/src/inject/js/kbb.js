if (self == top) {
  //console.log("not in iFrame");
  setInterval(function() {
    console.log('self == top');
    console.log('self  :', self.window.location.href);
    console.log('parent:', parent.window.location.href);
    console.log('top   :', top.window.location.href);
  }, 5000);
} else if (parent == top) {
  setInterval(function() {
    console.log('parent == top');
    console.log('self  :', self.window.location.href);
    console.log('parent:', parent.window.location.href);
    console.log('top   :', top.window.location.href);
  }, 5000);

  var bootstrap = document.createElement('script');
  bootstrap.type = 'text/javascript';
  bootstrap.src = chrome.extension.getURL('/src/inject/css/bootstrap.min.css');
  document.body.appendChild(bootstrap);

  var bootstrapTheme = document.createElement('script');
  bootstrapTheme.type = 'text/javascript';
  bootstrapTheme.src = chrome.extension.getURL('/src/inject/css/bootstrap-theme.min.css');
  document.body.appendChild(bootstrapTheme);

  //console.log("in iFrame");
  $('body').append(
    '<div id="loading"><div id="kbb-progress" class="progress" style="width: 250px;margin-left: 25px"><div class="progress-bar progress-bar-striped active"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Loading...</div></div></div>'
  );
  $('#kbb-frame').append();

  var port = chrome.runtime.connect({ name: 'kbb-port', });
  port.postMessage({ type: 'test', connection: 'Connected!', });

  var marketMeter = 'marketMeter';
  $(document).ready(function() {
    //console.log("document ready");
  });

  window.onload = function() {
    //console.log("kbb.js");
    marketMeter = $('#marketMeterCanvas');
    //console.log(marketMeter);

    $('body').css({
      'padding-left': '25px',
      'background-color': '#9fBDEf',
      'background-image': 'none',
      width: '250px',
      height: '280px',
    });
    $('body').html(marketMeter);
    //port.postMessage({type:"kbb-price", kbb_data: marketMeter.html()});
  };
}
