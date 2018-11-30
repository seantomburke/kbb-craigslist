/* globals drawCanvas */
const port = chrome.runtime.connect({ name: 'kbb-port' });
port.postMessage({ type: 'test', connection: 'Connected!' });
$.each($('#Browse-make .UsedCarmakes ul li a'), (i, e) => {
  console.log($(e));
});
let listPrice;
const l = $('.postingtitle')
  .text()
  .match(/\$([\d,] + )/);
if (l) {
  listPrice = l[1].replace(/k/, '000');
} else {
  listPrice = 0;
}

const toMoney = number => number && `$${number.toFixed(0).replace(/\d(?=(\d{3}) + $)/g, '$&,')}`;

const toMiles = number => number && number.toFixed(0).replace(/\d(?=(\d{3}) + $)/g, '$&,');

function serialize(obj) {
  const str = [];
  Object.keys(obj).forEach(key => {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
  });
  return str.join('&');
}

const handleMakeDropdown = data => {
  $('#kbb-make').bind('change', function change() {
    $('#kbb-model')
      .find('option')
      .remove()
      .add("<option value='0'>Model</option><option value=''>----</option>");
    let continueMake = true;
    for (let i = 0; i < data.length; i += 1) {
      if (continueMake && $(this).val() === data[i].Name) {
        continueMake = false;
        for (let j = 0; j < data[i].Model.length; j += 1) {
          $('#kbb-model').append(
            $(`<option value='${data[i].Model[j].Name}'>${data[i].Model[j].Name}</option>`)
          );
        }
      }
    }
  });
};

function handleKBB(response) {
  console.log('handling kbb');
  if (response.type === 'kbb-background') {
    console.log(response.message);
    console.log(response.kbbData);

    $('#kbb').append(
      $(`<div class='kbb-price'>${response.kbbData}</div>`)
        .hide()
        .fadeIn('slow')
    );
    handleClick(port);
    $('#kbb-progress').slideUp('fast', () => {
      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', `${0}%`);
    });
  }
}

const conditions = {
  excellent: ['like new', 'new', 'excellent'],
  'very good': ['great'],
  good: ['good', 'ok', 'okay'],
  fair: ['fair', 'bad']
};

const carInfo = {};
$.each($('.mapAndAttrs p.attrgroup span'), (i, el) => {
  const e = $(el)
    .text()
    .split(':');
  if (typeof e[1] !== 'undefined') {
    carInfo[e[0].trim()] = e[1].trim();
    console.log(`carInfo['${e[0].trim()}'] = ${e[1].trim()}`);
  } else {
    [carInfo.car] = e;
    const p = e[0].match(/(19|20)[0-9]{2}/);
    carInfo.year = p ? p[0] : null;
    const b = e[0].match(
      /(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Daewoo|Dodge|Eagle|Ferrari|FIAT|Fisker|Ford|Geo|GMC|Honda|HUMMER|Hyundai|Infinit(i|y)|Isuzu|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Lotus|Maserati|Maybach|Mazda|McLaren|Mercedes((-| )Benz)?|Mercury|MINI|Mitsubishi|Nissan|Oldsmobile|Panoz|Plymouth|Pontiac|Porsche|Ram|Rolls-Royce|Saab|Saturn|Scion|smart|SRT|Subaru|Suzuki|Tesla|Toyota|Volkswagen|Volvo)/i
    );
    carInfo.make = b != null ? b[0] : null;
    const year = new RegExp(carInfo.year, 'g');
    [carInfo.model] = e[0]
      .replace(year, '')
      .replace(carInfo.make, '')
      .trim()
      .split(' ');
    console.log(`carInfo['car'] = ${e[0].trim()}`);
  }
});
const found = 'searching';
console.log('before', carInfo.condition);
carInfo.condition = 'good';
carInfo.condition = conditions.excellent.includes(carInfo.condition)
  ? 'excellent'
  : carInfo.condition;
carInfo.condition = conditions['very good'].includes(carInfo.condition)
  ? 'very good'
  : carInfo.condition;
