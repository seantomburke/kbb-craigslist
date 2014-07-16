function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function dot(context, degrees, radius, w, h){
    context.save();
    context.beginPath();

    var x = radius*Math.cos(toRadians(degrees+180));
    var y = radius*Math.sin(toRadians(degrees+180));
    console.log({x:x,y:y, degrees: degrees, radius:radius});

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

    var kbbStartAngle = (((fairprice-scaleLow)/(scaleHigh-scaleLow))*(360-180))+180;
    var kbbEndAngle = (((excellentprice-scaleLow)/(scaleHigh-scaleLow))*(360-180))+180;

    var redSemiCircleStartAngle = kbbEndAngle;
    var greySemiCircleEndAngle = redSemiCircleStartAngle;
    var greenSemiCircleStartAngle = kbbStartAngle;
    var greenSemiCircleEndAngle = redSemiCircleStartAngle;

    var minPriceContent = "$" + scaleLow;
    var maxPriceContent = '$'+ scaleHigh;
    var excellentPriceContent = '$' + excellentprice;
    var fairPriceContent = '$'+fairprice;
    var goodPriceContent = '$'+ goodprice;
    var veryGoodPriceContent = '$'+verygoodprice;
}