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
    console.log({x:x,y:y, degrees: degrees, radius:radius});

    context.translate(0, 0);
    context.scale(w/2, h/2);
    context.arc(1, 1, 1, 0, 2*Math.PI, false);
    context.closePath();
    context.restore();
}

function drawCanvas(canvasId, data)
{
    //// General Declarations
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext('2d');


    //// Color Declarations
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

    //// Frames
    var frame = makeRect(10, 20, 240, 200);

    var fairprice = data.data.values.privatepartyfair.price;
    var goodprice = data.data.values.privatepartygood.price;
    var verygoodprice = data.data.values.privatepartyverygood.price;
    var excellentprice = data.data.values.privatepartyexcellent.price;
    var scaleLow = Math.floor(data.data.scale.scaleLow * .85);
    var scaleHigh = Math.floor(data.data.scale.scaleHigh);


    //// Abstracted Attributes
    var kbbStartAngle = (((fairprice-scaleLow)/(scaleHigh-scaleLow))*(360-180))+180;
    var kbbEndAngle = (((excellentprice-scaleLow)/(scaleHigh-scaleLow))*(360-180))+180;
    console.log(data);
    console.log(fairprice);
    console.log(scaleLow);
    console.log(scaleHigh);
    console.log(excellentprice);
    console.log(kbbStartAngle);
    console.log(kbbEndAngle);

    var redSemiCircleStartAngle = kbbEndAngle;
    var greySemiCircleEndAngle = redSemiCircleStartAngle;
    var greenSemiCircleStartAngle = kbbStartAngle;
    var greenSemiCircleEndAngle = redSemiCircleStartAngle;
    var textContent = 'PRIVATE PARTY RANGE';
    var minPriceContent = "$" + scaleLow;
    var maxPriceContent = '$'+ scaleHigh;
    var excellentPriceRect = makeRect(frame.x + Math.floor((frame.w - 44) * 0.97881 + 0.5), frame.y + Math.floor((frame.h - 17) * 0.17734 + 0.5), 44, 17);
    var excellentPriceContent = '$' + excellentprice;
    var fairPriceRect = makeRect(frame.x + Math.floor((frame.w - 48) * 0.02586 + 0.5), frame.y + Math.floor((frame.h - 17) * 0.17734 + 0.5), 48, 17);
    var fairPriceContent = '$'+fairprice;
    var goodPriceRect = makeRect(frame.x + Math.floor((frame.w - 48) * 0.30172 + 0.5), frame.y + Math.floor((frame.h - 17) * 0.02956 + 0.5), 48, 17);
    var goodPriceContent = '$'+ goodprice;
    var veryGoodPriceRect = makeRect(frame.x + Math.floor((frame.w - 48) * 0.71552 + 0.5), frame.y + Math.floor((frame.h - 17) * 0.02956 + 0.5), 48, 17);
    var veryGoodPriceContent = '$'+verygoodprice;


    //// Red Semi Circle Drawing
    arc(context, frame.x + Math.floor(frame.w * 0.07336 + 0.5), frame.y + Math.floor(frame.h * 0.20833) + 0.5, Math.floor(frame.w * 0.96525 + 0.5) - Math.floor(frame.w * 0.07336 + 0.5), Math.floor(frame.h * 1.34559) - Math.floor(frame.h * 0.20833), redSemiCircleStartAngle, 0, true);
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
    arc(context, frame.x + Math.floor(frame.w * 0.07336 + 0.5), frame.y + Math.floor(frame.h * 0.20833) + 0.5, Math.floor(frame.w * 0.96525 + 0.5) - Math.floor(frame.w * 0.07336 + 0.5), Math.floor(frame.h * 1.34559) - Math.floor(frame.h * 0.20833), 180, greySemiCircleEndAngle, true);
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
    arc(context, frame.x + Math.floor(frame.w * 0.00000 + 0.5), frame.y + Math.floor(frame.h * 0.12010) + 0.5, Math.floor(frame.w * 1.03475 + 0.5) - Math.floor(frame.w * 0.00000 + 0.5), Math.floor(frame.h * 1.43873) - Math.floor(frame.h * 0.12010), greenSemiCircleStartAngle, greenSemiCircleEndAngle, true);
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
    oval(context, frame.x + Math.floor((frame.w - 10) * 0.38353) + 0.5, frame.y + Math.floor((frame.h - 10) * 0.12629) + 0.5, 10, 10);
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
    dot(context, greenSemiCircleStartAngle, 260/2, 10, 10);
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
    oval(context, frame.x + Math.floor((frame.w - 10) * 0.66867) + 0.5, frame.y + Math.floor((frame.h - 10) * 0.12629) + 0.5, 10, 10);
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


    //// Oval 5 Drawing
    oval(context, frame.x + Math.floor((frame.w - 10) * 0.88554) + 0.5, frame.y + Math.floor((frame.h - 10) * 0.28093) + 0.5, 10, 10);
    context.save();
    shadow(context);
    context.fillStyle = good;
    context.fill();

    ////// Oval 5 Inner Shadow
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


    //// Text Drawing
    var textRect = makeRect(frame.x + Math.floor((frame.w - 94) * 0.50303 + 0.5), frame.y + Math.floor((frame.h - 10) * 0.29897 + 0.5), 94, 10);
    context.fillStyle = whiteColor;
    context.font = '9px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'center';
    context.fillText(textContent, textRect.x + textRect.w/2, textRect.y + 9);


    //// kbblogo Drawing
    var kbblogoRect = makeRect(frame.x + Math.floor((frame.w - 100) * 0.53459 + 0.5), frame.y + Math.floor((frame.h - 100) * 1.00000 + 0.5), 100, 100);
    context.beginPath();
    context.rect(kbblogoRect.x, kbblogoRect.y, kbblogoRect.w, kbblogoRect.h);
    context.save();
    context.clip();
    context.drawImage(logo240, Math.floor(kbblogoRect.x + 0.5), Math.floor(kbblogoRect.y + 0.5), logo240.width, logo240.height);
    context.restore();


    //// Min Price Drawing
    var minPriceRect = makeRect(frame.x + Math.floor((frame.w - 44) * 0.08372 + 0.5), frame.y + Math.floor((frame.h - 17) * 0.85561 + 0.5), 44, 17);
    context.fillStyle = blackColor;
    context.font = '12px Tahoma, Verdana, Segoe, sans-serif';
    context.textAlign = 'left';
    context.fillText(minPriceContent, minPriceRect.x, minPriceRect.y + 12);


    //// Max Price Drawing
    var maxPriceRect = makeRect(frame.x + Math.floor((frame.w - 60) * 0.94975 + 0.5), frame.y + Math.floor((frame.h - 17) * 0.85561 + 0.5), 60, 17);
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
}
