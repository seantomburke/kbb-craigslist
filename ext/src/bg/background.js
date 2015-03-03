// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts


$("<div>", {id:"kbb-iframe"}).appendTo("body");
cars = [];

chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "kbb-port");
	//console.log(port);
	port.onMessage.addListener(function kbbAJAX(request) {
		//console.log(request.url);
		//console.log(request.type);
		if(request.url && request.url.length > 0){
			request.url = request.url.replace(/intent=buy-new/g, 'intent=buy-used');
		}
		if(request.type == "popup")
		{
			port.postMessage({cars:cars, type:"popup"});
		}
		else if(request.type == "test")
		{
			//console.log("Connected!");
		}
		else if(request.type == "kbb-price"){
			//console.log(request.data);
				port.postMessage({type:"kbb-background", kbb_data: request.data});
		}
		else if((request.type == "categories") || (request.type == "category"))
		{
			//console.log("categories script started");
			port.postMessage({kbb_data: request.kbb_data, type:"status", progress: 41, message:"Categories...", url:request.url});
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		//console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
					message:"Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href='http://www.github.com/hawaiianchimp/kbb-craigslist/issues'>here</a>"});
			  },
			  success: function(data, responseText, jqXHR){
			  		//console.log("categories sucess!");
			  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
			  		//console.log(extracted);
		      		extracted.find("aside").remove();
		      		//if(extracted.find(".selected"))
		      		//extracted.find(".mod-category").not(".selected").remove();
					$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
						var b;
						var matches = (b=e.attr("href")) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr("href", "http://www.kbb.com" + e.attr("href"));
						}
					});
			  		port.postMessage({url: request.url, kbb_data:request.kbb_data, data:$(extracted).html(), type:"styles"});
			  		handleClick(port);
			  }
			});
		}
		else if(request.type == "styles"){
			//console.log("starting styles script");
			//console.log(request.url);
			port.postMessage({kbb_data: request.kbb_data, type:"status", progress: 41, message:"Styles...", url:request.url});
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  //data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		port.postMessage({url: request.url, kbb_data:request.kbb_data, data:"error", type:'init_error',
			  		message:"Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href='http://www.github.com/hawaiianchimp/kbb-craigslist/issues'>here</a>"});
				},
			  success: function(data, responseText, jqXHR){
			  		//console.log(responseText);
			  		//console.log(jqXHR);
			  		//console.log("Styles Success!");
			  		var location = $($.parseHTML(data)).find("#Breadcrumbs").text().match(/>(\w+)$/m)[1].toLowerCase();
			  		//console.log(location);
			  		if(location == "styles")
			  		{
				  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
			      		extracted.find("aside").remove();
			      		extracted.find("*").removeClass("collapse");
			      		//if(extracted.find(".selected"))
			      		//extracted.find(".mod-category").not(".selected").remove();
						$.each(extracted.find("a"), function(i,el){
							var e = $(el);
							e.attr("target","_BLANK");
							e.attr("onclick", "");
							e.addClass("kbb-link");
							var b;
							var matches = (b=e.attr("href")) ? b.match(/javascript/): false;
							if(matches)
							{
								e.remove();
							}
							else
							{
								e.attr("href", "http://www.kbb.com" + e.attr("href"));
							}
							
						});
						//console.log(request.type);
						var type = (m=request.url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
						port.postMessage({url: request.url, kbb_data:request.kbb_data, data:$(extracted).html(), type:type});	
						handleClick(port);
					}
					else{
						//console.log(location);
						kbbAJAX({url: request.url, kbb_data:request.kbb_data, data:$(extracted).html(), type:location});
					}
			  }
			});
		}
		else if(request.type == "options"){
			//console.log("starting options script");
			port.postMessage({kbb_data: request.kbb_data, type:"status", progress: 51, message:"Choosing Options...", url:request.url});
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  //data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		//console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
					message:"Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href='http://www.github.com/hawaiianchimp/kbb-craigslist/issues'>here</a>"});
			  },
			  success: function(data, responseText, jqXHR){
			  		//console.log("options success!");
			  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
			  		//console.log(extracted);
					$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
						var b;
						var matches = (b=e.attr("href")) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr("href", "http://www.kbb.com" + e.attr("href"));
						}
					});
					handleClick(port);
			  		url = $(extracted).find("#GetMyPrice").attr("href");
			  		var type = (m=url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
			  		kbbAJAX({url: url, kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
			  }
			});
		}
		else if(request.type == "default"){
			//console.log("starting default script");
			port.postMessage({kbb_data: request.kbb_data, type:"status", progress: 100, message:"Getting Price...", url:request.url});
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		//console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
					message:"Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href='http://www.github.com/hawaiianchimp/kbb-craigslist/issues'>here</a>"});
			  },
			  success: function(data, responseText, jqXHR){
			  		iframe = $('<iframe>',{srcdoc: data,name:"price-iframe",id:"price-iframe", width:"500px",height:"1000px",sandbox:"allow-same-origin allow-scripts allow-top-navigation allow-forms"});
					$("#kbb-iframe").html(iframe);
					var extracted = $($.parseHTML(data)).find("#Vehicle-info .pic");
		      		//extracted.find("aside").remove();
		      		//if(extracted.find(".selected"))
		      		//extracted.find(".mod-category").not(".selected").remove();
					$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
						var b;
						var matches = (b=e.attr("href")) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr("href", "http://www.kbb.com" + e.attr("href"));
						}
					});

					$(document).ready(function(){
						//console.log(document);
						carPriceInfo = 1;//eval("("+(st=(s=$($("#kbb-iframe").contents()[0]).find("script").text()).substring(s.search(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)+s.match(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)[0].length, s.length)).substring(0,st.search(/\);/)).replace(/\s/g, "")+")");
						//console.log(carPriceInfo);
						port.postMessage({url:request.url, kbb_data:request.kbb_data, data:$(document).find("body").html(), img:extracted.html(), type:request.type});
					});
					cars.push([{info:request.kbb_data, price:carPriceInfo}]);
					handleClick(port);
			  }
			});
		}
		else if(request.type == "condition"){
			//console.log("starting condition script");
			pricetype = (port.sender.url.match(/(cto|ctd)/)[0] == "cto")?"private-party":"retail";
			request.kbb_data["pricetype"] = pricetype;
			port.postMessage({kbb_data: request.kbb_data, type:"status", progress: 61, message:"Selecting Condition...", url:request.url});
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		//console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
					message:"Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href='http://www.github.com/hawaiianchimp/kbb-craigslist/issues'>here</a>"});
			  },
			  success: function(data, responseText, jqXHR){
			  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
		      		extracted.find("aside").remove();
		      		//if(extracted.find(".selected"))
		      		//extracted.find(".mod-category").not(".selected").remove();
					$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
						var b;
						var matches = (b=e.attr("href")) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr("href", "http://www.kbb.com" + e.attr("href"));
						}
					});
					handleClick(port);
					var url = $(extracted).find(".btn-main-cta").first().attr("href");
					//console.log("url:" + url);
					var type = (m=url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
			  		kbbAJAX({url:url,kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
			  }
			});
		}else{
			//console.log("starting else script");
			pricetype = (port.sender.url.match(/(cto|ctd)/)[0] == "cto")?"private-party":"retail";
			request.kbb_data["pricetype"] = pricetype;
			$.ajax({
		      url: request.url,
		      dataType: "html",
		      type: "GET",
		      data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		//console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
					message:"Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a><br><br>Want to report a bug? Submit bugs <a href='http://www.github.com/hawaiianchimp/kbb-craigslist/issues'>here</a>"});
			  },
		      success: function(data, responseText, jqXHR){
		      		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
		      		extracted.find("aside").remove();
		      		extracted.find("*").removeClass("collapse");
		      		//if(extracted.find(".selected"))
		      		//extracted.find(".mod-category").not(".selected").remove();
					$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
						var b;
						var matches = (b=e.attr("href")) ? b.match(/javascript/): false;
						if(matches)
						{
							e.remove();
						}
						else
						{
							e.attr("href", "http://www.kbb.com" + e.attr("href"));
						}
					});
		      		handleClick(port);
		      		var url = $(extracted).find(".btn-main-cta").first().attr("href");
		      		var type = (m=url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
		      		port.postMessage({url: request.url, kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
		      }
		    });
		}

	});
});


var handleClick = function(port){
			$(".kbb-link").on('click', function(e){
				//console.log(e);
				e.preventDefault();
				var url = $(this).attr("href");
				var type = (m=$(this).attr("href").match(/(styles|options|categories)/))?m[0]:"default";
				//console.log(url);
				//console.log(type);
				port.postMessage({type:type, url: url, kbb_data: kbb_data, type:request.type});
				port.onMessage.addListener(function(response) {
					//console.log(response);
					$("#kbb").html(response.data);
				//console.log("returned");
				});
			});
};


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://ssl.google-analytics.com/analytics.js','ga');
ga('require', 'displayfeatures');
ga('create', 'UA-42611920-3', { 'userId': chrome.extension.getURL('/src/inject/webcode/images/logo240_2x.png')});
ga('send', 'pageview');

