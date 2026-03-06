# DotMatrix

Simulates a dot matrix halftone pattern by mapping pixel brightness to dot size within a regular grid.

Each cell in the grid is sampled at its center to determine the local average brightness.
Dots grow or shrink proportionally bright areas produce small dots, dark areas produce large ones
reproducing the ink density illusion used in offset printing and newsprint reproduction.

## Info

**Author:** @JaimELegor
**Version:** 1.0.0
**Category:** `DITHER/Halftone`

## Parameters

| Name | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `cellsize` | `6` | `2` | `20` | `1` |
| `invert` | `0` | `0` | `1` | `0.5` |
| `blend` | `0.5` | `0` | `1` | `0.05` |

## Process Function

```js
(img, r, g, b, a, x, y, ...params) => {
    const [cellSize, invert, blend] = params;
    const index = (x, y) => 4 * (x + y * img.width);

    const cellX = Math.floor(x / cellSize) * cellSize;
    const cellY = Math.floor(y / cellSize) * cellSize;

    let sum = 0;
    let count = 0;
    for (let cy = 0; cy < cellSize; cy++) {
      for (let cx = 0; cx < cellSize; cx++) {
        const px = cellX + cx;
        const py = cellY + cy;
        if (px >= img.width || py >= img.height) continue;
        const i = index(px, py);
        sum += (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
        count++;
      }
    }

    const avg = sum / count;
    const radius = (1 - avg / 255) * (cellSize / 2);
    const dx = (x - (cellX + cellSize / 2));
    const dy = (y - (cellY + cellSize / 2));
    const dist = Math.sqrt(dx * dx + dy * dy);

    let patternColor = invert ? 255 : 0;
    if (dist < radius) patternColor = invert ? 0 : 255;

    // Blend original color with pattern
    img.pixels[index(x, y)]     = r * blend + patternColor * (1 - blend);
    img.pixels[index(x, y) + 1] = g * blend + patternColor * (1 - blend);
    img.pixels[index(x, y) + 2] = b * blend + patternColor * (1 - blend);
  }
```

## Shader (GLSL)

```glsl
precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float cellSize;
uniform float invert;
uniform float blend;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord * resolution;
  vec2 cellUV = floor(uv / cellSize) * cellSize + cellSize * 0.5;
  vec3 color = texture2D(tex, uv / resolution).rgb;
  float gray = (color.r + color.g + color.b) / 3.0;
  float radius = (1.0 - gray) * (cellSize * 0.5);
  float dist = length(uv - cellUV);
  float c = step(dist, radius);
  c = invert > 0.5 ? 1.0 - c : c;

  vec3 finalColor = color * blend + vec3(c) * (1.0 - blend);
  gl_FragColor = vec4(finalColor, 1.0);
}
```

---
*Submitted via Gargoyles editor*