port = chrome.runtime.connect({name: "kbb-port"});
port.postMessage({type:"test",connection: "Connected!"});
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

serialize = function(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}


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
kbb_data = {};
kbb_data['intent'] = "buy-used";
kbb_data['pricetype'] = "private-party";
var conv= function(d,c){var m,b;m=(b=kbb_data[d])?(b=carInfo[c]):0};
conv('mileage','odometer');
conv('bodystyle','type');
conv('condition','condition');

//mx = (m=kbb_data['mileage'])?(m=carInfo["odometer"]):0;
//bx = (b=kbb_data['bodystyle'])?(b=carInfo["type"]):0;
//kbb_data['vehicleid'] = carInfo["VIN"];
//kbb_data['condition'] = carInfo["condition"];


var url = ("http://www.kbb.com/"+carInfo["make"]+"/"+carInfo["model"]+"/"+carInfo["year"]+"-"+carInfo["make"]+"-"+carInfo["model"]+"/styles/").replace(/ /g,"-");
console.log(url + "?" + serialize(kbb_data));
//$("head").prepend($("<base>").attr("href","http://www.kbb.com/"));

$.ajax({
      url: url,
      dataType: "html",
      type: "GET",
      data: kbb_data,
	  error: function(jqXHR, textStatus, errorThrown){
	  		var form = $("<form>").attr("id","kbb-form");
	  		form.append($("<input>").attr({"id":"kbb-make", "type":"text", "name":"make","value":carInfo["make"]}));
	  		form.append($("<input>").attr({"id":"kbb-model", "type":"text", "name":"model","value":carInfo["model"]}));
	  		form.append($("<input>").attr({"id":"kbb-year", "type":"text", "name":"year","value":carInfo["year"]}));
	  		form.append($("<input>").attr({"id":"kbb-year", "type":"submit", "name":"submit","value":"submit"}));
	  		addKbb(form);
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
			});
      		addKbb(extracted.html());
			$(".kbb-link").on('click', function(e){
				console.log(e);
				e.preventDefault();
				var url = "http://www.kbb.com" + $(this).attr("href");
				var type = $(this).attr("href").match(/(styles|options|categories)/)[0];
				console.log(url);
				console.log(type);
				port.postMessage({type:type, url: url, kbb_data: kbb_data});
				port.onMessage.addListener(function(response) {
					console.log(response);
					console.log($(response.data));
					$("#kbb").html($(response.data).find("#GetMyPrice"));
				console.log("returned");
				});
			});
      }
    });

console.log("http://www.seantburke.com/");


