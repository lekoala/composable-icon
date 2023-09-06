# composable-icon

[![NPM](https://nodei.co/npm/composable-icon.png?mini=true)](https://nodei.co/npm/composable-icon/)
[![Downloads](https://img.shields.io/npm/dt/composable-icon.svg)](https://www.npmjs.com/package/composable-icon)

> Compose svg icons on the fly

- Add addons to your icons dynamically
- Write any text on it
- Rotate, even with arbitrary angles
- Fit anything in multiple frames (circles, squares, triangles...)
- Duotone
- The most compact icon libary ever created

! WIP ! Icons are still being added and tested, this is a proof of concept only

## Quickstart

Write icons with the following syntax:

```html
 <c-i v="{icon}(_{text})(-{addonOrRotation})( {frame})( {addon})"></c-i>
```

Addons can be placed in two places: after the icon name, or at the end. This allows skipping frame if needed.

Include base styles as well to avoid layout shifts.

## Demo

See `demo.html` or the following pen https://codepen.io/lekoalabe/pen/RwEREoG

## Credits

Base icons styles: https://icons.getbootstrap.com/
Inspiration for addons: https://tabler-icons.io/
Base list of icons: https://www.s-ings.com/projects/microns-icon-font/
Duotone inspiration: https://phosphoricons.com/