carInfo.condition = conditions.good.includes(carInfo.condition) ? 'good' : carInfo.condition;
carInfo.condition = conditions.fair.includes(carInfo.condition) ? 'fair' : carInfo.condition;
console.log('after', carInfo.condition);

if (!carInfo.model) {
  const regex = new RegExp(`${(carInfo.car || '').trim()}\\s(\\w+)\\s`);
  const title = $('.postingtitle')
    .text()
    .match(regex);
  console.log(title);
  if (title && title.length > 1) {
    [, carInfo.model] = title;
  }
  console.log(carInfo.model);
  if (!carInfo.model) {
    $.getJSON(chrome.extension.getURL('src/inject/json/models_generated.json'), models => {
      carInfo.model = models[carInfo.make];
    });
  }
}

if (!carInfo.odometer) {
  const mtch1 = $('.postingtitle')
    .text()
    .match(/[^$0-9](\d{2,3}(,| )?(000|k|xxx|\d{3}))/);
  const temp1 = mtch1
    ? mtch1[1]
        .replace(/k/, '000')
        .replace(/,/, '')
        .replace(/xxx/, '000')
    : carInfo.odometer;
  const mtch2 = $('#postingbody')
    .text()
    .match(/[^$0-9](\d{2,3}(,| )?(000|k|xxx|\d{3}))/);
  const temp2 = mtch2
    ? mtch2[1]
        .replace(/k/, '000')
        .replace(/,/, '')
        .replace(/xxx/, '000')
    : carInfo.odometer;
  console.log(temp1, '>', temp2);
  carInfo.odometer = temp1 > temp2 ? temp1 : temp2;
  console.log(carInfo.odometer);
}
const pt = $('.postingtitle')
  .text()
  .match(/\$([\d,]+)/);
listPrice = Number(pt ? pt[1].replace(/k/, '000') : 0);
const pb = $('#postingbody')
  .text()
  .match(/\$([\d,]+)/);
if (!listPrice) {
  listPrice = Number(pb ? pb[1].replace(/k/, '000') : 0);
}

const kbbData = {};

$('.mapAndAttrs').prepend(
  $('<div>')
    .attr('id', 'kbb-frame')
    .hide()
    .fadeIn('slow')
);
$('#kbb-frame').append(
  $('<h1 id="kbb-title">')
    .html(
      `<img height="25" width="25" class="img-rounded" src="${chrome.extension.getURL(
        '/icons/kbblogo48.png'
      )}"/> Kelley Blue Book`
    )
    .hide()
    .fadeIn('slow')
);
$('#kbb-frame').append(
  $('<h1 id="listPrice">')
    .html(`List Price: <span>${toMoney(listPrice)}</span>`)
    .hide()
    .fadeIn('slow')
);
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
  kbbData.zipcode = zipcode;
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

kbbData.intent = 'buy-used';
kbbData.pricetype = 'private-party';
kbbData.mileage = carInfo.odometer || 0;
kbbData.bodystyle = carInfo.type;
kbbData.condition = carInfo.condition;
const n = kbbData.mileage;
kbbData.mileage = n && n.length <= 3 ? n * 1000 : n;
$(document).ready(() => {
  $(`#${found}KBB`).insertAfter('#kbb-frame');
});
console.log(kbbData.mileage);

