# ChromaticAberration

Displaces the red and blue channels horizontally in opposite directions, leaving the green channel in place.\n\nSimulates the optical fringing produced by lenses that fail to focus all wavelengths to the same point — a common artifact in cheap optics, anamorphic lenses, and VHS footage.

## Info

**Author:** @JaimELegor
**Version:** 1.0.0
**Category:** `DISTORT`

## Parameters

| Name | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `shift` | `4` | `0` | `30` | `1` |

## Process Function

```js
(img, r, g, b, a, x, y, ...params) => {
  const [shift] = params;
  const w = img.width;
  const rIdx = 4 * (y * w + Math.min(x + shift, w - 1));  
  const bIdx = 4 * (y * w + Math.max(x - shift, 0));  
  const rr = img.pixels[rIdx];  
  const bb = img.pixels[bIdx + 2];
  return [rr, g, bb, a];
}
```


---
*Submitted via Gargoyles editor*