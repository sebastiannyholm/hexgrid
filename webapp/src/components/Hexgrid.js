import React, { useEffect, useRef, useState } from 'react';
import '../styles/Hexgrid.css';
import drawHexagons from './HexgridDrawer';

function HexgridLayout(width, height, orientation, hex_radius) {
  return {
    width: width,
    height: height,
    center: { x: width / 2, y: height / 2 },
    orientation: orientation,
    hex_radius: hex_radius,
  };
}

function Hexgrid({ hexagons, players, orientation }) {
  const hexgridRef = useRef(null);
  const canvasRef = useRef(null);
  const [hexgridRect, setHexgridRect] = useState(null);

  function updateHexgridSize() {
    setHexgridRect(hexgridRef.current ? hexgridRef.current.getBoundingClientRect() : hexgridRect);
  }

  // update hexgrid dimensions whenever the reference changes (attach/detach)
  useEffect(() => {
    updateHexgridSize();
  }, [hexgridRef]);

  // re-calculate layout and re-draw hexagons
  // happens whenever:
  // - the size of the hexgrid dimensions change
  // - the hexagon data changes
  // - the grid orientation changes
  useEffect(() => {
    if (!hexgridRect || !canvasRef.current) return;

    let canvas = canvasRef.current;
    canvas.width = hexgridRect.width;
    canvas.height = hexgridRect.height;

    let minDimen = Math.min(canvas.width, canvas.height);
    var cubeOnOuterRing = hexagons[hexagons.length - 1].cube;
    var numRings = Math.max(Math.abs(cubeOnOuterRing.x), Math.abs(cubeOnOuterRing.y), Math.abs(cubeOnOuterRing.z));
    let numHexagonsWide = numRings * 2 + 1;
    let hexgridLayout = HexgridLayout(canvas.width, canvas.height, orientation, minDimen / numHexagonsWide / 3 ** 0.5);

    drawHexagons(canvasRef.current, hexagons, players, hexgridLayout);
  }, [hexgridRect, hexagons, orientation]);

  useEffect(() => {
    window.addEventListener('resize', updateHexgridSize);
    return () => window.removeEventListener('resize', updateHexgridSize);
  }, []);

  return (
    <div id="hexgrid" ref={hexgridRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Hexgrid;