// x = kbbData.mileage ? (m = carInfo.odometer) : 0;
// bx = (b = kbbData.bodystyle) ? (b = carInfo.type) : 0;
// cx = (b = kbbData.condition) ? (b = carInfo.condition) : 0;
// kbbData.vehicleid = carInfo.VIN;
// kbbData.condition = carInfo.condition;
const { make, model, year } = carInfo;
const url = `https://www.kbb.com/${make}/${model}/${year}/styles/`.replace(/\s/g, '-');
console.log(`${url}?${serialize(kbbData)}`);
// $('head').prepend($('<base>').attr('href','https://www.kbb.com/'));
const m = url.match(/(style|options|categories|\/condition\/)/);
const type = m ? m[0].replace(/\//g, '') : 'default';
port.postMessage({
  type,
  url,
  kbbData,
  carInfo
});
port.onMessage.addListener(response => {
  handleResponse(response);
});
// $.ajax({
//   url,
//   dataType: 'html',
//   type: 'GET',
//   data: kbbData,
//   error() {
//     if (carInfo.year < 1994) {
//       $('#kbb')
//         .hide()
//         .html(
//           "<div class='alert alert-warning' role='alert'>Sorry. Kelley Blue Book does not provide information for cars older than 1994</div>"
//         )
//         .fadeIn('slow');
//     } else {
//       makeDropdowns();
//     }
//   },
//   success(data) {
//     const extracted = $($.parseHTML(data)).find('.mod-gradiated-content');
//     extracted.find('aside').remove();
//     extracted.find('*').removeClass('collapse');
//     // if(extracted.find('.selected'))
//     // extracted.find('.mod-category').not('.selected').remove();
//     $.each(extracted.find('a'), (i, el) => {
//       const e = $(el);
//       e.attr('target', '_BLANK');
//       e.attr('onclick', '');
//       e.addClass('kbb-link');
//       e.attr('href', `https://www.kbb.com${e.attr('href')}`);
//     });
//     $('#kbb')
//       .hide()
//       .html(extracted.html())
//       .fadeIn('slow');
//     handleClick(port);
//   }
// });

console.log('https://www.seantburke.com/');
const handleClick = newPort => {
  $('.kbb-link').on('click', function click(e) {
    console.log(e);
    e.preventDefault();
    $('#kbb-progress').slideDown();
    const newUrl = $(this).attr('href');
    const newMatch = $(this)
      .attr('href')
      .match(/(style|options|categories|\/condition\/)/);
    const newType = newMatch ? newMatch[0].replace(/\//g, '') : 'default';
    console.log(newUrl);
    console.log(type);
    newPort.postMessage({ type: newType, url: newUrl, kbbData });
    newPort.onMessage.addListener(handleResponse);
  });
};
handleClick(port);

const handleZipcode = () => {
  $('#kbb-form').on('submit', e => {
    e.preventDefault();
    const zipcode = e.target[0].value;
    carInfo.zipcode = zipcode;
    kbbData.zipcode = zipcode;
    chrome.storage.sync.set({ zipcode });
    $('#zipcode-saved')
      .html('<font color="green">Saved!</font>')
      .fadeIn()
      .fadeOut();
    return false;
  });
};
handleZipcode();

const handleForm = newPort => {
  $('#kbb-submit').on('click', e => {
    console.log(e);
    e.preventDefault();
    carInfo.car = `${$('#kbb-year').val()}-${$('#kbb-make').val()}-${$('#kbb-model').val()}`;
    carInfo.year = $('#kbb-year')
      .val()
      .toLowerCase();
    carInfo.make = $('#kbb-make')
      .val()
      .toLowerCase();
    carInfo.model = $('#kbb-model')
      .val()
      .toLowerCase();
    const newUrl = `https://www.kbb.com/${carInfo.make}/${carInfo.model}/${
      carInfo.year
    }/styles/?intent=buy-used&mileage=${$('#kbb-mileage').val()}`.replace(/ /g, '-');
    const newMatch = newUrl.match(/(style|options|categories|\/condition\/)/);
    const newType = newMatch ? newMatch[0].replace(/\//g, '') : 'default';
    $('#kbb-progress').slideDown('slow');
    console.log(newUrl);
    console.log(newType);
    newPort.postMessage({ type: newType, url: newUrl, kbbData });
    newPort.onMessage.addListener(handleResponse);
  });
};

const handleResponse = response => {
  console.log(response);
  if (response.type === 'default') {
    console.log('This is the Default type');
    console.log(response);
    console.log('temp_json', response.data);
    // let temp_json = response.data.match(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()\{([.\s\/\w:?&;,\"\/\.] + )(vehicleId:)([\"\s&.\w;,:\-\|\{\}\[\]] + )\);/);
    // console.log('temp_json', temp_json);
    if (
      response &&
      response.meterData &&
      response.meterData.data &&
      response.meterData.data.apiData &&
      response.meterData.data.apiData.vehicle &&
      response.meterData.data.apiData.vehicle.values &&
      response.meterData.data.apiData.vehicle.values.length
    ) {
      const [excellent, vgood, good, fair] = response.meterData.data.apiData.vehicle.values;

      const kbbPrice = {
        excellent: excellent.base,
        vgood: vgood.base,
        good: good.base,
        fair: fair.base
      };
      const { mileage } = response.kbbData;
      let currentPrice;

      if (kbbPrice[carInfo.condition]) {
        currentPrice = kbbPrice[carInfo.condition];
      } else {
        currentPrice = kbbPrice.fair;
      }
      const cd = carInfo.condition;
      const currentClass = cd ? cd.replace(/\s/, '') : 'fair';
      const priceLabel = `Kbb Price: <span class='${currentClass}'>${toMoney(currentPrice)}</span>`;
      $('#kbb')
        .hide()
        .html($(response.img))
        .fadeIn('slow');
      $('#kbb').prepend($(`<h2>Mileage: ${toMiles(Number(mileage))}<h2>`));
      $('#kbb').prepend(
        $('<h2>', {
          id: 'carInfo'
        }).html(`${carInfo.year} ${carInfo.make} ${carInfo.model}`)
      );
      $('#kbb').append(
        $('<h1>', {
          id: 'price',
          class: 'priceInfo'
        })
          .html(priceLabel)
          .hide()
          .fadeIn('slow')
      );
      let priceDiffLabel;

      if (listPrice > currentPrice) {
        priceDiffLabel = `<span class='red'>${toMoney(
          listPrice
        )}</span> <br><small class='red'>${toMoney(
          listPrice - currentPrice
        )} overpriced</small></h1>`;
      } else {
        priceDiffLabel = `<span class='green'>${toMoney(
          listPrice
        )}</span> <br><small class='green'>${toMoney(
          currentPrice - listPrice
        )} underpriced</small></h1>`;
      }
      priceDiffLabel = `List Price: ${priceDiffLabel}`;
      $('#kbb').append(
        $('<h1>', {
          id: 'price',
          class: 'priceInfo'
        })
          .html(priceDiffLabel)
          .hide()
          .fadeIn('slow')
      );

      const table = $('<table class="table table-hover">');
      table.append('<thead><tr><th colspan="2"><h2>Kelley Blue Book Prices</h2></th></tr></thead>');
      let colorClass = currentClass === 'excellent' ? `${currentClass} success` : ' ';
      const trExcellent = $(
        `<tr class='${colorClass}'><td id='priceexcellent' class='priceInfo'>Excellent:</td><td>${toMoney(
          kbbPrice.excellent
        )}</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trExcellent);
      colorClass = currentClass === 'verygood' ? `${currentClass} success` : ' ';
      const trVGood = $(
        `<tr class="${colorClass}"><td id="priceverygood" class="priceInfo">Very Good:</td><td>${toMoney(
          kbbPrice.vgood
        )}</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trVGood);
      colorClass = currentClass === 'good' ? 'warning' : ' ';
      const trGood = $(
        `<tr class="${colorClass}"><td id="pricegood" class="priceInfo">Good:</td><td>${toMoney(
          kbbPrice.good
        )}</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trGood);
      colorClass = currentClass === 'fair' ? `${currentClass} danger` : ' ';
      const trFair = $(
        `<tr class="${colorClass}"><td id="pricefair" class="priceInfo">Fair:</td><td>${toMoney(
          kbbPrice.fair
        )}</td></tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trFair);
      $('#kbb').append(table);

      // canvas
      $('#kbb').append($('<div>', { id: 'kbb-price-canvas' }));
      $('#kbb-price-canvas').html(
        `<img id="kbblogo" src="${chrome.extension.getURL(
          '/src/inject/webcode/images/logo240.png'
        )}"/><canvas id="mainCanvas" width="260" height="220"></canvas><div style="display: none"><img src="${chrome.extension.getURL(
          '/src/inject/webcode/images/logo240.png'
        )}" width="1" height="1" alt="Preload of images/logo240.png" /><img src="${chrome.extension.getURL(
          '/src/inject/webcode/images/logo240_2x.png'
        )}" width="1" height="1" alt="Preload of images/logo240_2x.png" /></div>`
      );
      drawCanvas('mainCanvas', {
        kbb: response.meterData,
        listPrice
      });
      $('#kbb')
        .append($(`<img src="https://${response.meterData.href}"/>`))
        .fadeIn('slow');
    } else if (!response.kbbData.zipcode) {
      const restartUrl = response.url.replace(
        /pricetype=(retail|trade-in)/,
        'pricetype=private-party'
      );
      $('#kbb').html(
        `<div class="alert alert-warning"><h3>You need to provide a zipcode above</h3><br><a class="btn kbb-link" href="${restartUrl}">Restart</a></p></div>`
      );

      $('#kbb').append($('<iframe>', { id: 'priceiFrame' }));
      $('#priceiFrame').attr({ src: restartUrl, scrolling: 'yes' });
    } else {
      // $('#kbb').append(
      //   $('<h2>', {
      //     id: 'priceexcellent',
      //     class: 'priceInfo excellent'
      //   })
      //     .html(`Excellent: $${d.data.values.privatepartyexcellent.price}`)
      //     .hide()
      //     .fadeIn('slow')
      // );
      // $('#kbb').append(
      //   $('<h2>', {
      //     id: 'priceverygood',
      //     class: 'priceInfo verygood'
      //   })
      //     .html(`Very Good: $${d.data.values.privatepartyverygood.price}`)
      //     .hide()
      //     .fadeIn('slow')
      // );
      // $('#kbb').append(
      //   $('<h2>', {
      //     id: 'pricegood',
      //     class: 'priceInfo good'
      //   })
      //     .html(`Good: $${d.data.values.privatepartygood.price}`)
      //     .hide()
      //     .fadeIn('slow')
      // );
      // $('#kbb').append(
      //   $('<h2>', {
      //     id: 'pricefair',
      //     class: 'priceInfo fair'
      //   })
      //     .html(`Fair: $${d.data.values.privatepartyfair.price}`)
      //     .hide()
      //     .fadeIn('slow')
      // );
      // const perc =
      //   ((d.data.values.fpp.price - d.data.values.fpp.priceMin) /
      //     (d.data.values.fpp.priceMax - d.data.values.fpp.priceMin)) *
      //   100
      // $('#kbb').append(
      //   $('<div>', { class: 'row' })
      //     .html(
      //       `${'<div class="col-xs-2">' +
      //         '<span class="label label-success">'}${toMoney(
      //         d.data.values.fpp.priceMin
      //       )}</span>` +
      //         '</div><div class="col-xs-7">' +
      //         '<div class="progress">' +
      //         `<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="60" aria-valuemin="${
      //           d.data.values.fpp.priceMin
      //         }" aria-valuemax="${d.data.values.fpp.priceMax}" aria-valuenow="${
      //           d.data.values.fpp.price
      //         }" style="width:${perc}%;">$${
      //           d.data.values.fpp.price
      //         }</div></div></div>` +
      //         '<div class="col-xs-1">' +
      //         `<span class="label label-danger">${toMoney(
      //           d.data.values.fpp.priceMax
      //         )}</span>` +
      //         '</div>'
      //     )
      //     .hide()
      //     .fadeIn('slow')
      // )

      const newUrl = response.url.replace(/pricetype=(retail|trade-in)/, 'pricetype=private-party');
      $('#kbb').html(
        `<div class="alert alert-warning"><h3>Attempting to call KBB.com...</h3><p>KBB has changed or blocked access to their pricing information. Sit tight while we attept to retrieve KBB's market meter or Click on this link to view the price on their site: <br><a target="_blank" href="${newUrl}">${newUrl.substring(
          0,
          50
        )}...</a></p></div>`
      );

      $('#kbb').append($('<iframe>', { id: 'priceiFrame' }));
      $('#priceiFrame').attr({ src: newUrl, scrolling: 'yes' });
    }

    $('#kbb').append(
      $('<a>', {
        href: `${response.url}?${serialize(response.kbbData)}`,
        class: 'btn btn-primary',
        target: '_BLANK'
      })
        .html('Open in KBB.com')
        .hide()
        .fadeIn('slow')
    );
    handleClick(port);
    $('#kbb-progress').slideUp('fast', () => {
      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', `${0}%`);
    });
  } else if (response.type === 'status') {
    console.log(response.message);
    console.log(response.kbbData);
    $('#kbb-progress .progress-bar').attr('aria-valuenow', response.progress);
    $('#kbb-progress .progress-bar').css('width', `${response.progress}%`);
    $('#kbb-progress .progress-bar').text(response.message);
    $('#kbb-progress').slideDown('normal');
  } else if (response.type === 'error') {
    console.log(response.message);
    console.log(response.kbbData);
    makeDropdowns(() => {
      // $('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
      // $('#kbb-progress .progress-bar').css('width', 100 + '%');
      $('#kbb-progress').slideUp('normal', () => {
        $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
        $('#kbb-progress .progress-bar').css('width', `${0}%`);
      });
      $('#kbb').prepend(
        $(
          `<div id='error-box' class='alert alert-danger' role='alert'>Error with Kelley Blue Book <a target='_BLANK' class='btn btn-primary' href='${
            response.url
          }'>Visit KBB.com</a></div>`
        )
          .hide()
          .html(`${response.message}<br>`)
          .fadeIn('slow')
      );
      $('#error-box').append("<div class='timer-warning'>");
      setTimeout(() => {
        const warningMessage = 'Opening kbb.com in background tab';
        $('.timer-warning')
          .html(
            `<div id="kbb-progress" class="progress"><div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">${warningMessage}</div></div>`
          )
          .hide()
          .fadeIn('slow');
      }, 500);
    });
    setTimeout(() => {
      $('.timer-warning').hide();
      window.open(response.url, '_BLANK');
    }, 4000);
  } else if (response.type === 'init_error') {
    if (carInfo.year && carInfo.year < 1994) {
      makeDropdowns(() => {
        // 	$('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
        // 	$('#kbb-progress .progress-bar').css('width', 100 + '%');
        $('#kbb-progress').slideUp('normal', () => {
          $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
          $('#kbb-progress .progress-bar').css('width', `${0}%`);
        });
        $('#kbb').prepend(
          $('<div>')
            .hide()
            .html(
              "<div class='alert alert-warning' role='alert'>Sorry. Kelley Blue Book does not provide information for cars older than 1994</div>"
            )
            .fadeIn('slow')
        );
      });
    } else {
      makeDropdowns(() => {
        // 	$('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
        // 	$('#kbb-progress .progress-bar').css('width', 100 + '%');
        $('#kbb-progress').slideUp('normal', () => {
          $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
          $('#kbb-progress .progress-bar').css('width', `${0}%`);
        });
        $('#kbb').prepend(
          $('<div>')
            .hide()
            .html(
              `<div class='alert alert-warning' role='alert'>Could not get information automatically. Please fill out the form below. ${
                response.message
              }</div>`
            )
            .fadeIn('slow')
        );
      });
    }
  } else {
    console.log(`Type is:${response.type}`);
    $('#kbb-progress').slideUp('normal', () => {});
    $('#kbb')
      .hide()
      .html(response.data)
      .fadeIn('slow');
    $('#kbb').append(
      $('<a>', {
        href: response.url,
        class: 'btn btn-primary',
        target: '_BLANK'
      })
        .html('Open in KBB.com')
        .hide()
        .fadeIn('slow')
    );
    handleClick(port);
  }
  console.log('returned');
};

const makeDropdowns = callback => {
  $.ajax({
    url: 'https://www.kbb.com/jsdata/_makesmodels',
    dataType: 'json',
    type: 'GET',
    data: {
      yearid: carInfo.year
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
      const form = $('<form >', { class: 'form-inline', id: 'kbb-form' });
      const kbbYearGroup = $("<div class='form-group' id='kbb-year-group'>");
      const kbbMakeGroup = $("<div class='form-group' id='kbb-make-group'>");
      const kbbModelGroup = $("<div class='form-group' id='kbb-model-group'>");
      const kbbMileageGroup = $("<div class='form-group' id='kbb-mileage-group'>");

      kbbYearGroup.append($("<label class='sr-only' for='kbb-year'>Year</label>"));
      kbbYearGroup.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-year',
          name: 'year',
          value: carInfo.year
        })
      );

      kbbMakeGroup.append($("<label class='sr-only' for='kbb-make'>Make</label>"));
      kbbMakeGroup.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-make',
          name: 'make',
          value: carInfo.make
        })
      );

      kbbModelGroup.append($("<label class='sr-only' for='kbb-model'>Model</label>"));
      kbbModelGroup.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-model',
          name: 'model',
          value: carInfo.model
        })
      );

      kbbMileageGroup.append($("<label class='sr-only' for='kbb-mileage'>Mileage</label>"));
      kbbMileageGroup.append(
        $('<input>', {
          class: 'form-control',
          id: 'kbb-mileage',
          type: 'text',
          name: 'mileage',
          value: kbbData.mileage,
          placeholder: 'Mileage'
        })
      );

      form.append(kbbYearGroup);
      form.append(kbbMakeGroup);
      form.append(kbbModelGroup);
      form.append(kbbMileageGroup);

      form.append(
        $('<input>', {
          class: 'form-control btn btn-primary',
          id: 'kbb-submit',
          type: 'button',
          name: 'submit',
          value: 'Submit'
        })
      );

      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', `${0}%`);
      $('#kbb-progress').slideUp('normal');
      $('#kbb')
        .hide()
        .html(form)
        .fadeIn('slow');
      $('#kbb-year').append(
        $("<option value='0'>SELECT YEAR</option><option value=''>----</option>")
      );
      $('#kbb-make').append(
        $("<option value=' '>SELECT MAKE</option><option value=''>----</option>")
      );
      $('#kbb-model').append(
        $("<option value=' '>SELECT MODEL</option><option value=''>----</option>")
      );
      for (let i = 1994; i <= new Date().getFullYear(); i += 1) {
        if (i === parseInt(carInfo.year, 10)) {
          $('#kbb-year').append($(`<option selected value='${i}'>${i}</option>`));
        } else {
          $('#kbb-year').append($(`<option value='${i}'>${i}</option>`));
        }
      }
      for (let j = 0; j < data.length; j += 1) {
        if (carInfo.make && carInfo.make.toUpperCase() === data[j].Name.toUpperCase()) {
          for (let k = 0; k < data[j].Model.length; k += 1) {
            if (
              carInfo.model &&
              data[j].Model[k].Name.toUpperCase().includes(carInfo.model.toUpperCase())
            ) {
              $('#kbb-model').append(
                $(
                  `<option selected value='${data[j].Model[k].Name}'>${
                    data[j].Model[k].Name
                  }</option>`
                )
              );
            } else {
              $('#kbb-model').append(
                $(`<option value='${data[j].Model[k].Name}'>${data[j].Model[k].Name}</option>`)
              );
            }
          }
          $('#kbb-make').append(
            $(`<option selected value='${data[j].Name}'>${data[j].Name}</option>`)
          );
        } else {
          $('#kbb-make').append($(`<option value='${data[j].Name}'>${data[j].Name}</option>`));
        }
      }
      handleMakeDropdown(data);
      handleForm(port);
      if (callback) callback();
    }
  });
};

port.onMessage.addListener(handleKBB);
