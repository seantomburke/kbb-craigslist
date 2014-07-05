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
	$(".mapAndAttrs").prepend($("<div>").attr("id","kbb-frame"));
	$("#kbb-frame").append($("<div>").attr("id","kbb"));
	$("#kbb-frame").prepend($("<h1>").html("Kelley Blue Book Value"));		
	$("#kbb").append(html);
};

kbb_data = {};
kbb_data['intent'] = "buy-used";
kbb_data['pricetype'] = "private-party";
conv= function(d,c){var m,b;m=(b=carInfo[c])?(kbb_data[d]=b):0};
conv('mileage','odometer');
conv('bodystyle','type');
conv('condition','condition');
if(typeof(m=kbb_data["mileage"]) != undefined && (m.length <= 3))
{
	m *= 1000;
}

//kbb_data['mileage'])?(m=carInfo["odometer"]):0;
//bx = (b=kbb_data['bodystyle'])?(b=carInfo["type"]):0;
//cx = (b=kbb_data['condition'])?(b=carInfo["condition"]):0;
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
      		addKbb(extracted.html());
      		handleClick(port);
      }
    });

console.log("http://www.seantburke.com/");

var handleClick = function(port){
			$(".kbb-link").on('click', function(e){
				console.log(e);
				e.preventDefault();
				$("#kbb").prepend("<h1 style='{color:yellow}'>Loading...</h1>");
				var url = $(this).attr("href");
				var type = (m=$(this).attr("href").match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
				console.log(url);
				console.log(type);
				port.postMessage({type:type, url: url, kbb_data: kbb_data});
				port.onMessage.addListener(function(response) {
					if(response.type == "default"){
						console.log("This is the Default type");
						console.log(response);
						carPriceInfo = "("+(st=(s=response.data).substring(s.search(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)+s.match(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)[0].length, s.length)).substring(0,st.search(/\);/)).replace(/\s/g, "").replace(/&quot;/g,"'")+")";
						d=eval(carPriceInfo);
						console.log(d);
						$("#kbb").html($(response.img));
						$("#kbb").prepend($("<h1>", {
							id: "carInfo"
						}).html(d.year + " " + d.manufacturer + " " + d.model + " " + d.style));
						$("#kbb").append($("<h1>", {
							id: "price"
						}).html("$" + d.data.values.fpp.price));
						$("#kbb").append($("<h1>", {
							id: "priceexcellent"
						}).html("Excellent: $" + d.data.values.privatepartyexcellent.price));
						$("#kbb").append($("<h1>", {
							id: "pricegood"
						}).html("Good: $" + d.data.values.privatepartygood.price));
						$("#kbb").append($("<h1>", {
							id: "priceverygood"
						}).html("Very Good: $" + d.data.values.privatepartyverygood.price));
						$("#kbb").append($("<h1>", {
							id: "pricefair"
						}).html("Fair: $" + d.data.values.privatepartyfair.price));

						$("#kbb").append($("<div>",{class:"row"}).html(
							'<div class="col-1-xs">$'+d.data.values.fpp.priceMin+'</div><div class="col-10-xs"><div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="60" aria-valuemin="'+d.data.values.fpp.priceMin+'" aria-valuemax="'+d.data.values.fpp.priceMax+'" aria-valuenow="'+d.data.values.fpp.price+'" style="{width:45%;}">$'+d.data.values.fpp.priceMax+'</div></div></div><div class="col-1-xs">$'+d.data.values.fpp.priceMax+'</div>'
							));			
						handleClick(port);
					}
					else
					{
						console.log("Type is:" + response.type);
						console.log(response);
						$("#kbb").html(response.data);
						handleClick(port);
					}
					$("#kbb").slideDown();
				console.log("returned");
				});
			});
}


