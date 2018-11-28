// if you checked 'fancy-settings' in extensionizr.com, uncomment this lines

// var settings = new Store('settings', {
//     'sample_setting': 'This is how you use Store.js to remember values'
// });


//example of using a message handler from the inject scripts


$('<div>', {id:'kbb-iframe'}).appendTo('body');
var cars = [];

function handleClick(port) {
  $('.kbb-link').on('click', function(e){
    console.log(e);
    e.preventDefault();
    var url = $(this).attr('href');
    var m;
    var type = (m=$(this).attr('href').match(/(style|options|categories)/))?m[0]:'default';
    console.log(url);
    console.log(type);
    port.postMessage({type:type, url: url});
    port.onMessage.addListener(function(response) {
      console.log(response);
      $('#kbb').html(response.data);
    console.log('returned');
    });
  });
}


function serialize(obj) {
  var str = [];
  for(var p in obj){
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}


function removeDuplicateQueries(url, data){
	var output = {};
	if(url.length === 0){
		return url;
	}

	output.data = data || {};
	var anchor = document.createElement('a');
	anchor.href = url;
	var search = anchor.search.substr(1);
	console.log(search);
	var urlInside = decodeURI(search.replace(/&/g, '\",\"').replace(/=/g,'\":\"'));
	console.log(urlInside);
	var query = '';
	if(urlInside){
		var urlVars = JSON.parse('{"' + urlInside + '"}');
		for(var i in urlVars)
		{
			output.data[i] = urlVars[i];
		}
		query = '?' + serialize(data);
	}
	output.url = anchor.protocol + '//' + anchor.host + (anchor.pathname || '') + (anchor.hash || '');

	return output;
}

chrome.runtime.onConnect.addListener(function(port) {
//console.assert(port.name === 'kbb-port');
	console.log(port);
	port.onMessage.addListener(function kbbAJAX(request) {

		if(request.url && request.url.length > 0){
			request.url = request.url.replace(/intent=buy-new/g, 'intent=buy-used');
			var duplicateData = removeDuplicateQueries(request.url, request.kbb_data);
			request.url = duplicateData.url;
			request.kbb_data = duplicateData.data;
		console.log(request.url);
		}
		if(request.type === 'popup')
		{
			port.postMessage({cars:cars, type:'popup'});
		}
		else if(request.type === 'test')
		{
			console.log("Connected!");
		}
		else if(request.type === 'kbb-price'){
			console.log(request.data);
				port.postMessage({type:'kbb-background', kbb_data: request.data});
		}
		else if((request.type === 'categories') || (request.type === 'category'))
		{
			console.log('categories script started');
			port.postMessage({type:'status', progress: 41, message:'Categories...'});
			$.ajax({
			  url: request.url,
			  dataType: 'html',
			  type: 'GET',
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
					console.log('error', request.url);
					console.log(jqXHR, textStatus, errorThrown);
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:'error', url:request.url,
					message:'Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="' + request.url + '">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log("categories sucess!");
			  		var extracted = $($.parseHTML(data)).find('.categories-section');
			  		console.log(extracted);
		      		extracted.find('aside').remove();
		      		//if(extracted.find('.selected'))
		      		//extracted.find('.mod-category').not('.selected').remove();
					$.each(extracted.find('a'), function(i,el){
						var e = $(el);
						e.attr('target','_BLANK');
						e.attr('onclick', '');
						e.addClass('kbb-link');
						var b;
						var matches = (b=e.attr('href')) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr('href', 'https://www.kbb.com' + e.attr('href'));
						}
					});
			  		port.postMessage({url: request.url, kbb_data:request.kbb_data, data:$(extracted).html(), type:'style'});
			  		handleClick(port);
			  }
			});
		}
		else if(request.type === 'style'){
			console.log('starting styles script');
			console.log(request.url);
			port.postMessage({type:'status', progress: 41, message:'Styles...'});
			$.ajax({
			  url: request.url,
			  dataType: 'html',
			  type: 'GET',
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
					console.log('error', request.url);
					console.log(jqXHR, textStatus, errorThrown);
			  		if(request.kbb_data['bodystyle']){
			  			delete request.kbb_data.bodystyle;
			  			kbbAJAX(request);
			  		}
			  		else{
			  			port.postMessage({url: request.url, kbb_data:request.kbb_data, data:'error', type:'init_error',
			  			message: 'Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="'+request.url+'">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'});
			  		}
				},
			  success: function(data, responseText, jqXHR){
			  		var extracted;
			  		console.log(responseText);
			  		console.log(jqXHR);
			  		console.log("Styles Success!");
					  var matches = $($.parseHTML(data)).find('.breadcrumbs').text().match(/>(\w+)$/m);
					  var location = matches && matches.length > 0 ? matches[1].toLowerCase() : 'style';
			  		console.log(location);
			  		if(location === 'style')
			  		{
			  			extracted = $($.parseHTML(data)).find('.styles-section');
		      		extracted.find('aside').remove();
		      		extracted.find('*').removeClass('collapse');
		      		extracted.find('*').removeClass('hidden');
		      		//if(extracted.find('.selected'))
		      		//extracted.find('.mod-category').not('.selected').remove();
						$.each(extracted.find('a'), function(i,el){
							var e = $(el);
							e.attr('target','_BLANK');
							e.attr('onclick', '');
							e.addClass('kbb-link');
							var b;
							var matches = (b=e.attr('href')) ? b.match(/javascript/): false;
							if(matches)
							{
								e.remove();
							}
							else
							{
								e.attr('href', 'https://www.kbb.com' + e.attr('href'));
							}

						});
						console.log(request.type);
						var m;
						var type = (m=request.url.match(/(style|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):'default';
						port.postMessage({url: request.url, kbb_data: request.kbb_data, data:$(extracted).html(), type:type});
						handleClick(port);
					}
					else{
						console.log(location);
						kbbAJAX({url: request.url, kbb_data:request.kbb_data, data:$(extracted).html(), type:location});
					}
			  }
			});
		}
		else if(request.type === 'options'){
		console.log('starting options script');
			port.postMessage({type:'status', progress: 51, message:'Choosing Options...'});
			$.ajax({
			  url: request.url,
			  dataType: 'html',
			  type: 'GET',
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
				  console.log('error', request.url);
				  console.log(jqXHR, textStatus, errorThrown);
				  port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:'error', url:request.url,
				  message: 'Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="'+request.url+'">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'});
			  },
			  success: function(data, responseText, jqXHR){
			  	console.log('options success!');
			  		var extracted = $($.parseHTML(data));
			  	console.log(extracted);
					$.each(extracted.find('a'), function(i,el){
						var e = $(el);
						e.attr('target','_BLANK');
						e.attr('onclick', '');
						e.addClass('kbb-link');
						var b;
						var matches = (b=e.attr('href')) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr('href', 'https://www.kbb.com' + e.attr('href'));
						}
					});
					handleClick(port);
			  		var url = $(extracted).find('.js-path-next-default').attr('href');
			  		var type;
			  	console.log($(extracted).find('.js-path-next-default').attr('href'));
			  	console.log($(extracted).find('#Deal-finder'));
			  		if($(extracted).find('.js-path-next-default').attr('href')){
			  			url = $(extracted).find('.js-path-next-default').attr('href');
			  			var m;
			  			type = (m=url.match(/(style|options|categories|\/condition\/)/)) ? m[0].replace(/\//g,''):'default';
			  			kbbAJAX({url: url, kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
			  		}
			  		else if($(extracted).find('#Deal-finder')) {
			  			url = $(extracted).find('#Deal-finder').find('a').attr('href');
			  			type = 'new';
			  			kbbAJAX({url: url, kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
			  		}
			  		else{
			  			type = 'error';
			  			kbbAJAX({url: url, kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
			  		}

			  }
			});
		}
		else if(request.type === 'default'){
			console.log('starting default script');
			port.postMessage({type:'status', progress: 100, message:'Getting Price...'});
			$.ajax({
			  url: request.url,
			  dataType: 'html',
			  type: 'GET',
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
					console.log('error', request.url);
					console.log(jqXHR, textStatus, errorThrown);
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:'error', url:request.url,
					message: 'Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="' + request.url + '">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'});
			  },
			  success: function(data, responseText, jqXHR){
          var iframe = $('<iframe>',{
            srcdoc: $(data),
            name:'price-iframe',
            id:'price-iframe',
            width:'500px',
			height:'1000px',
			scrolling:'yes',
            sandbox:'allow-same-origin allow-scripts allow-top-navigation allow-forms'
          });
					var extracted = $($.parseHTML(data));
					var pic = extracted.find('#Vehicle-info .pic');
					$('#kbb-iframe').html(extracted);
		      		//extracted.find('aside').remove();
		      		//if(extracted.find('.selected'))
		      		//extracted.find('.mod-category').not('.selected').remove();
					$.each(extracted.find('a'), function(i,el){
						var e = $(el);
						e.attr('target','_BLANK');
						e.attr('onclick', '');
						e.addClass('kbb-link');
						var b;
						var matches = (b=e.attr('href')) ? b.match(/javascript/): false;
						if(matches){
							e.remove();
						} else {
							e.attr('href', 'https://www.kbb.com' + e.attr('href'));
						}
					});

          var extractPriceInfo = function(scripts){
            console.log(document);
            var filterKbbPrice = function(e,i){
              return e.textContent.indexOf('KBB.DataLayer || []') > -1;
            };
            var info;
            var priceScript = Array.prototype.filter.call(scripts, filterKbbPrice)[0];
            if(priceScript) {
              var priceScriptContent = priceScript.innerHTML;
              var startTag = 'KBB.DataLayer.push(';
              var endTag = 'catch';
              var startIndex = priceScriptContent.indexOf(startTag) + startTag.length;
              var endIndex = priceScriptContent.indexOf(endTag) - endTag.length - 8;
              var truncatedScriptContent = priceScriptContent.substring(startIndex, endIndex).trim();
              var replacedScriptContent = truncatedScriptContent.trim()
                .replace(/\/\/[\s\w\d]+/g, '')
                .replace(/\'/g, '"')
                .replace(/\s/g, '')
                .replace(/\{\}/g, 'null')
                .replace(/,}/g, '}');
              carPriceInfo = JSON.parse(replacedScriptContent);
              console.log(info);
            }
          }

					$(document).ready(function(){
            var carPriceInfo = extractPriceInfo(document.querySelectorAll('script'));
            var carPriceInfoiFrame = extractPriceInfo(extracted.find('script'));

            port.postMessage({
              url: request.url,
              kbb_data: request.kbb_data,
              data: $(document).find('body').html(),
              img: pic.html(),
              type: request.type,
              price: carPriceInfo,
              iPrice: carPriceInfoiFrame
            });
            cars.push([{
              info: request.kbb_data,
              price: carPriceInfo
            }]);
					});
					handleClick(port);
			  }
			});
		}
		else if(request.type === 'condition'){
			console.log('starting condition script');
			var pricetype = (port.sender.url.match(/(cto|ctd)/)[0] === 'cto')?'private-party':'retail';
			request.kbb_data['pricetype'] = pricetype;
			port.postMessage({type:'status', progress: 61, message:'Selecting Condition...'});
			$.ajax({
			  url: request.url,
			  dataType: 'html',
			  type: 'GET',
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
					console.log('error', request.url);
					console.log(jqXHR, textStatus, errorThrown);
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:'error', url:request.url,
					message: 'Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="'+request.url+'">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'});
			  },
			  success: function(data, responseText, jqXHR){
			  		var extracted = $($.parseHTML(data)).find('.condition-section');
		      		extracted.find('aside').remove();
		      		//if(extracted.find('.selected'))
		      		//extracted.find('.mod-category').not('.selected').remove();
					$.each(extracted.find('a'), function(i,el){
						var e = $(el);
						e.attr('target','_BLANK');
						e.attr('onclick', '');
						e.addClass('kbb-link');
						var b;
						var matches = (b=e.attr('href')) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr('href', 'https://www.kbb.com' + e.attr('href'));
						}
					});
					handleClick(port);
					var url = $(extracted).find('.btn-main-cta').first().attr('href');
					console.log('url:' + url);
					var m;
					var type = (m=url.match(/(style|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):'default';
			  		kbbAJAX({url:url,kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
			  }
			});
		}
		else if(request.type === 'new'){
					port.postMessage({type:'error', url:request.url,
					message: 'This is a new car. Kelley Blue Book does not provide used car prices for new cars.<br><a class="btn btn-primary" href="'+request.url+'">Get a Quote from KBB</a>'});
				}
		else if(request.type === 'error'){
					port.postMessage({type:'error', url:request.url,
					message: 'Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="'+request.url+'">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'});
				}

		else{
			console.log('starting else script');
			var pricetype = (port.sender.url.match(/(cto|ctd)/)[0] === 'cto')?'private-party':'retail';
			request.kbb_data['pricetype'] = pricetype;
			$.ajax({
		      url: request.url,
		      dataType: 'html',
		      type: 'GET',
		      data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
					console.log('error', request.url);
					console.log(jqXHR, textStatus, errorThrown);
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:'error', url:request.url,
					message: 'Error with Kelley Blue Book <a target="_blank" class="btn btn-primary" href="' + request.url + '">Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href="https://www.github.com/hawaiianchimp/kbb-craigslist/issues">here</a>'});
			  },
		      success: function(data, responseText, jqXHR){
		      		var extracted = $($.parseHTML(data)).find('.styles-section');
		      		extracted.find('aside').remove();
		      		extracted.find('*').removeClass('collapse');
		      		extracted.find('*').removeClass('hidden');
		      		//if(extracted.find('.selected'))
		      		//extracted.find('.mod-category').not('.selected').remove();
					$.each(extracted.find('a'), function(i,el){
						var e = $(el);
						e.attr('target','_BLANK');
						e.attr('onclick', '');
						e.addClass('kbb-link');
						var b;
						var matches = (b=e.attr('href')) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr('href', 'https://www.kbb.com' + e.attr('href'));
						}
					});
		      		handleClick(port);
		      		var url = $(extracted).find('.btn-main-cta').first().attr('href');
		      		var m;
		      		var type = (m=url.match(/(style|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):'default';
		      		port.postMessage({url: request.url, kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
		      }
		    });
		}

	});
});
