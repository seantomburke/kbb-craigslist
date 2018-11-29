$('<div>', { id: 'kbb-iframe' }).appendTo('body');
const cars = [];

function handleClick(port) {
  $('.kbb-link').on('click', function click(e) {
    console.log(e);
    e.preventDefault();
    const url = $(this).attr('href');
    const m = $(this)
      .attr('href')
      .match(/(style|options|categories)/);
    const type = m ? m[0] : 'default';
    console.log(url);
    console.log(type);
    port.postMessage({ type, url });
    port.onMessage.addListener(response => {
      console.log(response);
      $('#kbb').html(response.data);
      console.log('returned');
    });
  });
}

// function serialize(obj) {
//   const str = [];
//   Object.keys(obj).forEach((key) => {
//     str.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
//   });
//   return str.join('&');
// }

function removeDuplicateQueries(url, data) {
  const output = {};
  if (url.length === 0) {
    return url;
  }

  output.data = data || {};
  const anchor = document.createElement('a');
  anchor.href = url;
  const search = anchor.search.substr(1);
  console.log(search);
  const urlInside = decodeURI(search.replace(/&/g, '","').replace(/=/g, '":"'));
  console.log(urlInside);
  if (urlInside) {
    const urlVars = JSON.parse(`{"${urlInside}"}`);
    Object.keys(urlVars).forEach(key => {
      output.data[key] = urlVars[key];
    });
  }
  output.url = `${anchor.protocol}//${anchor.host}${anchor.pathname || ''}${anchor.hash || ''}`;

  return output;
}

