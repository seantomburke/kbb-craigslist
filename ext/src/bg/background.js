// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
$("<div>", {id:"kbb-iframe"}).appendTo("body");

chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "kbb-port");
	console.log(port);
	port.onMessage.addListener(function(request) {
		console.log(request.type);
		if(request.type == "test")
		{
			console.log("Connected!");
		}
		if(request.type == "categories")
		{
			console.log("categores script started");
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:request.type});
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
						e.attr("href", "http://www.kbb.com" + e.attr("href"));
					});
			  		port.postMessage({kbb_data:request.kbb_data, data:$(extracted).html(), type:request.type});
			  		handleClick(port);
			  }
			});
		}
		if(request.type == "styles"){
			console.log("starting styles script");
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:request.type});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log("Styles Success!");
			  		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
			  		console.log($(extracted));
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
					port.postMessage({kbb_data:request.kbb_data, data:$(extracted).html(), type:request.type});	
					handleClick(port);
			  }
			});
		}
		if(request.type == "options"){
			console.log("starting options script");
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:request.type});
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
						e.attr("href", "http://www.kbb.com" + e.attr("href"));
					});
					handleClick(port);
			  		url = $(extracted).find("#GetMyPrice").attr("href");
			  		port.postMessage({url: url, kbb_data:request.kbb_data, data:$(extracted).html(), type:request.type});
			  }
			});
		}
		if(request.type == "default"){
			console.log("starting default script");
			iframe = $('<iframe>',{src: request.url,name:"price",id:"price", width:"500px",height:"1000px"});
			$("#kbb-iframe").html(iframe);
			$(document).ready(function(){
				console.log(document);
				port.postMessage({kbb_data:request.kbb_data, data:$(document).find("body").html(), type:request.type});
			});
			console.log(iframe);

			// $.ajax({
			//   url: request.url,
			//   dataType: "html",
			//   type: "GET",
			//   data: request.kbb_data,
			//   error: function(jqXHR, textStatus, errorThrown){
			//   		console.log("error");
			// 		port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
			//   },
			//   success: function(data, responseText, jqXHR){
			//   		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
		 //      		extracted.find("aside").remove();
		 //      		//if(extracted.find(".selected"))
		 //      		//extracted.find(".mod-category").not(".selected").remove();
			// 		$.each(extracted.find("a"), function(i,el){
			// 			var e = $(el);
			// 			e.attr("target","_BLANK");
			// 			e.attr("onclick", "");
			// 			e.addClass("kbb-link");
			// 			e.attr("href", "http://www.kbb.com" + e.attr("href"));
			// 		});
			// 		handleClick(port);
			//   		port.postMessage({kbb_data:request.kbb_data, data:$(extracted).html()});
			//   }
			// });
		}
		if(request.type == "condition"){
			console.log("starting condition script");
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:request.type});
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
			  		port.postMessage({kbb_data:request.kbb_data, data:$(extracted).html(), type:request.type});
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
					port.postMessage({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown, type:request.type});
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
}