# Atkinson

The Atkinson dithering filter is an error-diffusion algorithm developed by Apple programmer Bill Atkinson (creator of MacPaint and HyperCard) originally designed for the classic Macintosh to render grayscale images using only a 1-bit (black and white) palette.

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
      const index2 = (x2, y2) => 4 * (x2 + y2 * img.width);
      function dither(errR2, errG2, errB2, arr, i, portion2) {
        if (i < 0 || i >= arr.length) return;
        arr[i] += errR2 * portion2;
        arr[i + 1] += errG2 * portion2;
        arr[i + 2] += errB2 * portion2;
      }
      let newR = quantize(r);
      let newG = quantize(g);
      let newB = quantize(b);
      img.pixels[index2(x, y)] = newR;
      img.pixels[index2(x, y) + 1] = newG;
      img.pixels[index2(x, y) + 2] = newB;
      const errR = (r - newR) * spread;
      const errG = (g - newG) * spread;
      const errB = (b - newB) * spread;
      const portion = 1 / 8;
      dither(errR, errG, errB, img.pixels, index2(x + 1, y), portion);
      dither(errR, errG, errB, img.pixels, index2(x + 2, y), portion);
      dither(errR, errG, errB, img.pixels, index2(x - 1, y + 1), portion);
      dither(errR, errG, errB, img.pixels, index2(x, y + 1), portion);
      dither(errR, errG, errB, img.pixels, index2(x + 1, y + 1), portion);
      dither(errR, errG, errB, img.pixels, index2(x, y + 2), portion);
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