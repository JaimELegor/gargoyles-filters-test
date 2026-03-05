# Atkinson

Applies Atkinson Dithering to the image, reducing it to a limited palette
while preserving perceived detail through error diffusion.

Atkinson Dithering, developed by Bill Atkinson for the original Macintosh,
diffuses 3/4 of the quantization error across 6 neighboring pixels (rather
than the full error like Floyd-Steinberg). This produces a higher-contrast,
slightly grainier result with stronger dark/light separation — characteristic
of classic 1-bit Mac graphics.

Adjust `threshold` to control the black/white cutoff point, and `strength`
to control how aggressively the error is diffused across neighbors.

## Info

**Author:** @JaimELegor
**Version:** 1.0.0
**Category:** `DITHER/ErrorDiffusion`

## Parameters

| Name | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `levels` | `1` | `0.5` | `3` | `0.1` |
| `spread` | `1` | `0` | `1` | `0.05` |

## Process Function

```js
(img, r, g, b, a, x, y, ...params) => {
    const [levels, spread] = params;
    const quantize = (v) => Math.round(levels * v / 255) * (255 / levels);
    const index = (x, y) => 4 * (x + y * img.width);

    function dither(errR, errG, errB, arr, i, portion) {
      if (i < 0 || i >= arr.length) return;
      arr[i]     += errR * portion;
      arr[i + 1] += errG * portion;
      arr[i + 2] += errB * portion;
    }

    let newR = quantize(r);
    let newG = quantize(g);
    let newB = quantize(b);

    img.pixels[index(x, y)]     = newR;
    img.pixels[index(x, y) + 1] = newG;
    img.pixels[index(x, y) + 2] = newB;

    const errR = (r - newR) * spread;
    const errG = (g - newG) * spread;
    const errB = (b - newB) * spread;

    const portion = 1 / 8;
    dither(errR, errG, errB, img.pixels, index(x + 1, y), portion);
    dither(errR, errG, errB, img.pixels, index(x + 2, y), portion);
    dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x, y + 2), portion);
  }
```

## Shader (GLSL)

```glsl
precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float levels;
varying vec2 vTexCoord;

float quantize(float v, float l) {
  return floor(v * l) / l;
}

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  vec3 c = vec3(
    quantize(color.r, levels),
    quantize(color.g, levels),
    quantize(color.b, levels)
  );
  gl_FragColor = vec4(c, color.a);
}
```

---
*Submitted via Gargoyles editor*