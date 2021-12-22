import Constants from '../constants.js';

function clearCanvas(canvas, context) {
  if (!canvas) return;
  context.fillStyle = Constants.canvasBackgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.width);
}

function drawHexagons(canvas, base_hexagons, players, layout) {
  let context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = Constants.canvasBackgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 30 / 2 + 'px ' + Constants.FONT_FAMILY;

  clearCanvas(canvas, context);

  let hexagons = hexDrawables(base_hexagons, layout);

  // draw the hexagons on the canvas
  for (var i = 0; i < hexagons.length; i++) {
    var hexagon = hexagons[i];

    context.beginPath();
    context.moveTo(hexagon.corners[0].x, hexagon.corners[0].y);
    for (var j = 1; j < hexagon.corners.length; j++) {
      context.lineTo(hexagon.corners[j].x, hexagon.corners[j].y);
    }
    context.closePath();

    // fill hexagon
    context.fillStyle =
      hexagon.ownerId === Constants.HexOwner.NONE || !players[hexagon.ownerId]
        ? '#9e9e9e'
        : players[hexagon.ownerId].color.bg;
    context.fill();

    // super cell lines
    if (hexagon.maxGrowth === 300) {
      drawSuperCell(context, hexagon);
    }

    // hexagon border
    context.lineWidth = 1;
    context.strokeStyle = Constants.canvasBackgroundColor;
    context.stroke();

    // text inside hexagon
    context.font = 'bold ' + hexagon.radius / 2 + 'px ' + Constants.FONT_FAMILY;
    context.fillStyle =
      hexagon.ownerId === Constants.HexOwner.NONE || !players[hexagon.ownerId]
        ? 'black'
        : players[hexagon.ownerId].color.fg;
    context.fillText(hexagon.resources, hexagon.center.x, hexagon.center.y, hexagon.radius);
  }
}

function drawSuperCell(context, hexagon) {
  // context.strokeStyle = "#878787";
  context.beginPath();

  // 3 lines above middle
  context.moveTo((hexagon.corners[0].x + hexagon.corners[5].x) / 2, (hexagon.corners[0].y + hexagon.corners[5].y) / 2);
  context.lineTo((hexagon.corners[3].x + hexagon.corners[4].x) / 2, (hexagon.corners[3].y + hexagon.corners[4].y) / 2);

  context.moveTo(
    ((hexagon.corners[0].x + hexagon.corners[5].x) / 2 + hexagon.corners[5].x) / 2,
    ((hexagon.corners[0].y + hexagon.corners[5].y) / 2 + hexagon.corners[5].y) / 2,
  );
  context.lineTo(
    ((hexagon.corners[3].x + hexagon.corners[4].x) / 2 + hexagon.corners[4].x) / 2,
    ((hexagon.corners[3].y + hexagon.corners[4].y) / 2 + hexagon.corners[4].y) / 2,
  );

  context.moveTo(
    ((hexagon.corners[0].x + hexagon.corners[5].x) / 2 + hexagon.corners[0].x) / 2,
    ((hexagon.corners[0].y + hexagon.corners[5].y) / 2 + hexagon.corners[0].y) / 2,
  );
  context.lineTo(
    ((hexagon.corners[3].x + hexagon.corners[4].x) / 2 + hexagon.corners[3].x) / 2,
    ((hexagon.corners[3].y + hexagon.corners[4].y) / 2 + hexagon.corners[3].y) / 2,
  );

  // middle
  context.moveTo(hexagon.corners[0].x, hexagon.corners[0].y);
  context.lineTo(hexagon.corners[3].x, hexagon.corners[3].y);

  // 3 lines below middle
  context.moveTo((hexagon.corners[0].x + hexagon.corners[1].x) / 2, (hexagon.corners[0].y + hexagon.corners[1].y) / 2);
  context.lineTo((hexagon.corners[2].x + hexagon.corners[3].x) / 2, (hexagon.corners[2].y + hexagon.corners[3].y) / 2);

  context.moveTo(
    ((hexagon.corners[0].x + hexagon.corners[1].x) / 2 + hexagon.corners[0].x) / 2,
    ((hexagon.corners[0].y + hexagon.corners[1].y) / 2 + hexagon.corners[0].y) / 2,
  );
  context.lineTo(
    ((hexagon.corners[2].x + hexagon.corners[3].x) / 2 + hexagon.corners[3].x) / 2,
    ((hexagon.corners[2].y + hexagon.corners[3].y) / 2 + hexagon.corners[3].y) / 2,
  );

  context.moveTo(
    ((hexagon.corners[0].x + hexagon.corners[1].x) / 2 + hexagon.corners[1].x) / 2,
    ((hexagon.corners[0].y + hexagon.corners[1].y) / 2 + hexagon.corners[1].y) / 2,
  );
  context.lineTo(
    ((hexagon.corners[2].x + hexagon.corners[3].x) / 2 + hexagon.corners[2].x) / 2,
    ((hexagon.corners[2].y + hexagon.corners[3].y) / 2 + hexagon.corners[2].y) / 2,
  );

  // draw
  context.stroke();
}

function hexDrawables(hexagons, layout) {
  function hexCenter(hexagon, layout) {
    const y = hexagon.cube.y;
    const z = hexagon.cube.z;
    var hexCenter = {};
    if (layout.orientation === Constants.HexgridOrientation.FLAT) {
      hexCenter.x = layout.center.x + (3 / 2) * layout.hex_radius * -z;
      hexCenter.y = layout.center.y + 3 ** 0.5 * layout.hex_radius * (-z / 2 + -y);
    } else if (layout.orientation === Constants.HexgridOrientation.POINTY) {
      hexCenter.x = layout.center.x + 3 ** 0.5 * layout.hex_radius * (-z / 2 + -y);
      hexCenter.y = layout.center.y + (3 / 2) * layout.hex_radius * -z;
    } else throw Error('Invalid orientation: Must be either FLAT or POINTY, was ' + layout.orientation);

    return hexCenter;
  }

  function hexCorners(center, layout) {
    function hexCorner(ori, center, radius, i) {
      var angle_deg = ori === Constants.HexgridOrientation.FLAT ? 60 * i : 60 * i - 30;
      var angle_rad = (Math.PI / 180) * angle_deg;
      return {
        x: center.x + radius * Math.cos(angle_rad),
        y: center.y + radius * Math.sin(angle_rad),
      };
    }

    var corners = [];
    for (var i = 0; i < 6; i++) {
      corners.push(hexCorner(layout.orientation, center, layout.hex_radius, i));
    }
    return corners;
  }

  const hexagonDrawables = hexagons.map(function (hexagon) {
    const center = hexCenter(hexagon, layout);
    return {
      ...hexagon,
      center: center,
      corners: hexCorners(center, layout),
      radius: layout.hex_radius,
    };
  });

  return hexagonDrawables;
}

export default drawHexagons;
