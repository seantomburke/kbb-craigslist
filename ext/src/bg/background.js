// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts

$("<div>", {id:"kbb-iframe"}).appendTo("body");
cars = {};

chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "kbb-port");
	console.log(port);
	port.onMessage.addListener(function kbbAJAX(request) {
		console.log(request.url);
		console.log(request.type);
		request.url = request.url.replace(/intent=buy-new/g, 'intent=buy-used');
		if(request.type == "popup")
		{
			port.postMessage({cars:cars, type:"popup"});
		}
		else if(request.type == "test")
		{
			console.log("Connected!");
		}
		else if(request.type == "categories")
		{
			console.log("categories script started");
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
						data:"<div class='alert alert-danger' role='alert'>Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a></div>"});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log("categories sucess!");
			  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
			  		console.log(extracted);
		      		extracted.find("aside").remove();
		      		//if(extracted.find(".selected"))
		      		//extracted.find(".mod-category").not(".selected").remove();
					$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
						console.log(e.attr("href"),e.attr("href").match("javascript"));
						if(e.attr("href").match("javascript"))
						{
							e.remove();
						}
						else
						{
							e.attr("href", "http://www.kbb.com" + e.attr("href"));
						}
					});
			  		port.postMessage({kbb_data:request.kbb_data, data:$(extracted).html(), type:request.type});
			  		handleClick(port);
			  }
			});
		}
		else if(request.type == "styles"){
			console.log("starting styles script");
			console.log(request.url);
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  //data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log(request.carInfo["year"]);
			  		port.postMessage({kbb_data:request.kbb_data, data:"error", type:'init_error'});	
				},
			  success: function(data, responseText, jqXHR){
			  		console.log("Styles Success!");
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
						e.attr("href", "http://www.kbb.com" + e.attr("href"));
					});
					console.log(request.type);
					var type = (m=request.url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
					port.postMessage({kbb_data:request.kbb_data, data:$(extracted).html(), type:type});	
					handleClick(port);
			  }
			});
		}
		else if(request.type == "options"){
			console.log("starting options script");
			port.postMessage({kbb_data: request.kbb_data, type:"status", message:"Selecting Basic Options...", url:request.url});
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  //data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log("options success!");
			  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
			  		console.log(extracted);
					$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
						if(e.attr("href").match("javascript"))
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
			console.log("starting default script");
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
						data:"<div class='alert alert-danger' role='alert'>Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a></div>"});
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
						e.attr("href", "http://www.kbb.com" + e.attr("href"));
					});

					$(document).ready(function(){
						console.log(document);
						carPriceInfo = 1;//eval("("+(st=(s=$($("#kbb-iframe").contents()[0]).find("script").text()).substring(s.search(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)+s.match(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)[0].length, s.length)).substring(0,st.search(/\);/)).replace(/\s/g, "")+")");
						console.log(carPriceInfo);
						port.postMessage({url:request.url, kbb_data:request.kbb_data, data:$(document).find("body").html(), img:extracted.html(), type:request.type});
					});
					cars.push({info:request.kbb_data, price:carPriceInfo});
					handleClick(port);
			  }
			});
		}
		else if(request.type == "condition"){
			console.log("starting condition script");
			pricetype = (port.sender.url.match(/(cto|ctd)/)[0] == "cto")?"private-party":"retail";
			request.kbb_data["pricetype"] = pricetype;
			port.postMessage({kbb_data: request.kbb_data, type:"status", message:"Selecting Condition of Vehicle...", url:request.url});
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
						data:"<div class='alert alert-danger' role='alert'>Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a></div>"});
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
						e.attr("href", "http://www.kbb.com" + e.attr("href"));
					});
					handleClick(port);
					var url = $(extracted).find(".btn-main-cta").first().attr("href");
					console.log("url:" + url);
					var type = (m=url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
			  		kbbAJAX({url:url,kbb_data:request.kbb_data, data:$(extracted).html(), type:type});
			  }
			});
		}else{
			console.log("starting else script");
			pricetype = (port.sender.url.match(/(cto|ctd)/)[0] == "cto")?"private-party":"retail";
			request.kbb_data["pricetype"] = pricetype;
			port.postMessage({kbb_data: request.kbb_data, type:"status", message:"Selecting Default", url:request.url});
			$.ajax({
		      url: url,
		      dataType: "html",
		      type: "GET",
		      data: kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
					data:"<div class='alert alert-danger' role='alert'>Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a></div>"});
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
						e.attr("href", "http://www.kbb.com" + e.attr("href"));
					});
		      		$("#kbb").hide().html(extracted.html()).fadeIn("slow");
		      		handleClick(port);
		      }
		    });
		}

	});
});

function ajax(url, data, port){
	$.ajax({
			  url: url,
			  dataType: "html",
			  type: "GET",
			  data: data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:"error", url:request.url,
						data:"<div class='alert alert-danger' role='alert'>Error with Kelley Blue Book <a class='btn btn-primary' href='"+request.url+"'>Visit KBB.com</a></div>"});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log(data);
			  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
			  		$.each(extracted.find("a"), function(i,el){
						var e = $(el);
						e.attr("target","_BLANK");
						e.attr("onclick", "");
						e.addClass("kbb-link");
					});
					handleClick(port);
			  		url = $(data).find("#GetMyPrice").attr("href");
			  		port.postMessage({url: url, kbb_data:request.kbb_data, data:data, type:request.type});
			  }
	});
};

var handleClick = function(port){
			$(".kbb-link").on('click', function(e){
				console.log(e);
				e.preventDefault();
				var url = $(this).attr("href");
				var type = (m=$(this).attr("href").match(/(styles|options|categories)/))?m[0]:"default";
				console.log(url);
				console.log(type);
				port.postMessage({type:type, url: url, kbb_data: kbb_data, type:request.type});
				port.onMessage.addListener(function(response) {
					console.log(response);
					$("#kbb").html(response.data);
				console.log("returned");
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

