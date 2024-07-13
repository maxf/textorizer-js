class Excoffizer {
  #params;
  #inputPixmap;
  #wiggleFrequency;
  #wiggleAmplitude;
  #blur;
  
  constructor(params) {
    this.#params = params;
    this.#inputPixmap = new Pixmap(params.inputCanvas);
    this.#wiggleFrequency = this.#params.waviness/100.0;
    this.#wiggleAmplitude = this.#wiggleFrequency===0 ? 0 : 0.5/this.#wiggleFrequency;
    this.#params.theta *= Math.PI/180; // degrees to radians
    this.#blur = params.blur;
  }

  excoffize() {
    return this.#excoffize();
  }

  // private
  #wiggle(x) {
    return this.#wiggleAmplitude*Math.sin(x*this.#wiggleFrequency);
  }

  #S2P({x, y}) {
    // transform x,y from "sine space" to picture space
    // rotation ('theta'), scaling (sx,sy), translation (tx, ty)
    const c = Math.cos(this.#params.theta);
    const s = Math.sin(this.#params.theta);
    const sx = this.#params.sx;
    const sy = this.#params.sy;
    const tx = this.#params.tx;
    const ty = this.#params.ty;
    return {
      x: x*sx*c - y*sy*s + tx*sx*c - ty*sy*s,
      y: x*sx*s + y*sy*c + tx*sx*s + ty*sy*c
    };
  }

  #P2S({x, y}) {
    // convert x,y from picture space to  "sine space"
    const c = Math.cos(-this.#params.theta);
    const s = Math.sin(-this.#params.theta);
    const sx = 1 / this.#params.sx;
    const sy = 1 / this.#params.sy;
    const tx = -this.#params.tx;
    const ty = -this.#params.ty;
    return {
      x: x*sx*c - y*sx*s + tx,
      y: x*sy*s + y*sy*c + ty
    };
  }

  #sidePoints(p1, p2, r) {
    const L = Math.sqrt((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y));
    const px = (p2.x-p1.x)*r/L;
    const py = (p2.y-p1.y)*r/L;
    return [
      { x: p1.x-py-(px/20), y: p1.y+px-(py/20) },
      { x: p1.x+py-(px/20), y: p1.y-px-(py/20) }
    ];
  }

  #poly2path(polygon) {
    if (polygon.length > 4) {
      const m = `M${polygon[0].x} ${polygon[0].y}`;
      polygon.shift();
      const l = polygon.map(point => ` L ${point.x} ${point.y}`).join(' ');
      return `<path d="${m} ${l}"/>\n`;
    } else {
      return '';
    }
  }

  #poly2pathSmooth(polygon) {
    if (polygon.length > 4) {
      const ps = [];
      for (let i=0; i < polygon.length-1; i++) {
        ps.push(polygon[i]);
        ps.push({ x: (polygon[i].x + polygon[i+1].x)/2, y: (polygon[i].y + polygon[i+1].y)/2 });
      }
      ps.push(polygon[polygon.length-1])
      let d = `M ${ps[0].x} ${ps[0].y} L ${ps[1].x} ${ps[1].y}`;
      for (let i=2; i < ps.length - 1; i+= 2) {
        d = d + `C ${ps[i].x} ${ps[i].y}, ${ps[i].x} ${ps[i].y}, ${ps[i+1].x} ${ps[i+1].y} `
      }
      return `<path d="${d}"/>\n`;
    } else {
      return '';
    }
  }

  #excoffize() {
    const inputWidth = this.#inputPixmap.width;
    const inputHeight  = this.#inputPixmap.height;
    const outputWidth  = 500;
    const outputHeight = 500 * inputHeight / inputWidth;
    const lineHeight = this.#params.lineHeight;
    const margin = this.#params.margin;
    let outputSvg = `
    <svg id="svg" width="${outputWidth}" height="${outputHeight}" viewBox="${-margin} ${-margin} ${outputWidth+2*margin} ${outputHeight+2*margin}">
      <desc>
        Made by excoffizer
        Params:
        - waviness: ${this.#params.waviness}
        - theta: ${this.#params.theta}
        - blur: ${this.#blur}
        - line height: ${this.#params.lineHeight}
        - margin: ${this.#params.margin}
        - sx: ${this.#params.sx}
        - sy: ${this.#params.sy}
        - tx: ${this.#params.tx}
        - ty: ${this.#params.ty}
      </desc>
      <g stroke="black" stroke-width="1" fill="none">
    `;

    // boundaries of the image in sine space
    const corner1 = this.#P2S({x: 0, y: 0});
    const corner2 = this.#P2S({x: inputWidth, y: 0});
    const corner3 = this.#P2S({x: inputWidth, y: inputHeight});
    const corner4 = this.#P2S({x: 0, y: inputHeight});
    const minX = Math.min(corner1.x,corner2.x,corner3.x,corner4.x);
    const minY = Math.min(corner1.y,corner2.y,corner3.y,corner4.y);
    const maxX = Math.max(corner1.x,corner2.x,corner3.x,corner4.x);
    const maxY = Math.max(corner1.y,corner2.y,corner3.y,corner4.y);

    // from the min/max bounding box, we know which sines to draw

    let stepx=3;
    const stepy=lineHeight;

        //for (let y = minY - this.#wiggleAmplitude; y < maxY + this.#wiggleAmplitude; y += stepy) {
    for (let y = minY - this.#wiggleAmplitude; y < maxY + this.#wiggleAmplitude; y += stepy) {
      const hatchPoints2 = [];
      let counter = 0;

      for (let x = minX; x < maxX; x += stepx) {
        const p = this.#S2P({x, y: y+this.#wiggle(x)});

        // next point ahead
        // we need it to compute the side points as they should stick out from segment [p1, p2]
        const p2 = this.#S2P({ x: x + stepx, y: y + this.#wiggle(x+stepx)});

        if ((p.x >= 0 && p.x  < inputWidth && p.y  >= 0 && p.y  < inputHeight) || (p2.x >= 0 && p2.x < inputWidth && p2.y >= 0 && p2.y < inputHeight)) {

          const imageLevel = this.#inputPixmap.brightnessAverageAt(Math.floor(p.x), Math.floor(p.y), this.#blur)

          const radius = lineHeight * ( 1 - imageLevel / 255) / 2 - 0.05;

          const zoom=outputWidth/inputWidth;

          if (radius < 0.5) {
            p.x *= zoom;
            p.y *= zoom;
            hatchPoints2.push(p);
          } else {
            const [ sidePoint1, sidePoint2 ] = this.#sidePoints(p, p2, radius);
            sidePoint1.x *= zoom;
            sidePoint1.y *= zoom;
            sidePoint2.x *= zoom;
            sidePoint2.y *= zoom;

            if (counter++ % 2) {
              hatchPoints2.push(sidePoint2);
            } else {
              hatchPoints2.push(sidePoint1);
            }
          }

          // how far away should the next point be?
          stepx = Math.max(1, 4 - radius);

        }
      }
      outputSvg += this.#poly2pathSmooth(hatchPoints2);
    }
    outputSvg += `</g></svg>`;
    return outputSvg;
  }
}
