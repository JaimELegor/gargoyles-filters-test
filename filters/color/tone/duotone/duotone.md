# Duotone

Maps pixel luminance to a gradient between two colors, replacing the full tonal range with a two-color palette.

Each pixel's brightness is computed from its RGB channels using standard luminance weights,
then used to interpolate between a shadow color and a highlight color 
producing the high-contrast, stylized look common in screen printing and poster design.

## Info

**Author:** @JaimELegor
**Version:** 1.0.0
**Category:** `COLOR/Tone`

## Parameters

| Name | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `shadowr` | `0` | `0` | `255` | `1` |
| `shadowg` | `0` | `0` | `255` | `1` |
| `shadowb` | `0` | `0` | `255` | `1` |
| `highlightr` | `255` | `0` | `255` | `1` |
| `highlightg` | `255` | `0` | `255` | `1` |
| `highlightb` | `255` | `0` | `255` | `1` |

## Process Function

```js
(img, r, g, b, a, x, y, ...params) => {
    const [shadowr, shadowg, shadowb, highlightr, highlightg, highlightb] = params;
    const i = 4 * (x + y * img.width);
    const gray = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const mix = (c1, c2, t) => c1 * (1 - t) + c2 * t;
    img.pixels[i]     = mix(shadowr, highlightr, gray);
    img.pixels[i + 1] = mix(shadowg, highlightg, gray);
    img.pixels[i + 2] = mix(shadowb, highlightb, gray);
  }
```

## Shader (GLSL)

```glsl
precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform vec3 shadowColor;
uniform vec3 highlightColor;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float gray = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 c = mix(shadowColor, highlightColor, gray);
  gl_FragColor = vec4(c, color.a);
}
```

---
*Submitted via Gargoyles editor*