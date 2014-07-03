// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "kbb-port");
	console.log(port);
	port.onMessage.addListener(function(request) {
		if(request.type == "test")
		{
			console.log("Connected!");
		}
		if(request.type == "categories")
		{
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					sendResponse({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log(data);
			  		//url = "http://www.kbb.com" + $(data).find("#GetMyPrice").attr("href");
			  		port.postMessage({url: url, kbb_data:request.kbb_data, data:data});
			  }
			});
		}
		if(request.type == "styles"){
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					sendResponse({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log(data);
			  		//url = "http://www.kbb.com" + $(data).find("#GetMyPrice").attr("href");
			  		port.postMessage({url: url, kbb_data:request.kbb_data, data:data});
			  }
			});
		}
		if(request.type == "options"){
			$.ajax({
			  url: request.url,
			  dataType: "html",
			  type: "GET",
			  data: request.kbb_data,
			  error: function(jqXHR, textStatus, errorThrown){
			  		console.log("error");
					sendResponse({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log(data);
			  		//url = "http://www.kbb.com" + $(data).find("#GetMyPrice").attr("href");
			  		port.postMessage({url: url, kbb_data:request.kbb_data, data:data});
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
					sendResponse({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
			  },
			  success: function(data, responseText, jqXHR){
			  		console.log(data);
			  		//url = "http://www.kbb.com" + $(data).find("#GetMyPrice").attr("href");
			  		port.postMessage({url: url, kbb_data:request.kbb_data, data:data});
			  }
	});
}