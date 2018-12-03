/* globals drawCanvas */

/**
 * Convert number to Money Value
 *
 * @param {Number} number
 */
const toMoney = number => number && `$${number.toFixed(0).replace(/\d(?=(\d{3}) + $)/g, '$&,')}`;
/**
 * Convert number to Miles
 * @param {Number} number
 */
const toMiles = number => number && number.toFixed(0).replace(/\d(?=(\d{3}) + $)/g, '$&,');

/**
 * Serialize an object into a query param string
 * @param {Object} obj
 */
const serialize = obj => {
  const str = [];
  Object.keys(obj).forEach(key => {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
  });
  return str.join('&');
};

// Handle the zipcode in chrome sync storage
const getZipcode = callback => {
  chrome.storage.sync.get(['zipcode'], ({ zipcode = '' }) => {
    callback(zipcode);
  });
};

// Create the port to talk to the background script
const port = chrome.runtime.connect({ name: 'kbb-port' });
port.postMessage({ type: 'test', connection: 'Connected!' });

/**
 * Handle the dropdown selection form when user chooses dropdown items
 */
const handleForm = (newPort, kbbData) => {
  $('#kbb-submit').on('click', e => {
    e.preventDefault();
    const year = $('#kbb-year')
      .val()
      .toLowerCase();
    const make = $('#kbb-make')
      .val()
      .toLowerCase();
    const model = $('#kbb-model')
      .val()
      .toLowerCase();
    const newUrl = `https://www.kbb.com/${make}/${model}/${year}/styles/?intent=buy-used&mileage=${$(
      '#kbb-mileage'
    ).val()}`.replace(/ /g, '-');
    const newMatch = newUrl.match(/(style|options|categories|\/condition\/)/i);
    const newType = newMatch ? newMatch[0].replace(/\//g, '') : 'default';
    $('#kbb-progress').slideDown('slow');

    newPort.postMessage({ type: newType, url: newUrl, kbbData });
    newPort.onMessage.addListener(response => {
      handleResponse(response);
    });
  });
};

/**
 * When the make is selected, generate the models for that make in the dropdown
 * @param {Object} data - The data for the makes of a specific model
 */
const handleMakeDropdown = data => {
  $('#kbb-make').bind('change', function change() {
    $('#kbb-model')
      .find('option')
      .remove()
      .add('<option value="0">Model</option><option value="">----</option>');
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

/**
 * Make the dropdowns when cars can't be matched
 * @param {function} callback
 */
const makeDropdowns = (callback, carInfo, kbbData) => {
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
      const form = $('<form >', { class: 'form-inline', id: 'kbb-form' });
      const kbbYearGroup = $('<div class="form-group" id="kbb-year-group">');
      const kbbMakeGroup = $('<div class="form-group" id="kbb-make-group">');
      const kbbModelGroup = $('<div class="form-group" id="kbb-model-group">');
      const kbbMileageGroup = $('<div class="form-group" id="kbb-mileage-group">');

      kbbYearGroup.append($('<label class="sr-only" for="kbb-year">Year</label>'));
      kbbYearGroup.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-year',
          name: 'year',
          value: carInfo.year
        })
      );

      kbbMakeGroup.append($('<label class="sr-only" for="kbb-make">Make</label>'));
      kbbMakeGroup.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-make',
          name: 'make',
          value: carInfo.make
        })
      );

      kbbModelGroup.append($('<label class="sr-only" for="kbb-model">Model</label>'));
      kbbModelGroup.append(
        $('<select>', {
          class: 'form-control',
          id: 'kbb-model',
          name: 'model',
          value: carInfo.model
        })
      );

      kbbMileageGroup.append($('<label class="sr-only" for="kbb-mileage">Mileage</label>'));
      kbbMileageGroup.append(
        $('<input>', {
          class: 'form-control',
          id: 'kbb-mileage',
          type: 'text',
          name: 'mileage',
          value: carInfo.odometer,
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
        $('<option value="0">SELECT YEAR</option><option value="">----</option>')
      );
      $('#kbb-make').append(
        $('<option value=" ">SELECT MAKE</option><option value="">----</option>')
      );
      $('#kbb-model').append(
        $('<option value=" ">SELECT MODEL</option><option value="">----</option>')
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
      handleForm(port, kbbData);
      if (callback) callback();
    }
  });
};

/**
 * Handle a click on the links from kbb in craigslist
 */