chrome.runtime.onConnect.addListener(port => {
  // console.assert(port.name === 'kbb-port');
  console.log(port);
  port.onMessage.addListener(function kbbAJAX(request) {
    if (request.url && request.url.length > 0) {
      request.url = request.url.replace(/intent=buy-new/g, 'intent=buy-used');
      const duplicateData = removeDuplicateQueries(request.url, request.kbbData);
      request.url = duplicateData.url;
      request.kbbData = duplicateData.data;
      console.log(request.url);
    }
    if (request.type === 'popup') {
      port.postMessage({ cars, type: 'popup' });
    } else if (request.type === 'test') {
      console.log('Connected!');
    } else if (request.type === 'kbb-price') {
      console.log(request.data);
      port.postMessage({ type: 'kbb-background', kbbData: request.data });
    } else if (request.type === 'categories' || request.type === 'category') {
      console.log('categories script started');
      port.postMessage({
        type: 'status',
        progress: 41,
        message: 'Categories...'
      });
      $.ajax({
        url: request.url,
        dataType: 'html',
        type: 'GET',
        data: request.kbbData,
        error(jqXHR, textStatus, errorThrown) {
          console.log('error', request.url);
          console.log(jqXHR, textStatus, errorThrown);
          port.postMessage({
            jqXHR,
            textStatus,
            errorThrown,
            type: 'error',
            url: request.url,
            message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
              request.url
            }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
          });
        },
        success(data) {
          console.log('categories sucess!');
          const extracted = $($.parseHTML(data)).find('.categories-section');
          console.log(extracted);
          extracted.find('aside').remove();
          // if(extracted.find('.selected'))
          // extracted.find('.mod-category').not('.selected').remove();
          $.each(extracted.find('a'), (i, el) => {
            const e = $(el);
            e.attr('target', '_BLANK');
            e.attr('onclick', '');
            e.addClass('kbb-link');
            const b = e.attr('href');
            const matches = b ? b.match(/javascript/) : false;
            if (matches) {
              e.remove();
            } else {
              e.attr('href', `https://www.kbb.com${e.attr('href')}`);
            }
          });
          port.postMessage({
            url: request.url,
            kbbData: request.kbbData,
            data: $(extracted).html(),
            type: 'style'
          });
          handleClick(port);
        }
      });
    } else if (request.type === 'style') {
      console.log('starting styles script');
      console.log(request.url);
      port.postMessage({ type: 'status', progress: 41, message: 'Styles...' });
      $.ajax({
        url: request.url,
        dataType: 'html',
        type: 'GET',
        data: request.kbbData,
        error(jqXHR, textStatus, errorThrown) {
          console.log('error', request.url);
          console.log(jqXHR, textStatus, errorThrown);
          if (request.kbbData.bodystyle) {
            delete request.kbbData.bodystyle;
            kbbAJAX(request);
          } else {
            port.postMessage({
              url: request.url,
              kbbData: request.kbbData,
              data: 'error',
              type: 'init_error',
              message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
                request.url
              }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
            });
          }
        },
        success(data, responseText, jqXHR) {
          let extracted;
          console.log(responseText);
          console.log(jqXHR);
          console.log('Styles Success!');
          const matches = $($.parseHTML(data))
            .find('.breadcrumbs')
            .text()
            .match(/>(\w+)$/m);
          const location = matches && matches.length > 0 ? matches[1].toLowerCase() : 'style';
          console.log(location);
          if (location === 'style') {
            extracted = $($.parseHTML(data)).find('.styles-section');
            extracted.find('aside').remove();
            extracted.find('*').removeClass('collapse');
            extracted.find('*').removeClass('hidden');
            // if(extracted.find('.selected'))
            // extracted.find('.mod-category').not('.selected').remove();
            $.each(extracted.find('a'), (i, el) => {
              const e = $(el);
              e.attr('target', '_BLANK');
              e.attr('onclick', '');
              e.addClass('kbb-link');
              const b = e.attr('href');
              const linkMatches = b ? b.match(/javascript/) : false;
              if (linkMatches) {
                e.remove();
              } else {
                e.attr('href', `https://www.kbb.com${e.attr('href')}`);
              }
            });
            console.log(request.type);
            const m = request.url.match(/(style|options|categories|\/condition\/)/);
            const type = m ? m[0].replace(/\//g, '') : 'default';
            port.postMessage({
              url: request.url,
              kbbData: request.kbbData,
              data: $(extracted).html(),
              type
            });
            handleClick(port);
          } else {
            console.log(location);
            kbbAJAX({
              url: request.url,
              kbbData: request.kbbData,
              data: $(extracted).html(),
              type: location
            });
          }
        }
      });
    } else if (request.type === 'options') {
      console.log('starting options script');
      port.postMessage({
        type: 'status',
        progress: 51,
        message: 'Choosing Options...'
      });
      $.ajax({
        url: request.url,
        dataType: 'html',
        type: 'GET',
        data: request.kbbData,
        error(jqXHR, textStatus, errorThrown) {
          console.log('error', request.url);
          console.log(jqXHR, textStatus, errorThrown);
          port.postMessage({
            jqXHR,
            textStatus,
            errorThrown,
            type: 'error',
            url: request.url,
            message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
              request.url
            }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
          });
        },
        success(data) {
          console.log('options success!');
          const extracted = $($.parseHTML(data));
          const a = $(extracted.find('[href*=vehicleid]'));
          const vehicleUrl = a ? a.attr('href') : '';
          const matches = vehicleUrl.match(/vehicleid=(\d+)/);
          const vehicleid = matches && matches.length > 0 ? matches[1] : null;
          request.kbbData.vehicleid = vehicleid;
          console.log(extracted);
          $.each(extracted.find('a'), (i, el) => {
            const e = $(el);
            e.attr('target', '_BLANK');
            e.attr('onclick', '');
            e.addClass('kbb-link');
            const b = e.attr('href');
            const anchorMatches = b ? b.match(/javascript/) : false;
            if (anchorMatches) {
              e.remove();
            } else {
              e.attr('href', `https://www.kbb.com${e.attr('href')}`);
            }
          });
          handleClick(port);
          let url = $(extracted)
            .find('.js-path-next-default')
            .attr('href');
          let type;
          console.log(
            $(extracted)
              .find('.js-path-next-default')
              .attr('href')
          );
          console.log($(extracted).find('#Deal-finder'));
          if (
            $(extracted)
              .find('.js-path-next-default')
              .attr('href')
          ) {
            url = $(extracted)
              .find('.js-path-next-default')
              .attr('href');
            const n = url.match(/(style|options|categories|\/condition\/)/);
            type = n ? n[0].replace(/\//g, '') : 'default';
            kbbAJAX({
              url,
              kbbData: request.kbbData,
              data: $(extracted).html(),
              type
            });
          } else if ($(extracted).find('#Deal-finder')) {
            url = $(extracted)
              .find('#Deal-finder')
              .find('a')
              .attr('href');
            type = 'new';
            kbbAJAX({
              url,
              kbbData: request.kbbData,
              data: $(extracted).html(),
              type
            });
          } else {
            type = 'error';
            kbbAJAX({
              url,
              kbbData: request.kbbData,
              data: $(extracted).html(),
              type
            });
          }
        }
      });
    } else if (request.type === 'default') {
      console.log('starting default script');
      request.url = request.url.replace(/\/valuetype/, '');
      port.postMessage({
        type: 'status',
        progress: 100,
        message: 'Getting Price...'
      });
      $.ajax({
        url: request.url,
        dataType: 'html',
        type: 'GET',
        data: request.kbbData,
        error(jqXHR, textStatus, errorThrown) {
          console.log('error', request.url);
          console.log(jqXHR, textStatus, errorThrown);
          port.postMessage({
            jqXHR,
            textStatus,
            errorThrown,
            type: 'error',
            url: request.url,
            message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
              request.url
            }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
          });
        },
        success(data) {
          // var iframe = $('<iframe>', {
          //   srcdoc: $(data),
          //   name: 'price-iframe',
          //   id: 'price-iframe',
          //   width: '500px',
          //   height: '1000px',
          //   scrolling: 'yes',
          //   sandbox:
          //     'allow-same-origin allow-scripts allow-top-navigation allow-forms',
          // });
          const extracted = $($.parseHTML(data));
          const pic = extracted.find('#buyerHubOverview');
          const a = $(extracted.find('[href*=vehicleid]'));
          const vehicleUrl = a ? a.attr('href') : '';
          const matches = vehicleUrl.match(/vehicleid=(\d+)/);
          const vehicleid = matches && matches.length > 0 ? matches[1] : null;
          request.kbbData.vehicleid = vehicleid;
          $('#kbb-iframe').html(extracted);
          // extracted.find('aside').remove();
          // if(extracted.find('.selected'))
          // extracted.find('.mod-category').not('.selected').remove();
          $.each(extracted.find('a'), (i, el) => {
            const e = $(el);
            e.attr('target', '_BLANK');
            e.attr('onclick', '');
            e.addClass('kbb-link');
            const b = e.attr('href');
            const moreMatches = b ? b.match(/javascript/) : false;
            if (moreMatches) {
              e.remove();
            } else {
              e.attr('href', `https://www.kbb.com${e.attr('href')}`);
            }
          });

          const meterUrl =
            'https://www.kbb.com/Api/3.9.242.0/67434/vehicle/upa/PriceAdvisor/meter.json';
          const meterData = {
            action: 'Get',
            intent: 'buy-used',
            pricetype: 'Private Party',
            zipcode: request.kbbData.zipcode,
            vehicleid: request.kbbData.vehicleid,
            hideMonthlyPayment: 'True',
            condition: request.kbbData.condition,
            mileage: request.kbbData.mileage
          };

          $.ajax({
            url: meterUrl,
            dataType: 'json',
            type: 'GET',
            data: meterData,
            error(jqXHR, textStatus, errorThrown) {
              console.log('error', request.url);
              console.log(jqXHR, textStatus, errorThrown);
              port.postMessage({
                jqXHR,
                textStatus,
                errorThrown,
                type: 'error',
                url: request.url,
                message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
                  request.url
                }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
              });
            },
            success(dataFromMeter) {
              $(document).ready(() => {
                port.postMessage({
                  url: request.url,
                  kbbData: request.kbbData,
                  data,
                  img: $(pic).html(),
                  meterData: dataFromMeter,
                  type: request.type
                });
                cars.push([
                  {
                    info: request.kbbData
                    // price: carPriceInfo,
                  }
                ]);
              });
              handleClick(port);
            }
          });
        }
      });
    } else if (request.type === 'condition') {
      console.log('starting condition script');
      const pricetype =
        port.sender.url.match(/(cto|ctd)/)[0] === 'cto' ? 'private-party' : 'retail';
      request.kbbData.pricetype = pricetype;
      port.postMessage({
        type: 'status',
        progress: 61,
        message: 'Selecting Condition...'
      });
      $.ajax({
        url: request.url,
        dataType: 'html',
        type: 'GET',
        data: request.kbbData,
        error(jqXHR, textStatus, errorThrown) {
          console.log('error', request.url);
          console.log(jqXHR, textStatus, errorThrown);
          port.postMessage({
            jqXHR,
            textStatus,
            errorThrown,
            type: 'error',
            url: request.url,
            message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
              request.url
            }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
          });
        },
        success(data) {
          const extracted = $($.parseHTML(data)).find('.condition-section');
          extracted.find('aside').remove();
          // if(extracted.find('.selected'))
          // extracted.find('.mod-category').not('.selected').remove();
          $.each(extracted.find('a'), (i, el) => {
            const e = $(el);
            e.attr('target', '_BLANK');
            e.attr('onclick', '');
            e.addClass('kbb-link');
            const b = e.attr('href');
            const matches = b ? b.match(/javascript/) : false;
            if (matches) {
              e.remove();
            } else {
              e.attr('href', `https://www.kbb.com${e.attr('href')}`);
            }
          });
          handleClick(port);
          const url = $(extracted)
            .find('.btn-main-cta')
            .first()
            .attr('href');
          console.log(`url:${url}`);
          const m = url.match(/(style|options|categories|\/condition\/)/);
          const type = m ? m[0].replace(/\//g, '') : 'default';
          kbbAJAX({
            url,
            kbbData: request.kbbData,
            data: $(extracted).html(),
            type
          });
        }
      });
    } else if (request.type === 'new') {
      port.postMessage({
        type: 'error',
        url: request.url,
        message: `This is a new car. Kelley Blue Book does not provide used car prices for new cars.<br><a class="btn btn-primary" href="${
          request.url
        }">Get a Quote from KBB</a>`
      });
    } else if (request.type === 'error') {
      port.postMessage({
        type: 'error',
        url: request.url,
        message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
          request.url
        }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
      });
    } else {
      console.log('starting else script');
      const altPriceType =
        port.sender.url.match(/(cto|ctd)/)[0] === 'cto' ? 'private-party' : 'retail';
      request.kbbData.pricetype = altPriceType;
      $.ajax({
        url: request.url,
        dataType: 'html',
        type: 'GET',
        data: request.kbbData,
        error(jqXHR, textStatus, errorThrown) {
          console.log('error', request.url);
          console.log(jqXHR, textStatus, errorThrown);
          port.postMessage({
            jqXHR,
            textStatus,
            errorThrown,
            type: 'error',
            url: request.url,
            message: `Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="${
              request.url
            }">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>`
          });
        },
        success(data) {
          const extracted = $($.parseHTML(data)).find('.styles-section');
          extracted.find('aside').remove();
          extracted.find('*').removeClass('collapse');
          extracted.find('*').removeClass('hidden');
          // if(extracted.find('.selected'))
          // extracted.find('.mod-category').not('.selected').remove();
          $.each(extracted.find('a'), (i, el) => {
            const e = $(el);
            e.attr('target', '_BLANK');
            e.attr('onclick', '');
            e.addClass('kbb-link');
            const b = e.attr('href');
            const matches = b ? b.match(/javascript/) : false;
            if (matches) {
              e.remove();
            } else {
              e.attr('href', `https://www.kbb.com${e.attr('href')}`);
            }
          });
          handleClick(port);
          const url = $(extracted)
            .find('.btn-main-cta')
            .first()
            .attr('href');
          const m = url.match(/(style|options|categories|\/condition\/)/);
          const type = m ? m[0].replace(/\//g, '') : 'default';
          port.postMessage({
            url: request.url,
            kbbData: request.kbbData,
            data: $(extracted).html(),
            type
          });
        }
      });
    }
  });
});
