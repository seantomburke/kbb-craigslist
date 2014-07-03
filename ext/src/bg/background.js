// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

$("head").prepend($("<base>").attr("href","http://www.kbb.com/"));
$("body").append($("<div>").attr("id","kbb").load(
	"http://www.kbb.com/toyota/corolla/1996-toyota-corolla/styles/?intent=buy-used&mileage=165000 .mod-gradiated-content", 
	{
		miles: 100, 
		type: "toyota"
	}, 
	function(){
		console.log("Sean is Awesome");
		chrome.extension.sendMessage("Sean", "is Awesome");
}));
