port = chrome.runtime.connect({name: "kbb-port"});
port.postMessage({type:"test",connection: "Connected!"});
// $.each($("#Browse-make .UsedCarmakes ul li a"), 
// 	function(i,e){
// 		console.log($(e));
// });

// if(l=$(".postingtitle").text().match(/\$([\d,]+)/))
// {
// 	listPrice=l[1].replace(/k/,"000")
// }
// else
// {
// 	listPrice=0;
// }

listPrice = (l=$(".postingtitle").text().match(/\$([\d,]+)/))?l[1].replace(/k/,"000"):0;

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
			var year = new RegExp(carInfo["year"],"g");
			carInfo["model"] = e[0].replace(year, "").replace(carInfo["make"],"").trim().split(" ")[0];
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
	$(".mapAndAttrs").prepend($("<div>").attr("id","kbb-frame").hide().fadeIn("slow"));
	$("#kbb-frame").append($("<div>").attr("id","kbb").hide().fadeIn("slow"));
	$("#kbb-frame").prepend($("<h1>").html("List Price: $"+ listPrice).hide().fadeIn("slow"))
	$("#kbb-frame").prepend($("<h1>").html("Kelley Blue Book Value").hide().fadeIn("slow"));		
	$("#kbb").append(html);
};
addKbb("Loading...");

kbb_data = {};
kbb_data['intent'] = "buy-used";
kbb_data['pricetype'] = "private-party";
conv= function(d,c){var m,b;m=(b=carInfo[c])?(kbb_data[d]=b):0};
conv('mileage','odometer');
conv('bodystyle','type');
conv('condition','condition');
kbb_data["mileage"]=((n=kbb_data["mileage"]) && n.length <= 3)? (n*1000):n;
console.log(kbb_data["mileage"]);

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
	  		if(carInfo["year"] < 1994)
	  		{
	  			$("#kbb").hide().html("<div class='alert alert-warning' role='alert'>Sorry. Kelley Blue Book does not provide information for cars older than 1994</div>").fadeIn("slow");
	  		}
	  		else{
	  		var form = $("<form>",{id:"kbb-form"});
	  		form.append($("<input>",{"id":"kbb-make", "type":"text", "name":"make","value":carInfo["make"]}));
	  		form.append($("<input>",{"id":"kbb-model", "type":"text", "name":"model","value":carInfo["model"]}));
	  		form.append($("<input>",{"id":"kbb-year", "type":"text", "name":"year","value":carInfo["year"]}));
	  		form.append($("<input>",{"id":"kbb-year", "type":"text", "name":"year","value":carInfo["mileage"]}));
	  		form.append($("<input>",{"id":"kbb-submit", "type":"submit", "name":"submit","value":"submit"}));
	  		$("#kbb").hide().html(form).fadeIn("slow");
	  		}
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

console.log("http://www.seantburke.com/");

var handleClick = function(port){
			$(".kbb-link").on('click', function(e){
				console.log(e);
				e.preventDefault();
				$("#kbb").html($("<h1>").html("Loading...").hide().fadeIn("slow"));
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
						$("#kbb").hide().html($(response.img)).fadeIn("slow");
						$("#kbb").prepend($("<h2>Mileage: "+ d.mileage+"<h2>"));
						$("#kbb").prepend($("<h1>", {
							id: "carInfo"
						}).html(d.year + " " + d.manufacturer + " " + d.model + " " + d.style));
						$("#kbb").append($("<h1>", {
							id: "price",
							class: "priceInfo"
						}).html("Fair Purchase Price: $" + d.data.values.fpp.price).hide().fadeIn("slow"));
						var priceLabel;
						if(listPrice > d.data.values.fpp.price)
						{
							priceLabel = "<h1 style='color:red'>$"+ listPrice +"</label><small><span style='color:red;' class='glyphicon glyphicon-arrow-up'></span>$"+ (listPrice - d.data.values.fpp.price) +"</small></h1>";
						}
						else{
							priceLabel = "<h1 style='color:green'>$"+ listPrice +"</label><small><span style='color:green;' class='glyphicon glyphicon-arrow-down'></span>$"+ (d.data.values.fpp.price - listPrice) +"</small></h1>";
						}
						$("#kbb").append($("<h1>", {
							id: "price",
							class: "priceInfo"
						}).html(priceLabel).hide().fadeIn("slow"));
						$("#kbb").append($("<h2>", {
							id: "priceexcellent",
							class: "priceInfo"
						}).html("Excellent: $" + d.data.values.privatepartyexcellent.price).hide().fadeIn("slow"));
						$("#kbb").append($("<h2>", {
							id: "pricegood",
							class: "priceInfo"
						}).html("Good: $" + d.data.values.privatepartygood.price).hide().fadeIn("slow"));
						$("#kbb").append($("<h2>", {
							id: "priceverygood",
							class: "priceInfo"
						}).html("Very Good: $" + d.data.values.privatepartyverygood.price).hide().fadeIn("slow"));
						$("#kbb").append($("<h2>", {
							id: "pricefair",
							class: "priceInfo"
						}).html("Fair: $" + d.data.values.privatepartyfair.price).hide().fadeIn("slow"));

						var perc = (d.data.values.fpp.price-d.data.values.fpp.priceMin)/(d.data.values.fpp.priceMax-d.data.values.fpp.priceMin)*100;
						$("#kbb").append($("<div>",{class:"row"}).html(
							'<div class="col-xs-2">'+
							'<h3><span class="label label-success">$'+d.data.values.fpp.priceMin+'</span></h3>'+
							'</div><div class="col-xs-8">'+
							'<div class="progress">'+
							'<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="60" aria-valuemin="'+d.data.values.fpp.priceMin+'" aria-valuemax="'+d.data.values.fpp.priceMax+'" aria-valuenow="'+d.data.values.fpp.price+'" style="width:'+perc+'%;">$'+d.data.values.fpp.price+'</div></div></div>'+
							'<div class="col-xs-1">'+
							'<h3><span class="label label-danger">$'+d.data.values.fpp.priceMax+'</span></h3>'+
							'</div>'
							).hide().fadeIn("slow"));		

						$("#kbb").append($("<a>", {href:response.url + "&pricetype="+response.kbb_data.pricetype+"&mileage="+response.kbb_data.mileage+"&condition=all",class:"btn btn-primary", target: "_BLANK"}).html("Open in KBB.com").hide().fadeIn("slow"));	
						handleClick(port);
					}
					else if(response.type == "status")
					{
						console.log(response.message);
						console.log(response.kbb_data);
						$("#kbb").append($("<h1>").hide().html(response.message).fadeIn(5000));
					}
					else
					{
						console.log("Type is:" + response.type);
						console.log(response);
						$("#kbb").hide().html(response.data).fadeIn("slow");
						handleClick(port);
					}
					$("#kbb").slideDown();
				console.log("returned");
				});
			});
}


