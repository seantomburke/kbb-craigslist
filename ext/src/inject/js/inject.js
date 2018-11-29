/* globals drawCanvas */
const port = chrome.runtime.connect({ name: 'kbb-port' });
port.postMessage({ type: 'test', connection: 'Connected!' });
// $.each($('#Browse-make .UsedCarmakes ul li a'),
// 	function(i,e){
// 		console.log($(e));
// });

// if(l=$('.postingtitle').text().match(/\$([\d,] + )/))
// {
// 	listPrice=l[1].replace(/k/,'000')
// }
// else
// {
// 	listPrice=0;
// }

Number.prototype.toMoney = function () {
  let n = this.toFixed(0);
  return `$${n.replace(/\d(?=(\d{3}) + $)/g, '$&,')}`;
};

Number.prototype.toMiles = function () {
  let n = this.toFixed(0);
  return n.replace(/\d(?=(\d{3}) + $)/g, '$&,');
};

const serialize = function (obj) {
  let str = [];
  for (let p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  }
  return str.join('&');
};

let conditions = {
  excellent: ['like new', 'new', 'excellent'],
  'very good': ['great'],
  good: ['good', 'ok', 'okay'],
  fair: ['fair', 'bad'],
};

const carInfo = {};
$.each($('.mapAndAttrs p.attrgroup span'), (i, el) => {
  const e = $(el)
    .text()
    .split(':');
  if (typeof e[1] !== 'undefined') {
    carInfo[e[0].trim()] = e[1].trim();
    console.log('carInfo[\'' + e[0].trim() + '\'] = ' + e[1].trim());
  } else {
    carInfo['car'] = e[0];
    const p = e[0].match(/(19|20)[0-9]{2}/);
    carInfo['year'] = p ? p[0] : null;
    const b = e[0].match(
      /(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Daewoo|Dodge|Eagle|Ferrari|FIAT|Fisker|Ford|Geo|GMC|Honda|HUMMER|Hyundai|Infinit(i|y)|Isuzu|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Lotus|Maserati|Maybach|Mazda|McLaren|Mercedes((-| )Benz)?|Mercury|MINI|Mitsubishi|Nissan|Oldsmobile|Panoz|Plymouth|Pontiac|Porsche|Ram|Rolls-Royce|Saab|Saturn|Scion|smart|SRT|Subaru|Suzuki|Tesla|Toyota|Volkswagen|Volvo)/i
    );
    carInfo['make'] = b != null ? b[0] : null;
    var year = new RegExp(carInfo['year'], 'g');
    carInfo['model'] = e[0]
      .replace(year, '')
      .replace(carInfo['make'], '')
      .trim()
      .split(' ')[0];
    console.log('carInfo[\'car\'] = ' + e[0].trim());
  }
});
let found = 'searching';
console.log('before', carInfo.condition);
carInfo.condition = 'good';
carInfo.condition = $.inArray(carInfo.condition, conditions.excellent) > 0
  ? 'excellent'
  : carInfo.condition;
carInfo.condition = $.inArray(carInfo.condition, conditions['very good']) > 0
  ? 'very good'
  : carInfo.condition;
carInfo.condition = $.inArray(carInfo.condition, conditions.good) > 0
  ? 'good'
  : carInfo.condition;
carInfo.condition = $.inArray(carInfo.condition, conditions.fair) > 0
  ? 'fair'
  : carInfo.condition;
console.log('after', carInfo.condition);

if (!carInfo.model) {
  let regex = new RegExp(`${(carInfo['car'] || '').trim()}\\s(\\w + )\\s`);
  let title = $('.postingtitle')
    .text()
    .match(regex);
  console.log(title);
  if (title && title.length > 1) {
    carInfo.model = title[1];
  }
  console.log(carInfo.model);
}

$.getJSON(chrome.extension.getURL('src/inject/json/models_generated.json'), models => {
  carInfo['model'] = models[carInfo['model']];
});

