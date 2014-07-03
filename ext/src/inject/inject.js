chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

	}
	}, 10);
});

// $.each($("#Browse-make .UsedCarmakes ul li a"), 
// 	function(i,e){
// 		console.log($(e));
// });

carInfo = {};
$.each($(".mapAndAttrs p.attrgroup span"), function(i,el){
		e = $(el).text().split(":");
		if(typeof e[1] !== 'undefined'){
			carInfo[e[0].trim()] = e[1].trim();
			console.log("carInfo["+e[0].trim()+"] = "+e[1].trim());
		}			
		else{
			carInfo["car"] = e[0];
			carInfo["year"] = e[0].match(/(19|20)[0-9]{2}/)[0];
			carInfo["make"] = ((b = e[0].match(/(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Daewoo|Dodge|Eagle|Ferrari|FIAT|Fisker|Ford|Geo|GMC|Honda|HUMMER|Hyundai|Infinit(i|y)|Isuzu|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Lotus|Maserati|Maybach|Mazda|McLaren|Mercedes((-| )Benz)?|Mercury|MINI|Mitsubishi|Nissan|Oldsmobile|Panoz|Plymouth|Pontiac|Porsche|Ram|Rolls-Royce|Saab|Saturn|Scion|smart|SRT|Subaru|Suzuki|Tesla|Toyota|Volkswagen|Volvo)/i)) != null) ? b[0]:null;
			carInfo["model"] = e[0].replace(carInfo["year"], "").replace(carInfo["make"],"").trim().split(" ")[0];
			console.log("carInfo['car'] = "+e[0].trim());
		}
});

var url = ("http://www.kbb.com/"+carInfo["make"]+"/"+carInfo["model"]+"/"+carInfo["year"]+"-"+carInfo["make"]+"-"+carInfo["model"]+"/styles/").replace(/ /g,"-");
console.log(url);
//$("head").prepend($("<base>").attr("href","http://www.kbb.com/"));

var addKbb = function(html){
	$(".mapAndAttrs").prepend($("<div>").attr("id","kbb"));
	kbb = $("#kbb");
	kbb.append($("<h1>").html("Kelley Blue Book Value"));		
	kbb.append(html);
};

function getNext(e, url){
	e.preventDefault();
	$.ajax({
      url: url,
      dataType: "html",
      type: "GET",
	  error: function(jqXHR, textStatus, errorThrown){

	  		var form = $("<form>").attr("id","kbb-form");
	  		form.append($("<input>").attr({"id":"kbb-make", "type":"text", "name":"make","value":carInfo["make"]}));
	  		form.append($("<input>").attr({"id":"kbb-model", "type":"text", "name":"model","value":carInfo["model"]}));
	  		form.append($("<input>").attr({"id":"kbb-year", "type":"text", "name":"year","value":carInfo["year"]}));
	  		form.append($("<input>").attr({"id":"kbb-year", "type":"submit", "name":"submit","value":"submit"}));

	  		addKbb(form);
	  },
      success: function(data, responseText, jqXHR){
      		var extracted = $($.parseHTML(data)).find("#GetMyPrice");
      		$("#kbb").html(extracted.html());
      }
    });

}

$.ajax({
      url: url,
      dataType: "html",
      type: "GET",
      data: {
		intent: "buy-used", 
		mileage: carInfo["odometer"],
		bodystyle: carInfo["type"],
		vehicleid: carInfo["VIN"],
		pricetype: "private-party",
		condition: carInfo["condition"]
	  },
	  error: function(jqXHR, textStatus, errorThrown){

	  		var form = $("<form>").attr("id","kbb-form");
	  		form.append($("<input>").attr({"id":"kbb-make", "type":"text", "name":"make","value":carInfo["make"]}));
	  		form.append($("<input>").attr({"id":"kbb-model", "type":"text", "name":"model","value":carInfo["model"]}));
	  		form.append($("<input>").attr({"id":"kbb-year", "type":"text", "name":"year","value":carInfo["year"]}));
	  		form.append($("<input>").attr({"id":"kbb-year", "type":"submit", "name":"submit","value":"submit"}));

	  		addKbb(form);
	  },
      success: function(data, responseText, jqXHR){
      		var extracted = $($.parseHTML(data)).find(".trade-sell");
      		extracted.find("aside").remove();
			$.each(extracted.find("a"), function(i,el){
				var e = $(el);
				var url = "http://www.kbb.com" + e.attr("href");
				e.attr("href","#");
				e.attr("onclick", "getNext(event, '"+url+"');");
				e.on('click', function(e){
					console.log(e);
					e.preventDefault();
					$("#kbb").load(url + " #GetMyPrice");
				})

			});
      		addKbb(extracted.html());
      }
    });
console.log("http://www.seantburke.com/");