const handleClick = (newPort, data) => {
  // if a link has the class .kbb-link which was added in the background script, then handle it ourselves
  $('.kbb-link').on('click', e => {
    e.preventDefault();
    $('#kbb-progress').slideDown();
    const newUrl = e.currentTarget.getAttribute('href');
    const newMatch = newUrl.match(/(style|options|categories|\/condition\/)/i);
    const newType = newMatch ? newMatch[0].replace(/\//g, '') : 'default';
    newPort.postMessage({ type: newType, url: newUrl, kbbData: data });
    newPort.onMessage.addListener(response => {
      handleResponse(response);
    });
  });
};

/**
 * Handle the data that comes from the background script
 * @param {Object} response
 */
const handleKBB = (response, data) => {
  if (response.type === 'kbb-background') {
    $('#kbb').append(
      $(`<div class='kbb-price'>${response.kbbData}</div>`)
        .hide()
        .fadeIn('slow')
    );
    handleClick(port, data);
    $('#kbb-progress').slideUp('fast', () => {
      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', `${0}%`);
    });
  }
};

// store the title and body texts
const postingTitle = $('#titletextonly').text();
const priceText = $('.price').text();
const postingBody = $('#postingbody').text();

// Get the list price from the posting title and body
const titlePrice = postingTitle.match(/\$([\d,]+)/i);
const bodyPrice = postingBody.match(/\$([\d,]+)/);

// set the list price
let [, listPrice] = priceText.match(/\$([\d,]+)/i) || [0, 0];
if (!listPrice) {
  if (titlePrice && titlePrice.length > 1) {
    listPrice = Number(titlePrice[1].replace(/k/, '000'));
  }

  if (listPrice < 99) {
    if (bodyPrice && bodyPrice.length > 1) {
      listPrice = Number(bodyPrice[1].replace(/k/, '000'));
    }
  }
}
// convert to number
listPrice = Number(listPrice);

/**
 * All of the conditions constants
 */
const conditions = {
  excellent: ['like new', 'new', 'excellent'],
  'very good': ['great'],
  good: ['good', 'ok', 'okay'],
  fair: ['fair', 'bad']
};

/**
 * Parse through Craigslist and get the car data
 */
const carInfo = {};

// The first one is the name of the car
carInfo.car = $('.attrgroup')
  .first()
  .find('span')
  .text()
  .trim();
// look for numbers like 1998 or 2020 that could be a year
const yearMatches = carInfo.car.match(/(19|20)[0-9]{2}/);
carInfo.year = yearMatches ? yearMatches[0] : null;

// These are the small spans right under the map
$.each($('.mapAndAttrs p.attrgroup').find('span'), (i, el) => {
  const e = $(el)
    .text()
    .split(':');
  // parse through each item, e.g. make:toyota and store it
  if (typeof e[1] !== 'undefined') {
    carInfo[e[0].trim()] = e[1].trim();
  }
});
const found = 'searching';

// Go through and check to see if the condition that was set can match one on kbb
carInfo.condition = conditions.excellent.includes(carInfo.condition)
  ? 'excellent'
  : carInfo.condition;
carInfo.condition = conditions['very good'].includes(carInfo.condition)
  ? 'very good'
  : carInfo.condition;
carInfo.condition = conditions.good.includes(carInfo.condition) ? 'good' : carInfo.condition;
carInfo.condition = conditions.fair.includes(carInfo.condition) ? 'fair' : carInfo.condition;

// If a condition is not found, set it to good
if (!carInfo.condition) {
  carInfo.condition = 'good';
}

// get the mileage from the title or the body
if (!carInfo.odometer) {
  const titleMileage = postingTitle.match(/[^$0-9](\d{2,3}(,| )?(000|k|xxx|\d{3}))/i);
  const bodyMileage = postingBody.match(/[^$0-9](\d{2,3}(,| )?(000|k|xxx|\d{3}))/i);

  if (titleMileage && titleMileage.length > 1) {
    carInfo.odometer = titleMileage[1]
      .replace(/k/i, '000')
      .replace(/,/, '')
      .replace(/xxx/i, '000');
  } else if (bodyMileage && bodyMileage.length > 1) {
    carInfo.odometer = bodyMileage[1]
      .replace(/k/i, '000')
      .replace(/,/, '')
      .replace(/xxx/i, '000');
  }
}

/**
 * Add the kbb panel to Craigslist
 */
$('.mapAndAttrs').prepend(
  $('<div>')
    .attr('id', 'kbb-frame')
    .hide()
    .fadeIn('slow')
);
// Add the title
$('#kbb-frame').append(
  $('<h1 id="kbb-title">')
    .html(
      `<img
        height="25"
        width="25"
        class="img-rounded"
        src="${chrome.extension.getURL('/icons/kbblogo48.png')}"/>
        Kelley Blue Book`
    )
    .hide()
    .fadeIn('slow')
);
// Add the list price
$('#kbb-frame').append(
  $('<h1 id="listPrice">')
    .html(`List Price: <span>${toMoney(listPrice)}</span>`)
    .hide()
    .fadeIn('slow')
);
// Add the progress bar
$('#kbb-frame').append(
  `<div id="kbb-progress" class="progress">
  <div
    class="progress-bar
    progress-bar-striped
    active"
    role="progressbar"
    aria-valuenow="0"
    aria-valuemin="0"
    aria-valuemax="20"
    style="width: 20%">
      Loading...
    </div>
  </div>`
);
// add the zipcode form
$('#kbb-progress').after(
  $('<h1 id="kbb-form">')
    .html(
      `<form id="#kbb-zipcode-form" class="form-inline" onsubmit="event.preventDefault(); return false;">
        <div class="form-group">
          <input class="btn" name="zipcode-submit" type="submit">
          <span id="zipcode-saved">
          </span>
        </div>
      </form>`
    )
    .hide()
    .fadeIn('slow')
);

/**
 * This is the object that will hold all the kbb url params
 */
let kbbData = {};

// fadein everything into the frame
$('#kbb-frame').append(
  $('<div>')
    .attr('id', 'kbb')
    .hide()
    .fadeIn('slow')
);
// $('#kbb-frame').append($("<div id='kbb-iframe'>"));
// $('#kbb-iframe').append("<iframe id='priceiFrame' src='about:none'>");

// update the progress bar
$('#kbb-progress .progress-bar').attr('aria-valuenow', 20);
$('#kbb-progress .progress-bar').css('width', `${20}%`);

// Set the initial kbbData
kbbData = Object.assign({}, kbbData, {
  intent: 'buy-used',
  pricetype: 'private-party',
  mileage: Number(carInfo.odometer),
  bodystyle: carInfo.type,
  condition: carInfo.condition
});

const n = kbbData.mileage;
// if mileage is NaN, set it to 0
kbbData.mileage = Number.isNaN(n) ? 0 : n;
// if mileage is less than 1000, then it must be in thousands, multiply by 1000
kbbData.mileage = n < 1000 ? n * 1000 : n;

$(document).ready(() => {
  $(`#${found}KBB`).insertAfter('#kbb-frame');
});

// x = kbbData.mileage ? (m = carInfo.odometer) : 0;
// bx = (b = kbbData.bodystyle) ? (b = carInfo.type) : 0;
// cx = (b = kbbData.condition) ? (b = carInfo.condition) : 0;
// kbbData.vehicleid = carInfo.VIN;

// Get the zipcode from chrome sync settings
getZipcode(zipcode => {
  // Add a form input with the stored zipcode
  $('[name=zipcode-submit]').before(
    `<input placeholder="Zipcode" class="form-control" type="text" name="zipcode" value="${zipcode}"/>`
  );

  $.getJSON(chrome.extension.getURL('src/inject/js/makes_generated.json'), carMakes => {
    const carMakeRegex = Object.keys(carMakes).join('|');
    const makeMatches = carInfo.car.match(new RegExp(`(${carMakeRegex})`, 'i'));
    carInfo.make = makeMatches ? makeMatches[1] : null;
    if (!carInfo.make) {
      const titleMatches = postingTitle.match(new RegExp(`(${carMakeRegex})`, 'i'));
      carInfo.make = titleMatches ? titleMatches[1] : null;
    }

    if (!carInfo.make) {
      const bodyMatches = postingBody.match(new RegExp(`(${carMakeRegex})`, 'i'));
      carInfo.make = bodyMatches ? bodyMatches[1] : null;
    }

    // replace the year and make, and you should be left with the model
    const yearRegex = new RegExp(carInfo.year, 'g');
    [carInfo.model] = carInfo.car
      .replace(yearRegex, '')
      .replace(carInfo.make, '')
      .trim()
      .split(' ');

    // If there's no car model, then get it from the posting title
    if (!carInfo.model) {
      const regex = new RegExp(`${carInfo.year}\\s${carInfo.make}\\s(\\w+)\\s`, 'i');
      const model = postingTitle.match(regex);
      if (model && model.length > 1) {
        [, carInfo.model] = model;
      }
    }
    if (!carInfo.model) {
      carInfo.model = postingTitle
        .replace(carInfo.year, '')
        .replace(carInfo.make, '')
        .replace(carInfo.listPrice, '')
        .replace(/-./)
        .trim();
    }
    if (!carInfo.model) {
      const regex = new RegExp(`${carInfo.year}\\s${carInfo.make}\\s(\\w+)\\s`, 'i');
      const model = postingBody.match(regex);
      if (model && model.length > 1) {
        [, carInfo.model] = model;
      }
    }

    // Normalize the make to the correct make
    if (carInfo.make) {
      carInfo.make = carMakes[carInfo.make.toLowerCase()];
    }

    // set the zipcode
    kbbData.zipcode = zipcode;
    carInfo.zipcode = zipcode;

    // Get the initial URL to retrieve from kbb
    const { make, model, year } = carInfo;
    const url = `https://www.kbb.com/${make}/${model}/${year}/styles/`.replace(/\s/g, '-');
    // $('head').prepend($('<base>').attr('href','https://www.kbb.com/'));
    const m = url.match(/(style|options|categories|\/condition\/)/i);
    const type = m ? m[0].replace(/\//g, '') : 'default';

    // Send a message to the background
    port.postMessage({
      type,
      url,
      kbbData,
      carInfo
    });
  });
});

// Attach the click handler
handleClick(port, kbbData);

// Attach the zipcode form handler which stores the zipcode
const handleZipcode = () => {
  $('#kbb-form').on('submit', e => {
    e.preventDefault();
    const zipcode = e.target[0].value;
    carInfo.zipcode = zipcode;
    kbbData.zipcode = zipcode;
    chrome.storage.sync.set({ zipcode });

    // display the saved text when updating zipcode
    $('#zipcode-saved')
      .html('<font color="green">Saved!</font>')
      .fadeIn()
      .fadeOut();
    return false;
  });
};
handleZipcode();

// Handle the response from the backend
const handleResponse = response => {
  if (response.type === 'default') {
    // Make sure the data is legit and can be parsed without errors
    if (
      response &&
      response.meterData &&
      response.meterData.data &&
      response.meterData.data.apiData &&
      response.meterData.data.apiData.vehicle &&
      response.meterData.data.apiData.vehicle.values &&
      response.meterData.data.apiData.vehicle.values.length
    ) {
      // Get the price objects for each tier
      const [excellent, vgood, good, fair] = response.meterData.data.apiData.vehicle.values;

      // Get the base prices
      const kbbPrice = {
        excellent: excellent.base,
        vgood: vgood.base,
        good: good.base,
        fair: fair.base
      };
      const { mileage } = response.kbbData;

      // set the current price based on condition
      let currentPrice;
      if (kbbPrice[carInfo.condition]) {
        currentPrice = kbbPrice[carInfo.condition];
      } else {
        currentPrice = kbbPrice.fair;
      }

      // Set the color class
      const cd = carInfo.condition;
      const currentClass = cd ? cd.replace(/\s/, '') : 'fair';
      const priceLabel = `Kbb Price: <span class='${currentClass}'>${toMoney(currentPrice)}</span>`;

      // Get the image div from backend
      $('#kbb')
        .hide()
        .html($(response.img))
        .fadeIn('slow');

      // Mileage
      $('#kbb').prepend($(`<h2>Mileage: ${toMiles(Number(mileage))}<h2>`));
      // Car Info
      $('#kbb').prepend(
        $('<h2>', {
          id: 'carInfo'
        }).html(`${carInfo.year} ${carInfo.make} ${carInfo.model}`)
      );
      // Price Info
      $('#kbb').append(
        $('<h1>', {
          id: 'price',
          class: 'priceInfo'
        })
          .html(priceLabel)
          .hide()
          .fadeIn('slow')
      );
      // Get the price Diff and change colors
      let priceDiffLabel;
      if (listPrice > currentPrice) {
        priceDiffLabel = `
        <span class='red'>
          ${toMoney(listPrice)}
        </span>
        <br>
        <small class='red'>
          ${toMoney(listPrice - currentPrice)} overpriced
        </small>`;
      } else {
        priceDiffLabel = `<span class='green'>${toMoney(listPrice)}</span> <br>
        <small class='green'>${toMoney(currentPrice - listPrice)} underpriced</small>`;
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

      // Create a table of prices
      const table = $('<table class="table table-hover">');
      table.append(`<thead>
      <tr>
        <th colspan="2">
          <h2>Kelley Blue Book Prices</h2>
        </th>
      </tr>
      </thead>`);
      let colorClass = currentClass === 'excellent' ? `${currentClass} success` : ' ';
      const trExcellent = $(
        `<tr class='${colorClass}'>
          <td id='priceexcellent' class='priceInfo'>
            Excellent:
          </td>
          <td>
            ${toMoney(kbbPrice.excellent)}
          </td>
        </tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trExcellent);
      colorClass = currentClass === 'verygood' ? `${currentClass} success` : ' ';
      const trVGood = $(
        `<tr class="${colorClass}">
          <td id="priceverygood" class="priceInfo">
            Very Good:
          </td>
          <td>
            ${toMoney(kbbPrice.vgood)}
          </td>
        </tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trVGood);
      colorClass = currentClass === 'good' ? 'warning' : ' ';
      const trGood = $(
        `<tr class="${colorClass}">
          <td id="pricegood" class="priceInfo">Good:</td>
          <td>
            ${toMoney(kbbPrice.good)}
          </td>
        </tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trGood);
      colorClass = currentClass === 'fair' ? `${currentClass} danger` : ' ';
      const trFair = $(
        `<tr class="${colorClass}">
          <td id="pricefair" class="priceInfo">
            Fair:
          </td>
          <td>
            ${toMoney(kbbPrice.fair)}
          </td>
        </tr>`
      )
        .hide()
        .fadeIn('slow');
      table.append(trFair);
      $('#kbb').append(table);

      // canvas for drawing the meter
      $('#kbb').append($('<div>', { id: 'kbb-price-canvas' }));
      $('#kbb-price-canvas').html(
        `<img id="kbblogo" src="${chrome.extension.getURL('/src/inject/images/logo240.png')}"/>
        <canvas id="mainCanvas" width="260" height="220">
        </canvas>
        <div style="display: none">
          <img 
            src="${chrome.extension.getURL('/src/inject/images/logo240.png')}"
            width="1"
            height="1"
            alt="Preload of images/logo240.png" 
          />
          <img
            src="${chrome.extension.getURL('/src/inject/images/logo240_2x.png')}"
            width="1"
            height="1"
            alt="Preload of images/logo240_2x.png" 
          />
        </div>`
      );

      // Draw the actual canvas
      drawCanvas('mainCanvas', {
        kbb: response.meterData,
        listPrice
      });
      $('#kbb')
        .append($(`<img src="https://${response.meterData.href}"/>`))
        .fadeIn('slow');
    } else if (!response.kbbData.zipcode) {
      // If no zipcode was provided, let the user know, and give them a restart link
      const restartUrl = response.url.replace(
        /pricetype=(retail|trade-in)/,
        'pricetype=private-party'
      );
      $('#kbb').html(
        `<div class="alert alert-warning">
        <h3>You need to provide a zipcode above</h3>
          <br>
            <a class="btn kbb-link" href="${restartUrl}}">Restart</a>
          </p>
        </div>`
      );

      $('#kbb').append($('<iframe>', { id: 'priceiFrame' }));
      $('#priceiFrame').attr({ src: restartUrl, scrolling: 'yes' });
    } else {
      // // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
      //       `<div class="col-xs-2">
      //         <span class="label label-success">
      //         ${toMoney(d.data.values.fpp.priceMin)}
      //         </span>
      //       </div>
      //       <div class="col-xs-7">
      //         <div class="progress">
      //           <div
      //           class="progress-bar
      //           progress-bar-success"
      //           role="progressbar"
      //           aria-valuenow="60"
      //           aria-valuemin="${d.data.values.fpp.priceMin}"
      //           aria-valuemax="${d.data.values.fpp.priceMax}"
      //           aria-valuenow="${d.data.values.fpp.price}"
      //           style="width:${perc}%;">
      //             $${d.data.values.fpp.price}
      //           </div>
      //         </div>
      //       </div>
      //       <div class="col-xs-1">
      //         <span class="label label-danger">
      //           ${toMoney(d.data.values.fpp.priceMax)}
      //         </span>
      //       </div>`
      //     )
      //     .hide()
      //     .fadeIn('slow')
      // )
      // // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

      // If error, give the user a link to kbb.com
      const newUrl = response.url.replace(/pricetype=(retail|trade-in)/, 'pricetype=private-party');
      $('#kbb').html(
        `<div class="alert alert-warning">
        <h3>Attempting to call KBB.com...</h3>
        <p>KBB has changed or blocked access to their pricing information. Sit tight while we attept to retrieve KBB's market meter or Click on this link to view the price on their site: <br>
        <a target="_blank" href="${newUrl}">${newUrl.substring(0, 50)}...</a>
        </p>
        </div>`
      );

      // Show the kbb iFrame too
      $('#kbb').append($('<iframe>', { id: 'priceiFrame' }));
      $('#priceiFrame').attr({ src: newUrl, scrolling: 'yes' });
    }

    // Append the button to open in kbb
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
    handleClick(port, kbbData);

    // Hide the slide
    $('#kbb-progress').slideUp('fast', () => {
      $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
      $('#kbb-progress .progress-bar').css('width', `${0}%`);
    });
  } else if (response.type === 'status') {
    $('#kbb-progress .progress-bar').attr('aria-valuenow', response.progress);
    $('#kbb-progress .progress-bar').css('width', `${response.progress}%`);
    $('#kbb-progress .progress-bar').text(response.message);
    $('#kbb-progress').slideDown('normal');
  } else if (response.type === 'error') {
    makeDropdowns(
      () => {
        // $('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
        // $('#kbb-progress .progress-bar').css('width', 100 + '%');
        $('#kbb-progress').slideUp('normal', () => {
          $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
          $('#kbb-progress .progress-bar').css('width', `${0}%`);
        });
        $('#kbb').prepend(
          $(
            `<div id='error-box' class='alert alert-danger' role='alert'>
            Error with Kelley Blue Book 
            <a
              target='_BLANK'
              class='btn
              btn-primary'
              href='${response.url}'>
              Visit KBB.com
            </a>
          </div>`
          )
            .hide()
            .html(`${response.message}<br>`)
            .fadeIn('slow')
        );
        $('#error-box').append('<div class="timer-warning">');
        // Open KBB in the background
        // setTimeout(() => {
        //   const warningMessage = 'Opening kbb.com in background tab';
        //   $('.timer-warning')
        //     .html(
        //       `<div id="kbb-progress" class="progress">
        //         <div
        //           class="progress-bar
        //           progress-bar-danger
        //           progress-bar-striped
        //           active"
        //           role="progressbar"
        //           aria-valuenow="100"
        //           aria-valuemin="0"
        //           aria-valuemax="100"
        //           style="width: 100%">
        //           ${warningMessage}
        //         </div>
        //       </div>`
        //     )
        //     .hide()
        //     .fadeIn('slow');
        // }, 500);
      },
      carInfo,
      kbbData
    );
    // setTimeout(() => {
    //   $('.timer-warning').hide();
    //   window.open(response.url, '_BLANK');
    // }, 4000);
  } else if (response.type === 'init_error') {
    // Couldn't get the URL, so show dropdown menus to let user select manually
    if (carInfo.year && carInfo.year < 1994) {
      makeDropdowns(
        () => {
          // 	$('#kbb-progress .progress-bar').attr('aria-valuenow', 100);
          // 	$('#kbb-progress .progress-bar').css('width', 100 + '%');
          $('#kbb-progress').slideUp('normal', () => {
            $('#kbb-progress .progress-bar').attr('aria-valuenow', 0);
            $('#kbb-progress .progress-bar').css('width', `${0}%`);
          });
          // Show error that KBB doesn't allow cars older than 1994
          $('#kbb').prepend(
            $('<div>')
              .hide()
              .html(
                `<div class="alert alert-warning" role="alert">
                Sorry. Kelley Blue Book does not provide information for cars older than 1994
              </div>`
              )
              .fadeIn('slow')
          );
        },
        carInfo,
        kbbData
      );
    } else {
      makeDropdowns(
        () => {
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
        },
        carInfo,
        kbbData
      );
    }
  } else {
    // Hide the progress bar
    $('#kbb-progress').slideUp('normal');
    $('#kbb')
      .hide()
      .html(response.data)
      .fadeIn('slow');

    // append the open KBB button
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
    handleClick(port, kbbData);
  }
};

port.onMessage.addListener(response => {
  handleKBB(response, kbbData);
});

// When receiving a message, handle the response data
port.onMessage.addListener(response => {
  handleResponse(response);
});