if (!carInfo.odometer) {
  let mtch1 = $('.postingtitle')
    .text()
    .match(/[^$0-9](\d{2,3}(,| )?(000|k|xxx|\d{3}))/);
  let temp1 = mtch1
    ? mtch1[1]
      .replace(/k/, '000')
      .replace(/,/, '')
      .replace(/xxx/, '000')
    : carInfo.odometer;
  let mtch2 = $('#postingbody')
    .text()
    .match(/[^$0-9](\d{2,3}(,| )?(000|k|xxx|\d{3}))/);
  let temp2 = mtch2
    ? mtch2[1]
      .replace(/k/, '000')
      .replace(/,/, '')
      .replace(/xxx/, '000')
    : carInfo.odometer;
  console.log(temp1, '>', temp2);
  carInfo.odometer = temp1 > temp2 ? temp1 : temp2;
  console.log(carInfo.odometer);
}
const l = $('.postingtitle').text().match(/\$([\d,]+)/);
let listPrice = Number(l ? l[1].replace(/k/, '000') : 0);
const f = $('#postingbody').text().match(/\$([\d,]+)/);
if (!listPrice) {
  listPrice = Number(f ? l[1].replace(/k/, '000') : 0);
}

const kbb_data = {};

$('.mapAndAttrs').prepend(
  $('<div>')
    .attr('id', 'kbb-frame')
    .hide()
    .fadeIn('slow'));
$('#kbb-frame').append(
  $('<h1 id="kbb-title">')
    .html(`<img height="25" width="25" class="img-rounded" src="${chrome.extension.getURL('/icons/kbblogo48.png')}"/> Kelley Blue Book`)
    .hide()
    .fadeIn('slow'));
$('#kbb-frame').append(
  $('<h1 id="listPrice">')
    .html(`List Price: <span>${listPrice.toMoney()}</span>`)
    .hide()
    .fadeIn('slow'));
$('#kbb-frame').append(
  '<div id="kbb-progress" class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="20" style="width: 20%">Loading...</div></div>'
);
$('#kbb-progress').after(
  $('<h1 id="kbb-form">')
    .html(
      '<form id="#kbb-zipcode-form" class="form-inline" onsubmit="event.preventDefault(); return false;"><div class="form-group"><input class="btn" name="zipcode-submit" type="submit"><span id="zipcode-saved"></span></div></form>'
    )
    .hide()
    .fadeIn('slow')
);
chrome.storage.sync.get(['zipcode'], ({ zipcode = '' }) => {
  $('[name=zipcode-submit]').before(
    `<input placeholder="Zipcode" class="form-control" type="text" name="zipcode" value="${zipcode}"/>`
  );
  carInfo.zipcode = zipcode;
  kbb_data.zipcode = zipcode;
});
$('#kbb-frame').append(
  $('<div>')
    .attr('id', 'kbb')
    .hide()
    .fadeIn('slow')
);
// $('#kbb-frame').append($("<div id='kbb-iframe'>"));
// $('#kbb-iframe').append("<iframe id='priceiFrame' src='about:none'>");
$('#kbb-progress .progress-bar').attr('aria-valuenow', 20);
$('#kbb-progress .progress-bar').css('width', `${20}%`);

kbb_data.intent = 'buy-used';
kbb_data.pricetype = 'private-party';
kbb_data.mileage = carInfo.odometer || 0;
kbb_data.bodystyle = carInfo.type;
kbb_data.condition = carInfo.condition;
const n = kbb_data.mileage;
kbb_data.mileage = n && n.length <= 3 ? n * 1000 : n;
$(document).ready(() => {
  $('#' + found + 'KBB').insertAfter('#kbb-frame');
});
console.log(kbb_data.mileage);

// kbb_data['mileage'])?(m=carInfo['odometer']):0;
// bx = (b=kbb_data['bodystyle'])?(b=carInfo['type']):0;
// cx = (b=kbb_data['condition'])?(b=carInfo['condition']):0;
// kbb_data['vehicleid'] = carInfo['VIN'];
// kbb_data['condition'] = carInfo['condition'];

