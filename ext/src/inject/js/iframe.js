$(document).ready(function(){
	// console.info("iFrame Script Running");
	if ((window.location.toString().indexOf("kbb.com") > -1) && (window.location != window.parent.location)) {
		//console.info("iFrame Script is kbb.com");
		//alert("Sean is cool");
		$("#marketMeterCanvas").closest('body').css({'background-color': '#ffffff'});
		$("#marketMeterCanvas").closest('body').css('background-image', 'none');
		$("#marketMeterCanvas").closest('body').css('overflow-x', 'hidden');
		$("#marketMeterCanvas").closest('body').html($("#marketMeterCanvas"));
		$("#marketMeterCanvas").closest('body').append("<a target=\"_blank\" href=\"" + iframePath + "\">" + iframePath + "</a>");
	} else{
		console.info("iFrame Script is " + window.location.href);
	}
});