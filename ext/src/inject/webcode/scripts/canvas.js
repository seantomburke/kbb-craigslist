function oval(context, x, y, w, h)
{
    context.save();
    context.beginPath();
    context.translate(x, y);
    context.scale(w/2, h/2);
    context.arc(1, 1, 1, 0, 2*Math.PI, false);
    context.closePath();
    context.restore();
}

function arc(context, x, y, w, h, startAngle, endAngle, isClosed)
{
    context.save();
    context.beginPath();
    context.translate(x, y);
    context.scale(w/2, h/2);
    context.arc(1, 1, 1, Math.PI/180*startAngle, Math.PI/180*endAngle, false);
    if (isClosed)
    {
        context.lineTo(1, 1);
        context.closePath();
    }
    context.restore();
}

function makeRect(x, y, w, h)
{
    return { x: x, y: y, w: w, h: h };
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function dot(context, degrees, radius, w, h){
    context.save();
    context.beginPath();

    var x = radius*Math.cos(toRadians(degrees+180));
    var y = radius*Math.sin(toRadians(degrees+180));
    //console.log{x:x,y:y, degrees: degrees, radius:radius});

    context.translate(x, y);
    context.scale(w/2, h/2);
    context.arc(1, 1, 1, 0, 2*Math.PI, false);
    context.closePath();
    context.restore();
}

function drawCanvas(canvasId, input)
{
    var fairprice = input.kbb.data.values.privatepartyfair.price;
    var goodprice = input.kbb.data.values.privatepartygood.price;
    var verygoodprice = input.kbb.data.values.privatepartyverygood.price;
    var excellentprice = input.kbb.data.values.privatepartyexcellent.price;
    var scaleLow = Math.floor(input.kbb.data.scale.scaleLow * .85);
    var scaleHigh = Math.floor(input.kbb.data.scale.scaleHigh);
    var listPrice = input.listPrice;

    var kbbStartAngle = (((fairprice-scaleLow)/(scaleHigh-scaleLow))*(360-180))+180;
    var kbbEndAngle = (((excellentprice-scaleLow)/(scaleHigh-scaleLow))*(360-180))+180;
    kbbStartAngle = 225;
    kbbEndAngle = 315;
    //// General Declarations
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext('2d');

    var currentX = 129.5;
    var currentY = 54.5;

    //// Color Declarations
    var currentPriceColor = 'rgba(29, 52, 255, 1)';
    var blackColor = 'rgba(0, 0, 0, 1)';
    var whiteColor = 'rgba(255, 255, 255, 1)';
    var grey = 'rgba(237, 238, 237, 1)';
    var good = 'rgba(101, 160, 89, 0.86)';
    var goodPriceColor = 'rgba(27, 160, 0, 0.86)';
    var bad = 'rgba(195, 24, 21, 1)';
    var color = 'rgba(255, 255, 255, 1)';

    //// Shadow Declarations
    function shadow(context)
    {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 5;
        context.shadowColor = blackColor;
    }
    function shadow3(context)
    {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0.5;
        context.shadowColor = color;
    }

    //// Image Declarations
    var logo240 = new Image();
    logo240.src = chrome.extension.getURL('/src/inject/webcode/images/logo240.png');

    //// Abstracted Attributes
    var redSemiCircleStartAngle = 315;
    var greySemiCircleEndAngle = 315;
    var greenSemiCircleStartAngle = 225;
    var greenSemiCircleEndAngle = 315;
    var privatePartyRangeContent = 'PRIVATE PARTY RANGE';
    var excellentPriceRect = makeRect(188, 70, 44, 17);
    var veryGoodPriceRect = makeRect(146, 46, 48, 17);
    var currentPriceRect = makeRect(111, 37, 48, 17);
    var goodPriceRect = makeRect(67, 44, 48, 17);
    var fairPriceRect = makeRect(27, 68, 48, 17);

    var redSemiCircleStartAngle = kbbEndAngle;
    var greySemiCircleEndAngle = redSemiCircleStartAngle;
    var greenSemiCircleStartAngle = kbbStartAngle;
    var greenSemiCircleEndAngle = redSemiCircleStartAngle;

    var minPriceContent = scaleLow.toMoney();
    var maxPriceContent = scaleHigh.toMoney();
    var excellentPriceContent = excellentprice.toMoney();
    var fairPriceContent = fairprice.toMoney();
    var goodPriceContent = goodprice.toMoney();
    var veryGoodPriceContent = verygoodprice.toMoney();
    var currentPriceContent = listPrice.toMoney();


    if(listPrice < fairprice)
    {
        currentX = 28;
        currentY = 130;
        currentPriceColor = goodPriceColor;
        currentPriceRect = makeRect(6, 110, 48, 17);
    }
    else if(listPrice > excellentprice)
    {
        currentX = 220;
        currentY = 130;
        currentPriceColor = bad;
        currentPriceRect = makeRect(220, 110, 48, 17);
    }


    //// Red Semi Circle Drawing
    arc(context, 29, 71, 200, 200, redSemiCircleStartAngle, 0, true);
    context.save();
    shadow(context);
    context.fillStyle = bad;
    context.fill();

    ////// Red Semi Circle Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.strokeStyle = bad;
    context.lineWidth = 0;
    context.stroke();


    //// Grey Semi Circle Drawing
    arc(context, 29, 71, 200, 200, 180, greySemiCircleEndAngle, true);
    context.save();
    shadow(context);
    context.fillStyle = grey;
    context.fill();

    ////// Grey Semi Circle Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.strokeStyle = grey;
    context.lineWidth = 0;
    context.stroke();


    //// Green SemiCircle Drawing
    arc(context, 19, 61, 220, 220, greenSemiCircleStartAngle, greenSemiCircleEndAngle, true);
    context.save();
    shadow(context);
    context.fillStyle = good;
    context.fill();

    ////// Green SemiCircle Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.strokeStyle = good;
    context.lineWidth = 0.5;
    context.stroke();


    //// Good Dot Drawing
    oval(context, 85.5, 62.5, 10, 10);
    context.save();
    shadow(context);
    context.fillStyle = good;
    context.fill();

    ////// Good Dot Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.save();
    shadow3(context);
    context.strokeStyle = grey;
    context.lineWidth = 3;
    context.stroke();
    context.restore();


    //// Fair Dot Drawing
    oval(context, 46.5, 87.5, 10, 10);
    context.save();
    shadow(context);
    context.fillStyle = good;
    context.fill();

    ////// Fair Dot Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.save();
    shadow3(context);
    context.strokeStyle = grey;
    context.lineWidth = 3;
    context.stroke();
    context.restore();


    //// Very Good Dot Drawing
    oval(context, 164.5, 63.5, 10, 10);
    context.save();
    shadow(context);
    context.fillStyle = good;
    context.fill();

    ////// Very Good Dot Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.save();
    shadow3(context);
    context.strokeStyle = grey;
    context.lineWidth = 3;
    context.stroke();
    context.restore();


    //// Excellent Dot Drawing
    oval(context, 204.5, 87.5, 10, 10);
    context.save();
    shadow(context);
    context.fillStyle = good;
    context.fill();

    ////// Excellent Dot Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.save();
    shadow3(context);
    context.strokeStyle = grey;
    context.lineWidth = 3;
    context.stroke();
    context.restore();


    //// Private Party Range Drawing
    var privatePartyRangeRect = makeRect(79, 100, 94, 10);
    context.fillStyle = whiteColor;
    context.font = '9px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'center';
    context.fillText(privatePartyRangeContent, privatePartyRangeRect.x + privatePartyRangeRect.w/2, privatePartyRangeRect.y + 9);


    //// kbblogo Drawing
    context.beginPath();
    context.rect(79, 120, 100, 100);
    context.save();
    context.drawImage(logo240, 79, 120, logo240.width, logo240.height);
    context.clip();
    context.restore();


    //// Min Price Drawing
    var minPriceRect = makeRect(29, 172, 44, 17);
    context.fillStyle = blackColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'left';
    context.fillText(minPriceContent, minPriceRect.x, minPriceRect.y + 12);


    //// Max Price Drawing
    var maxPriceRect = makeRect(171, 172, 60, 17);
    context.fillStyle = blackColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'right';
    context.fillText(maxPriceContent, maxPriceRect.x + maxPriceRect.w, maxPriceRect.y + 12);


    //// Excellent Price Drawing
    context.fillStyle = goodPriceColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'center';
    context.fillText(excellentPriceContent, excellentPriceRect.x + excellentPriceRect.w/2, excellentPriceRect.y + 12);


    //// Fair Price Drawing
    context.fillStyle = goodPriceColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'center';
    context.fillText(fairPriceContent, fairPriceRect.x + fairPriceRect.w/2, fairPriceRect.y + 12);


    //// Good Price Drawing
    context.fillStyle = goodPriceColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'center';
    context.fillText(goodPriceContent, goodPriceRect.x + goodPriceRect.w/2, goodPriceRect.y + 12);


    //// Very Good Price Drawing
    context.fillStyle = goodPriceColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'center';
    context.fillText(veryGoodPriceContent, veryGoodPriceRect.x + veryGoodPriceRect.w/2, veryGoodPriceRect.y + 12);


    //// Current Dot Drawing
    oval(context, currentX, currentY, 10, 10);
    context.save();
    shadow(context);
    context.fillStyle = currentPriceColor;
    context.fill();

    ////// Current Dot Inner Shadow
    context.save();
    context.clip();
    context.moveTo(-10000, -10000);
    context.lineTo(-10000, 10000);
    context.lineTo(10001, 10000);
    context.lineTo(10000, -10000);
    context.closePath();
    shadow3(context);
    context.fillStyle = 'grey';
    context.fill();
    context.restore();
    context.restore();

    context.save();
    shadow3(context);
    context.strokeStyle = grey;
    context.lineWidth = 3;
    context.stroke();
    context.restore();


    //// Current Price Drawing
    context.fillStyle = currentPriceColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'center';
    context.fillText(currentPriceContent, currentPriceRect.x + currentPriceRect.w/2, currentPriceRect.y + 12);
}
