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

var conditions = {
	"excellent" : [
		'like new', 'new', 'excellent'
	],
	"very good" : [
		'great'
	],
	"good" : [
		'good', 'ok', 'okay'
	],
	"fair" : [
		'fair', 'bad'
	]
}

listPrice = (l=$(".postingtitle").text().match(/\$([\d,]+)/))?l[1].replace(/k/,"000"):0;

carInfo = {};
$.each($(".mapAndAttrs p.attrgroup span"), function(i,el){
		e = $(el).text().split(":");
		if(typeof e[1] !== 'undefined'){
			carInfo[e[0].trim()] = e[1].trim();
			console.log("carInfo['"+e[0].trim()+"'] = "+e[1].trim());
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
console.log("before", carInfo['condition']);
carInfo['condition'] = ($.inArray(carInfo['condition'], conditions['excellent']) > 0) ? 'excellent':carInfo['condition'];
carInfo['condition'] = ($.inArray(carInfo['condition'], conditions['very good']) > 0) ? 'very good':carInfo['condition'];
carInfo['condition'] = ($.inArray(carInfo['condition'], conditions['good']) > 0) ? 'good':carInfo['condition'];
carInfo['condition'] = ($.inArray(carInfo['condition'], conditions['fair']) > 0) ? 'fair':carInfo['condition'];
console.log("after", carInfo['condition']);

if(!carInfo["model"])
{
	var regex = new RegExp(carInfo["car"].trim() + "\\s(\\w+)\\s");
	console.log(regex);
	var title = $(".postingtitle").text().match(regex);
	console.log(title);
	if(title && title.length > 1)
		carInfo["model"] = title[1];
	console.log(carInfo["model"]);
}

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
	$("#kbb-frame").prepend($("<h1 id='listPrice'>").html("List Price: <span>$"+ listPrice+"</span>").hide().fadeIn("slow"))
	$("#kbb-frame").prepend($("<h1 id='kbb-title'>").html("Kelley Blue Book").hide().fadeIn("slow"));		
	$("#kbb").append(html);
};
addKbb('<div class="progress"><div class="progress-bar progress-bar-striped active"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>');

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
var type = (m=url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
port.postMessage({type:type, url: url, kbb_data: kbb_data, carInfo: carInfo});
port.onMessage.addListener(function(response){
	handleResponse(response);
});
// $.ajax({
//       url: url,
//       dataType: "html",
//       type: "GET",
//       data: kbb_data,
// 	  error: function(jqXHR, textStatus, errorThrown){
// 	  		if(carInfo["year"] < 1994)
// 	  		{
// 	  			$("#kbb").hide().html("<div class='alert alert-warning' role='alert'>Sorry. Kelley Blue Book does not provide information for cars older than 1994</div>").fadeIn("slow");
// 	  		}
// 	  		else{
// 	  			makeDropdowns();
// 	  		}
// 	  },
//       success: function(data, responseText, jqXHR){
//       		var extracted = $($.parseHTML(data)).find(".mod-gradiated-content");
//       		extracted.find("aside").remove();
//       		extracted.find("*").removeClass("collapse");
//       		//if(extracted.find(".selected"))
//       		//extracted.find(".mod-category").not(".selected").remove();
// 			$.each(extracted.find("a"), function(i,el){
// 				var e = $(el);
// 				e.attr("target","_BLANK");
// 				e.attr("onclick", "");
// 				e.addClass("kbb-link");
// 				e.attr("href", "http://www.kbb.com" + e.attr("href"));
// 			});
//       		$("#kbb").hide().html(extracted.html()).fadeIn("slow");
//       		handleClick(port);
//       }
//     });

console.log("http://www.seantburke.com/");
var handleClick = function(port){
			$(".kbb-link").on('click', function(e){
				console.log(e);
				e.preventDefault();
				$("#kbb").html($("<h1>").html('<div class="progress"><div class="progress-bar progress-bar-striped active"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>').hide().fadeIn("slow"));
				var url = $(this).attr("href");
				var type = (m=$(this).attr("href").match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
				console.log(url);
				console.log(type);
				port.postMessage({type:type, url: url, kbb_data: kbb_data});
				port.onMessage.addListener(handleResponse);
			});
}
handleClick(port);

var handleForm = function(port){
	$("#kbb-submit").on('click', function(e){
		console.log(e);
		e.preventDefault();
		var url = ("http://www.kbb.com/"+ $("#kbb-make").val() +"/"+$("#kbb-model").val()+"/"+$("#kbb-year").val()+"-"+$("#kbb-make").val()+"-"+$("#kbb-model").val()+"/styles/?intent=buy-used&mileage=" + $("#kbb-mileage").val()).replace(/ /g,"-");
		var type = (m=url.match(/(styles|options|categories|\/condition\/)/))?m[0].replace(/\//g,''):"default";
		$("#kbb").html($("<h1>").html('<div class="progress"><div class="progress-bar progress-bar-striped active"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>').hide().fadeIn("slow"));
		console.log(url);
		console.log(type);
		port.postMessage({type:type, url: url, kbb_data: kbb_data});
		port.onMessage.addListener(handleResponse);
	})
}

var handleResponse = function(response) {
	console.log(response);
	if(response.type == "default"){
		console.log("This is the Default type");
		console.log(response);
		carPriceInfo = "("+(st=(s=response.data).substring(s.search(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)+s.match(/(KBB\.Vehicle\.Pages\.PricingOverview\.Buyers\.setup\()/)[0].length, s.length)).substring(0,st.search(/\);/)).replace(/\s/g, "").replace(/&quot;/g,"'")+")";
		d=eval(carPriceInfo);
		console.log(d);


		kbb_price = {'excellent': d.data.values.privatepartyexcellent.price, 'very good': d.data.values.privatepartyverygood.price, 'good': d.data.values.privatepartygood.price, 'fair':d.data.values.privatepartyfair.price};

		if(kbb_price[carInfo['condition']]){
			current_price = kbb_price[carInfo['condition']];
		}
		else{
			current_price = kbb_price['fair'];
		}
		priceLabel = "Kbb Price: <span color='green'>$" + current_price + "</span>";
		$("#kbb").hide().html($(response.img)).fadeIn("slow");
		$("#kbb").prepend($("<h2>Mileage: "+ d.mileage+"<h2>"));
		$("#kbb").prepend($("<h2>", {
			id: "carInfo"
		}).html(d.year + " " + d.manufacturer + " " + d.model + " " + d.style));
		$("#kbb").append($("<h1>", {
			id: "price",
			class: "priceInfo"
		}).html(priceLabel).hide().fadeIn("slow"));
		var priceDiffLabel;

		if(listPrice > current_price)
		{
			priceDiffLabel = "<span class='red'>$"+ listPrice +"</span> <br><small class='red'>$"+ (listPrice - current_price) +" overpriced</small></h1>";
		}
		else{
			priceDiffLabel = "<span class='green'>$"+ listPrice +"</span> <br><small class='green'>$"+ (current_price - listPrice) +" underpriced</small></h1>";
		}
		priceDiffLabel = "List Price: "+ priceDiffLabel;
		$("#kbb").append($("<h1>", {
			id: "price",
			class: "priceInfo"
		}).html(priceDiffLabel).hide().fadeIn("slow"));
		$("#kbb").append($("<div>", {id: "kbb-price-canvas"}));
		$("#kbb-price-canvas").html('<canvas id="mainCanvas" width="260" height="220"></canvas><div style="display: none"><img src="'+ chrome.extension.getURL('/src/inject/webcode/images/logo240.png')+'" width="1" height="1" alt="Preload of images/logo240.png" /><img src="'+ chrome.extension.getURL('/src/inject/webcode/images/logo240_2x.png')+'"" width="1" height="1" alt="Preload of images/logo240_2x.png" /></div>');
		drawCanvas('mainCanvas', {kbb:d, listPrice:listPrice});

		$("#kbb").append($("<h2>", {
			id: "priceexcellent",
			class: "priceInfo"
		}).html("Excellent: $" + d.data.values.privatepartyexcellent.price).hide().fadeIn("slow"));
		$("#kbb").append($("<h2>", {
			id: "priceverygood",
			class: "priceInfo"
		}).html("Very Good: $" + d.data.values.privatepartyverygood.price).hide().fadeIn("slow"));
		$("#kbb").append($("<h2>", {
			id: "pricegood",
			class: "priceInfo"
		}).html("Good: $" + d.data.values.privatepartygood.price).hide().fadeIn("slow"));
		$("#kbb").append($("<h2>", {
			id: "pricefair",
			class: "priceInfo"
		}).html("Fair: $" + d.data.values.privatepartyfair.price).hide().fadeIn("slow"));

		var perc = (d.data.values.fpp.price-d.data.values.fpp.priceMin)/(d.data.values.fpp.priceMax-d.data.values.fpp.priceMin)*100;
		$("#kbb").append($("<div>",{class:"row"}).html(
			'<div class="col-xs-2">'+
			'<span class="label label-success">$'+d.data.values.fpp.priceMin+'</span>'+
			'</div><div class="col-xs-7">'+
			'<div class="progress">'+
			'<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="60" aria-valuemin="'+d.data.values.fpp.priceMin+'" aria-valuemax="'+d.data.values.fpp.priceMax+'" aria-valuenow="'+d.data.values.fpp.price+'" style="width:'+perc+'%;">$'+d.data.values.fpp.price+'</div></div></div>'+
			'<div class="col-xs-1">'+
			'<span class="label label-danger">$'+d.data.values.fpp.priceMax+'</span>'+
			'</div>'
			).hide().fadeIn("slow"));		

		$("#kbb").append($("<a>", {href:response.url + "&pricetype="+response.kbb_data.pricetype+"&mileage="+response.kbb_data.mileage+"&condition=all",class:"btn btn-primary", target: "_BLANK"}).html("Open in KBB.com").hide().fadeIn("slow"));	
		handleClick(port);
	}
	else if(response.type == "status")
	{
		console.log(response.message);
		console.log(response.kbb_data);
		$("#kbb").html($('<div class="progress"><div class="progress-bar progress-bar-striped active"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="'+response.progress+'" style="width: '+response.progress+'%">' + response.message+ '</div></div>').hide().fadeIn("slow"));
	}
	else if(response.type == "error")
	{
		console.log(response.message);
		console.log(response.kbb_data);
		makeDropdowns(function(){
				$("#kbb").prepend($("<div class='alert alert-danger' role='alert'>Error with Kelley Blue Book <a target='_BLANK' class='btn btn-primary' href='"+response.url+"'>Visit KBB.com</a></div>").hide().html(response.message).fadeIn("slow"));
			});
		
	}
	else if(response.type == "init_error"){
		if(carInfo["year"] < 1994){
			makeDropdowns(function(){
				$("#kbb").prepend($("<div>").hide().html("<div class='alert alert-warning' role='alert'>Sorry. Kelley Blue Book does not provide information for cars older than 1994</div>").fadeIn("slow"));
			});
			
		}
		else{
			makeDropdowns();
		}
	}
	else
	{
		console.log("Type is:" + response.type);
		$("#kbb").hide().html(response.data).fadeIn("slow");
		$("#kbb").append($("<a>", {href:response.url + "&pricetype="+response.kbb_data.pricetype+"&mileage="+response.kbb_data.mileage+"&condition=all",class:"btn btn-primary", target: "_BLANK"}).html("Open in KBB.com").hide().fadeIn("slow"));	
		handleClick(port);
	}
	$("#kbb").slideDown();
console.log("returned");
};

var makeDropdowns = function(callback){
	$.ajax({
		url: 'http://www.kbb.com/jsdata/_makesmodels',
		dataType: "json",
		type: "GET",
		data: {
			vehicleclass: "UsedCar",
			yearid: carInfo["year"]
		},
		error: function(jqXHR, textStatus, errorThrown){
			var form = $("<form>",{id:"kbb-form"});
	  		form.append($("<select>",{"id":"kbb-make", "type":"text", "name":"make","value":kbb_data["make"]}));
	  		form.append($("<select>",{"id":"kbb-model", "type":"text", "name":"model","value":kbb_data["model"]}));
	  		form.append($("<select>",{"id":"kbb-year", "type":"text", "name":"year","value":kbb_data["year"]}));
	  		form.append($("<select>",{"id":"kbb-mileage", "type":"text", "name":"mileage","value":kbb_data["mileage"]}));
	  		form.append($("<select>",{"id":"kbb-submit", "type":"button", "name":"submit","value":"submit"}));
	  		for(var i=0; i<data.length; i++){
				var option = document.createElement("option");
				option.text = jsonData[i].Name;
				$('#kbb-make')[0].add(option);
			}
	  		$("#kbb").hide().html(form).fadeIn("slow");
		},
		success: function(data, responseText, jqXHR){
			console.log(data);
			var form = $("<form>",{id:"kbb-form"});
			form.append($("<select>",{"id":"kbb-year", "name":"year","value":kbb_data["year"]}));
			form.append($("<select>",{"id":"kbb-make", "name":"make","value":kbb_data["make"]}));
			form.append($("<select>",{"id":"kbb-model", "name":"model","value":kbb_data["model"]}));
			form.append($("<input>",{"id":"kbb-mileage","type":"text", "name":"mileage","value":kbb_data["mileage"], "placeholder":"Mileage"}));
			form.append($("<input>",{"id":"kbb-submit", "type":"button", "name":"submit","value":"submit"}));

			$("#kbb").hide().html(form).fadeIn("slow");
			$('#kbb-year').append($("<option value='0'>Year</option><option value=''>----</option>"));
			$('#kbb-make').append($("<option value=' '>Make</option><option value=''>----</option>"));
			$('#kbb-model').append($("<option value=' '>Model</option><option value=''>----</option>"));
			for(var i=1993; i<=new Date().getFullYear(); i++){
				if(i == carInfo["year"])
				{
					$('#kbb-year').append($("<option selected value='" +i+ "'>"+i+"</option>"));
				}
				else
				{
					$('#kbb-year').append($("<option value='" +i+ "'>"+i+"</option>"));
				}
			
			}
			for(var i=0; i<data.length; i++){
				if(carInfo["make"] && carInfo["make"].toUpperCase() == data[i].Name.toUpperCase())
				{
					for(var j=0; j<data[i].Model.length; j++)
					{
						if(carInfo["model"] && carInfo["model"].toUpperCase() == data[i].Model[j].Name.toUpperCase())
						{
							$('#kbb-model').append($("<option selected value='" + data[i].Model[j].Name+ "'>"+data[i].Model[j].Name+"</option>"));
						}
						else
						{
							$('#kbb-model').append($("<option value='" + data[i].Model[j].Name+ "'>"+data[i].Model[j].Name+"</option>"));	
						}
					}
					$('#kbb-make').append($("<option selected value='" + data[i].Name+ "'>"+data[i].Name+"</option>"));
				}
				else
				{
				$('#kbb-make').append($("<option value='" + data[i].Name+ "'>"+data[i].Name+"</option>"));
				}
			}
			handleMakeDropdown(data);
			handleForm(port);
			callback();
		}
	});
};


var handleMakeDropdown = function(data){
	$("#kbb-make").bind("change", function(){
		$("#kbb-model").find("option").remove().add("<option value='0'>Model</option><option value=''>----</option>");
		var continueMake = true;
		for(var i=0; i<data.length; i++){
			if(continueMake && $(this).val() == data[i].Name)
			{
				continueMake = false;
				for(var j=0; j<data[i].Model.length; j++)
				{
					$('#kbb-model').append($("<option value='" + data[i].Model[j].Name+ "'>"+data[i].Model[j].Name+"</option>"));	
				}
			}
		}
	});
};

