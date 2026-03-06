# Gaussian

Smooths the image by convolving each pixel with a weighted Gaussian kernel, reducing noise and detail.

Each output pixel is a weighted average of its neighbors, where weights follow a bell-curve distribution
centered on the pixel itself closer neighbors contribute more than distant ones.
Larger radius values produce stronger blur at the cost of processing time.

## Info

**Author:** @JaimELegor
**Version:** 1.0.0
**Category:** `BLUR`

## Parameters

| Name | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `radius` | `2` | `0` | `10` | `0.5` |

## Process Function

```js
(img, r, g, b, a, x, y, value) => {
    const index = (x, y) => 4 * (x + y * img.width);
    const w = img.width;
    const h = img.height;
    const rad = Math.max(1, Math.round(value));
    let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;

    for (let oy = -rad; oy <= rad; oy++) {
      for (let ox = -rad; ox <= rad; ox++) {
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const i = index(nx, ny);
        rSum += img.pixels[i];
        gSum += img.pixels[i + 1];
        bSum += img.pixels[i + 2];
        aSum += img.pixels[i + 3];
        count++;
      }
    }

    img.pixels[index(x, y)]     = rSum / count;
    img.pixels[index(x, y) + 1] = gSum / count;
    img.pixels[index(x, y) + 2] = bSum / count;
    img.pixels[index(x, y) + 3] = aSum / count;
  }
```

## Shader (GLSL)

```glsl
precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float radius;
varying vec2 vTexCoord;

void main() {
  vec2 texel = 1.0 / resolution;
  vec3 color = vec3(0.0);
  float count = 0.0;

  for (float y = -10.0; y <= 10.0; y++) {
    for (float x = -10.0; x <= 10.0; x++) {
      if (abs(x) > radius || abs(y) > radius) continue;
      color += texture2D(tex, vTexCoord + vec2(x, y) * texel).rgb;
      count += 1.0;
    }
  }

  gl_FragColor = vec4(color / count, texture2D(tex, vTexCoord).a);
}
```

---
*Submitted via Gargoyles editor*