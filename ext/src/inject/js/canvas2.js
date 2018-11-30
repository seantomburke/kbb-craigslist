const toRadians = angle => angle * (Math.PI / 180);

function dot(context, degrees, radius, w, h) {
  context.save();
  context.beginPath();

  const x = radius * Math.cos(toRadians(degrees + 180));
  const y = radius * Math.sin(toRadians(degrees + 180));
  // console.log({x:x,y:y, degrees: degrees, radius:radius});

  context.translate(x, y);
  context.scale(w / 2, h / 2);
  context.arc(1, 1, 1, 0, 2 * Math.PI, false);
  context.closePath();
  context.restore();
}

function drawCanvas(/* canvasId, input */) {
  // let fairprice = input.kbb.data.values.privatepartyfair.price;
  // let goodprice = input.kbb.data.values.privatepartygood.price;
  // let verygoodprice = input.kbb.data.values.privatepartyverygood.price;
  // let excellentprice = input.kbb.data.values.privatepartyexcellent.price;
  // let scaleLow = Math.floor(input.kbb.data.scale.scaleLow * 0.85);
  // let scaleHigh = Math.floor(input.kbb.data.scale.scaleHigh);
  // let kbbStartAngle =
  //   ((fairprice - scaleLow) / (scaleHigh - scaleLow)) * (360 - 180) + 180;
  // let kbbEndAngle =
  //   ((excellentprice - scaleLow) / (scaleHigh - scaleLow)) * (360 - 180) + 180;
  // let redSemiCircleStartAngle = kbbEndAngle;
  // let greySemiCircleEndAngle = redSemiCircleStartAngle;
  // let greenSemiCircleStartAngle = kbbStartAngle;
  // let greenSemiCircleEndAngle = redSemiCircleStartAngle;
  // let minPriceContent = '$' + scaleLow;
  // let maxPriceContent = '$' + scaleHigh;
  // let excellentPriceContent = '$' + excellentprice;
  // let fairPriceContent = '$' + fairprice;
  // let goodPriceContent = '$' + goodprice;
  // let veryGoodPriceContent = '$' + verygoodprice;
}