let url = (
  `https://www.kbb.com/${
  carInfo['make']
  }/${
  carInfo['model']
  }/${
  carInfo['year']
  }/styles/`
).replace(/ /g, '-');
console.log(`${url}?${serialize(kbb_data)}`);
// $('head').prepend($('<base>').attr('href','https://www.kbb.com/'));
const m = url.match(/(style|options|categories|\/condition\/)/);
let type = m ? m[0].replace(/\//g, '') : 'default';
port.postMessage({
  type, url, kbb_data, carInfo
});
port.onMessage.addListener((response) => {
  handleResponse(response);
});
// $.ajax({
//    url: url,
//    dataType: 'html',
//    type: 'GET',
//    data: kbb_data,
// 	 error: function(jqXHR, textStatus, errorThrown){
// 	 		if(carInfo['year'] < 1994)
// 	 		{
// 	 			$('#kbb').hide().html("<div class='alert alert-warning' role='alert'>Sorry. Kelley Blue Book does not provide information for cars older than 1994</div>").fadeIn('slow');
// 	 		}
// 	 		else{
// 	 			makeDropdowns();
// 	 		}
// 	 },
//    success: function(data, responseText, jqXHR){
//    		var extracted = $($.parseHTML(data)).find('.mod-gradiated-content');
//    		extracted.find('aside').remove();
//    		extracted.find("*").removeClass('collapse');
//    		//if(extracted.find('.selected'))
//    		//extracted.find('.mod-category').not('.selected').remove();
// 			$.each(extracted.find('a'), function(i,el){
// 				var e = $(el);
// 				e.attr('target','_BLANK');
// 				e.attr('onclick', '');
// 				e.addClass('kbb-link');
// 				e.attr('href', 'https://www.kbb.com' + e.attr('href'));
// 			});
//    		$('#kbb').hide().html(extracted.html()).fadeIn('slow');
//    		handleClick(port);
//    }
//   });

console.log('https://www.seantburke.com/');
let handleClick = function (port) {
  $('.kbb-link').on('click', function (e) {
    console.log(e);
    e.preventDefault();
    $('#kbb-progress').slideDown();
    let url = $(this).attr('href');
    let m = $(this).attr('href').match(/(style|options|categories|\/condition\/)/);
    let type = m ? m[0].replace(/\//g, '') : 'default';
    console.log(url);
    console.log(type);
    port.postMessage({ type, url, kbb_data });
    port.onMessage.addListener(handleResponse);
  });
};
handleClick(port);

let handleZipcode = () => {
  $('#kbb-form').on('submit', (e) => {
    e.preventDefault();
    let zipcode = e.target[0].value;
    carInfo.zipcode = zipcode;
    kbb_data.zipcode = zipcode;
    chrome.storage.sync.set({ zipcode });
    $('#zipcode-saved')
      .html('<font color="green">Saved!</font>')
      .fadeIn()
      .fadeOut();
    return false;
  });
};
handleZipcode();

let handleForm = function (port) {
  $('#kbb-submit').on('click', (e) => {
    console.log(e);
    e.preventDefault();
    carInfo['car'] =
      $('#kbb-year').val() +
      '-' +
      $('#kbb-make').val() +
      '-' +
      $('#kbb-model').val();
    carInfo['year'] = $('#kbb-year')
      .val()
      .toLowerCase();
    carInfo['make'] = $('#kbb-make')
      .val()
      .toLowerCase();
    carInfo['model'] = $('#kbb-model')
      .val()
      .toLowerCase();
    var url = (
      'https://www.kbb.com/' +
      carInfo['make'] +
      '/' +
      carInfo['model'] +
      '/' +
      carInfo['year'] +
      '/styles/?intent=buy-used&mileage=' +
      $('#kbb-mileage').val()
    ).replace(/ /g, '-');
    const m = url.match(/(style|options|categories|\/condition\/)/);
    var type = m ? m[0].replace(/\//g, '') : 'default';
    $('#kbb-progress').slideDown('slow');
    console.log(url);
    console.log(type);
    port.postMessage({ type: type, url: url, kbb_data: kbb_data, });
    port.onMessage.addListener(handleResponse);
  });
};

var handleResponse = function (response) {
  console.log(response);
  if (response.type == 'default') {
    console.log('This is the Default type');
    console.log(response);
    console.log('temp_json', response.data);
    // var temp_json = response.data.match(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()\{([.\s\/\w:?&;,\"\/\.] + )(vehicleId:)([\"\s&.\w;,:\-\|\{\}\[\]] + )\);/);
    // console.log('temp_json', temp_json);
    if (
      response
      && response.meterData
      && response.meterData.data
      && response.meterData.data.apiData
      && response.meterData.data.apiData.vehicle
      && response.meterData.data.apiData.vehicle.values
      && response.meterData.data.apiData.vehicle.values.length) {
      let [
        excellent,
        vgood,
        good,
        fair,
      ] = response.meterData.data.apiData.vehicle.values;

      let kbb_price = {
        excellent: excellent.base,
        vgood: vgood.base,
        good: good.base,
        fair: fair.base,
      };
      let { mileage } = response.kbb_data;
      let current_price;

      if (kbb_price[carInfo.condition]) {
        current_price = kbb_price[carInfo.condition];
      } else {
        current_price = kbb_price.fair;
      }
      let cd = carInfo.condition;
      let current_class = cd ? cd.replace(/\s/, '') : 'fair';
      let priceLabel = `Kbb Price: <span class='${
        current_class
        }'>${
        current_price.toMoney()
        }</span>`;
      $('#kbb')
        .hide()
        .html($(response.img))
        .fadeIn('slow');
      $('#kbb').prepend($(`<h2>Mileage: ${Number(mileage).toMiles()}<h2>`));
      // $('#kbb').prepend($('<h2>', {
      // 	id: 'carInfo'
      // }).html(carInfo['year'] + ' ' + carInfo['make'] + ' ' + carInfo['model']));
      $('#kbb').append(
        $('<h1>', {
          id: 'price',
          class: 'priceInfo',
        })
          .html(priceLabel)
          .hide()
          .fadeIn('slow')
      );
      let priceDiffLabel;

      if (listPrice > current_price) {
        priceDiffLabel = `<span class='red'>${
          listPrice.toMoney()
          }</span> <br><small class='red'>${
          (listPrice - current_price).toMoney()
          } overpriced</small></h1>`;
      } else {
        priceDiffLabel = `<span class='green'>${
          listPrice.toMoney()
          }</span> <br><small class='green'>${
          (current_price - listPrice).toMoney()
          } underpriced</small></h1>`;
      }
      priceDiffLabel = `List Price: ${priceDiffLabel}`;
      $('#kbb').append(
        $('<h1>', {
          id: 'price',
          class: 'priceInfo',
        })
          .html(priceDiffLabel)
          .hide()
          .fadeIn('slow')
      );

      let table = $('<table class="table table-hover">');
      table.append(
        '<thead><tr><th colspan="2"><h2>Kelley Blue Book Prices</h2></th></tr></thead>'
      );
      let color_class = current_class == 'excellent' ? `${current_class} success` : ' ';
      let trExcellent = $(
        `<tr class='${
        color_class
        }'><td id='priceexcellent' class='priceInfo'>Excellent:</td><td>${
        kbb_price.excellent.toMoney()
        }</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trExcellent);
      color_class = current_class == 'verygood' ? `${current_class} success` : ' ';
      let trVGood = $(
        `<tr class="${
        color_class
        }"><td id="priceverygood" class="priceInfo">Very Good:</td><td>${
        kbb_price.vgood.toMoney()
        }</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trVGood);
      color_class = current_class == 'good' ? 'warning' : ' ';
      let trGood = $(
        `<tr class="${
        color_class
        }"><td id="pricegood" class="priceInfo">Good:</td><td>${
        kbb_price.good.toMoney()
        }</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trGood);
      color_class = current_class == 'fair' ? `${current_class} danger` : ' ';
      let trFair = $(
        `<tr class="${
        color_class
        }"><td id="pricefair" class="priceInfo">Fair:</td><td>${
        kbb_price.fair.toMoney()
        }</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trFair);
      $('#kbb').append(table);

      // canvas
      $('#kbb').append($('<div>', { id: 'kbb-price-canvas' }));
      $('#kbb-price-canvas').html(
        `<img id="kbblogo" src="${
        chrome.extension.getURL('/src/inject/webcode/images/logo240.png')
        }"/><canvas id="mainCanvas" width="260" height="220"></canvas><div style="display: none"><img src="${
        chrome.extension.getURL('/src/inject/webcode/images/logo240.png')
        }" width="1" height="1" alt="Preload of images/logo240.png" /><img src="${
        chrome.extension.getURL('/src/inject/webcode/images/logo240_2x.png')
        }" width="1" height="1" alt="Preload of images/logo240_2x.png" /></div>`
      );
      drawCanvas('mainCanvas', {
        kbb: response.meterData,
        listPrice,
      });
      $('#kbb')
        .append($(`<img src="https://${response.meterData.href}"/>`))
        .fadeIn('slow');
    } else if (!response.kbb_data.zipcode) {
      let restartUrl = response.url.replace(
        /pricetype=(retail|trade-in)/,
        'pricetype=private-party'
      );
      $('#kbb').html(
        `<div class="alert alert-warning"><h3>You need to provide a zipcode above</h3><br><a class="btn kbb-link" href="${restartUrl}">Restart</a></p></div>`
      );

      $('#kbb').append($('<iframe>', { id: 'priceiFrame' }));
      $('#priceiFrame').attr({ src: restartUrl, scrolling: 'yes' });
    } else {
      // $('#kbb').append($('<h2>', {
      // 	id: 'priceexcellent',
      // 	class: 'priceInfo excellent'
      // }).html("Excellent: $" + d.data.values.privatepartyexcellent.price).hide().fadeIn('slow'));
      // $('#kbb').append($('<h2>', {
      // 	id: 'priceverygood',
      // 	class: 'priceInfo verygood'
      // }).html("Very Good: $" + d.data.values.privatepartyverygood.price).hide().fadeIn('slow'));
      // $('#kbb').append($('<h2>', {
      // 	id: 'pricegood',
      // 	class: 'priceInfo good'
      // }).html("Good: $" + d.data.values.privatepartygood.price).hide().fadeIn('slow'));
      // $('#kbb').append($('<h2>', {
      // 	id: 'pricefair',
      // 	class: 'priceInfo fair'
      // }).html("Fair: $" + d.data.values.privatepartyfair.price).hide().fadeIn('slow'));

      // var perc = (d.data.values.fpp.price-d.data.values.fpp.priceMin)/(d.data.values.fpp.priceMax-d.data.values.fpp.priceMin)*100;
      // $('#kbb').append($('<div>',{class:'row'}).html(
      // 	'<div class='col-xs-2'>' +
      // 	'<span class='label label-success'>' + d.data.values.fpp.priceMin.toMoney() + '</span>' +
      // 	'</div><div class='col-xs-7'>' +
      // 	'<div class='progress'>' +
      // 	'<div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='60' aria-valuemin="' + d.data.values.fpp.priceMin + '" aria-valuemax="' + d.data.values.fpp.priceMax + '" aria-valuenow="' + d.data.values.fpp.price + '" style="width:' + perc + '%;">$' + d.data.values.fpp.price + '</div></div></div>' +
      // 	'<div class='col-xs-1'>' +
      // 	'<span class='label label-danger'>' + d.data.values.fpp.priceMax.toMoney() + '</span>' +
      // 	'</div>'
      // 	).hide().fadeIn('slow'));

      let new_url = response.url.replace(
        /pricetype=(retail|trade-in)/,
        'pricetype=private-party'
      );
      $('#kbb').html(
        `<div class="alert alert-warning"><h3>Attempting to call KBB.com...</h3><p>KBB has changed or blocked access to their pricing information. Sit tight while we attept to retrieve KBB's market meter or Click on this link to view the price on their site: <br><a target="_blank" href="${
        new_url
        }">${
        new_url.substring(0, 50)
        }...</a></p></div>`
      );

      $('#kbb').append($('<iframe>', { id: 'priceiFrame' }));
      $('#priceiFrame').attr({ src: new_url, scrolling: 'yes' });
    }

    $('#kbb').append(
      $('<a>', {
        href: `${response.url}?${serialize(response.kbb_data)}`,
        class: 'btn btn-primary',
        target: '_BLANK',
      })
        .html('Open in KBB.com')
        .hide()
        .fadeIn('slow')
    );
    handleClick(port);
    $('#kbb-progress').slideUp('fast', () => {
      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', 0 + '%');
    });
  } else if (response.type == 'status') {
    console.log(response.message);
    console.log(response.kbb_data);
    $('#kbb-progress .progress-bar').attr('aria-valuenow', response.progress);
    $('#kbb-progress .progress-bar').css('width', `${response.progress}%`);
    $('#kbb-progress .progress-bar').text(response.message);
    $('#kbb-progress').slideDown('normal');
  } else if (response.type == 'error') {
    console.log(response.message);
    console.log(response.kbb_data);
    makeDropdowns(() => {
      // $('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
      // $('#kbb-progress .progress-bar').css('width', 100 + '%');
      $('#kbb-progress').slideUp('normal', function () {
        $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
        $('#kbb-progress .progress-bar').css('width', 0 + '%');
      });
      $('#kbb').prepend(
        $(
          '<div id=\'error-box\' class=\'alert alert-danger\' role=\'alert\'>Error with Kelley Blue Book <a target=\'_BLANK\' class=\'btn btn-primary\' href=\'' +
          response.url +
          '\'>Visit KBB.com</a></div>'
        )
          .hide()
          .html(response.message + '<br>')
          .fadeIn('slow')
      );
      $('#error-box').append('<div class=\'timer-warning\'>');
      setTimeout(function () {
        var warning_message = 'Opening kbb.com in background tab';
        $('.timer-warning')
          .html(
            '<div id="kbb-progress" class="progress"><div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">' +
            warning_message +
            '</div></div>'
          )
          .hide()
          .fadeIn('slow');
      }, 500);
    });
    setTimeout(() => {
      $('.timer-warning').hide();
      window.open(response.url, '_BLANK');
    }, 4000);
  } else if (response.type == 'init_error') {
    if (carInfo.year && carInfo.year < 1994) {
      makeDropdowns(() => {
        // 	$('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
        // 	$('#kbb-progress .progress-bar').css('width', 100 + '%');
        $('#kbb-progress').slideUp('normal', function () {
          $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
          $('#kbb-progress .progress-bar').css('width', 0 + '%');
        });
        $('#kbb').prepend(
          $('<div>')
            .hide()
            .html(
              '<div class=\'alert alert-warning\' role=\'alert\'>Sorry. Kelley Blue Book does not provide information for cars older than 1994</div>'
            )
            .fadeIn('slow')
        );
      });
    } else {
      makeDropdowns(() => {
        // 	$('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
        // 	$('#kbb-progress .progress-bar').css('width', 100 + '%');
        $('#kbb-progress').slideUp('normal', function () {
          $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
          $('#kbb-progress .progress-bar').css('width', 0 + '%');
        });
        $('#kbb').prepend(
          $('<div>')
            .hide()
            .html(
              '<div class=\'alert alert-warning\' role=\'alert\'>Could not get information automatically. Please fill out the form below. ' +
              response.message +
              '</div>'
            )
            .fadeIn('slow')
        );
      });
    }
  } else {
    console.log(`Type is:${response.type}`);
    $('#kbb-progress').slideUp('normal', () => { });
    $('#kbb')
      .hide()
      .html(response.data)
      .fadeIn('slow');
    $('#kbb').append(
      $('<a>', {
        href: response.url,
        class: 'btn btn-primary',
        target: '_BLANK',
      })
        .html('Open in KBB.com')
        .hide()
        .fadeIn('slow')
    );
    handleClick(port);
  }
  console.log('returned');
};

