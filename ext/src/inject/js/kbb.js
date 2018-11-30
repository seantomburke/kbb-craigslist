if (window.self === window.top) {
  // console.log('not in iFrame');
  setInterval(() => {
    console.log('self == top');
    console.log('self  :', window.self.window.location.href);
    console.log('parent:', window.parent.window.location.href);
    console.log('top   :', window.top.window.location.href);
  }, 5000);
} else if (window.parent === window.top) {
  setInterval(() => {
    console.log('parent == top');
    console.log('self  :', window.self.window.location.href);
    console.log('parent:', window.parent.window.location.href);
    console.log('top   :', window.top.window.location.href);
  }, 5000);

  const bootstrap = document.createElement('script');
  bootstrap.type = 'text/javascript';
  bootstrap.src = chrome.extension.getURL('/src/inject/css/bootstrap.min.css');
  document.body.appendChild(bootstrap);

  const bootstrapTheme = document.createElement('script');
  bootstrapTheme.type = 'text/javascript';
  bootstrapTheme.src = chrome.extension.getURL('/src/inject/css/bootstrap-theme.min.css');
  document.body.appendChild(bootstrapTheme);

  // console.log('in iFrame');
  $('body').append(
    '<div id="loading"><div id="kbb-progress" class="progress" style="width: 250px;margin-left: 25px"><div class="progress-bar progress-bar-striped active"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Loading...</div></div></div>'
  );
  $('#kbb-frame').append();

  const port = chrome.runtime.connect({ name: 'kbb-port' });
  port.postMessage({ type: 'test', connection: 'Connected!' });

  let marketMeter = 'marketMeter';
  $(document).ready(() => {
    // console.log('document ready');
  });

  window.onload = function onload() {
    // console.log('kbb.js');
    marketMeter = $('#marketMeterCanvas');
    // console.log(marketMeter);

    $('body').css({
      'padding-left': '25px',
      'background-color': '#9fBDEf',
      'background-image': 'none',
      width: '250px',
      height: '280px'
    });
    $('body').html(marketMeter);
    // port.postMessage({ type: 'kbb-price', kbb_data: marketMeter.html() });
  };
}