var makeDropdowns = function (callback) {
  $.ajax({
    url: 'https://www.kbb.com/jsdata/_makesmodels',
    dataType: 'json',
    type: 'GET',
    data: {
      yearid: carInfo.year,
    },
    error() {
      $('#kbb')
        .hide()
        .html(
          'Error Retrieving Makes and Models from KBB. Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'
        )
        .fadeIn('slow');
    },
    success(data) {
      console.log(data);
      var form = $('<form >', { class: 'form-inline', id: 'kbb-form', });
      var kbb_year_group = $('<div class=\'form-group\' id=\'kbb-year-group\'>');
      var kbb_make_group = $('<div class=\'form-group\' id=\'kbb-make-group\'>');
      var kbb_model_group = $('<div class=\'form-group\' id=\'kbb-model-group\'>');
      var kbb_mileage_group = $(
        '<div class=\'form-group\' id=\'kbb-mileage-group\'>'
      );

      kbb_year_group.append(
        $('<label class=\'sr-only\' for=\'kbb-year\'>Year</label>')
      );
      kbb_year_group.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-year',
          name: 'year',
          value: kbb_data['year'],
        })
      );

      kbb_make_group.append(
        $('<label class=\'sr-only\' for=\'kbb-make\'>Make</label>')
      );
      kbb_make_group.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-make',
          name: 'make',
          value: kbb_data['make'],
        })
      );

      kbb_model_group.append(
        $('<label class=\'sr-only\' for=\'kbb-model\'>Model</label>')
      );
      kbb_model_group.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-model',
          name: 'model',
          value: kbb_data['model'],
        })
      );

      kbb_mileage_group.append(
        $('<label class=\'sr-only\' for=\'kbb-mileage\'>Mileage</label>')
      );
      kbb_mileage_group.append(
        $('<input>', {
          class: 'form-control',
          id: 'kbb-mileage',
          type: 'text',
          name: 'mileage',
          value: kbb_data['mileage'],
          placeholder: 'Mileage',
        })
      );

      form.append(kbb_year_group);
      form.append(kbb_make_group);
      form.append(kbb_model_group);
      form.append(kbb_mileage_group);

      form.append(
        $('<input>', {
          class: 'form-control btn btn-primary',
          id: 'kbb-submit',
          type: 'button',
          name: 'submit',
          value: 'Submit',
        })
      );

      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', 0 + '%');
      $('#kbb-progress').slideUp('normal');
      $('#kbb')
        .hide()
        .html(form)
        .fadeIn('slow');
      $('#kbb-year').append(
        $(
          '<option value=\'0\'>SELECT YEAR</option><option value=\'\'>----</option>'
        )
      );
      $('#kbb-make').append(
        $(
          '<option value=\' \'>SELECT MAKE</option><option value=\'\'>----</option>'
        )
      );
      $('#kbb-model').append(
        $(
          '<option value=\' \'>SELECT MODEL</option><option value=\'\'>----</option>'
        )
      );
      for (var i = 1994; i <= new Date().getFullYear(); i++) {
        if (i == carInfo['year']) {
          $('#kbb-year').append(
            $('<option selected value=\'' + i + '\'>' + i + '</option>')
          );
        } else {
          $('#kbb-year').append(
            $('<option value=\'' + i + '\'>' + i + '</option>')
          );
        }
      }
      for (var j = 0; j < data.length; j++) {
        if (
          carInfo['make'] &&
          carInfo['make'].toUpperCase() == data[j].Name.toUpperCase()
        ) {
          for (var k = 0; k < data[j].Model.length; k++) {
            if (
              carInfo['model'] &&
              carInfo['model'].toUpperCase() ==
              data[j].Model[k].Name.toUpperCase()
            ) {
              $('#kbb-model').append(
                $(
                  '<option selected value=\'' +
                  data[j].Model[k].Name +
                  '\'>' +
                  data[j].Model[k].Name +
                  '</option>'
                )
              );
            } else {
              $('#kbb-model').append(
                $(
                  '<option value=\'' +
                  data[j].Model[k].Name +
                  '\'>' +
                  data[j].Model[k].Name +
                  '</option>'
                )
              );
            }
          }
          $('#kbb-make').append(
            $(
              '<option selected value=\'' +
              data[j].Name +
              '\'>' +
              data[j].Name +
              '</option>'
            )
          );
        } else {
          $('#kbb-make').append(
            $(
              '<option value=\'' +
              data[j].Name +
              '\'>' +
              data[j].Name +
              '</option>'
            )
          );
        }
      }
      handleMakeDropdown(data);
      handleForm(port);
      if (callback) callback();
    },
  });
};

var handleMakeDropdown = function (data) {
  $('#kbb-make').bind('change', function () {
    $('#kbb-model')
      .find('option')
      .remove()
      .add('<option value=\'0\'>Model</option><option value=\'\'>----</option>');
    let continueMake = true;
    for (let i = 0; i < data.length; i++) {
      if (continueMake && $(this).val() == data[i].Name) {
        continueMake = false;
        for (let j = 0; j < data[i].Model.length; j++) {
          $('#kbb-model').append(
            $(
              `<option value='${
              data[i].Model[j].Name
              }'>${
              data[i].Model[j].Name
              }</option>`
            )
          );
        }
      }
    }
  });
};

port.onMessage.addListener(handleKBB);

function handleKBB(response) {
  console.log('handling kbb');
  if (response.type == 'kbb-background') {
    console.log(response.message);
    console.log(response.kbb_data);

    $('#kbb').append(
      $(`<div class='kbb-price'>${response.kbb_data}</div>`)
        .hide()
        .fadeIn('slow')
    );
    handleClick(port);
    $('#kbb-progress').slideUp('fast', () => {
      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', 0 + '%');
    });
  }
}
