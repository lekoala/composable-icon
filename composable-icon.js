import data from "./src/data.js";

const ICON_SIZE = 16;
const FILL_CURR = 'fill="currentColor"';

/**
 * Wrap icon in svg
 * @link https://stackoverflow.com/questions/18467982/are-svg-parameters-such-as-xmlns-and-version-needed
 * @param {string} svg
 * @param {string} styles
 * @returns {string}
 */
function wrap(svg, styles = "") {
  return `<svg viewBox="0 0 16 16" ${FILL_CURR} style="${styles}">${svg}</svg>`;
}

/**
 * Create paths based on definitions
 * @param {string} d
 * @param {string} attrs
 * @returns {string}
 */
function path(d, attrs = "") {
  // let s = 'vector-effect="non-scaling-stroke"';
  let s = "";
  if (attrs) {
    s += " " + attrs;
  }
  return d
    .split("|")
    .map((d) => {
      // It's a shape
      if (d.includes("cx")) {
        return `<circle ${d} ${s} />`;
      }
      const isDuotone = d.includes("*");
      if (isDuotone) {
        d = d.replace("*", "");
      }
      const p = `<path d="${d}" ${s} />`;
      if (options.duotone && isDuotone) {
        return `${p}${duotone(d)}`;
      }
      return p;
    })
    .join("");
}

/**
 * Add a new path with opacity 0.2 and no stroke
 * @param {string} d
 * @returns {string}
 */
function duotone(d) {
  return `<path d="${d}" opacity="0.2" fill="currentColor"></path>`;
}

/**
 * Substract icon from path
 * @param {string} shapeSvg
 * @param {string} svg
 * @param {string} icon
 * @param {Boolean} duotone
 * @returns {string}
 */
function fill(shapePath, svg, icon, duotone = false) {
  let name = `ci-fill-${icon}`;

  // Black => to remove, white => to keep
  if (duotone) {
    name += "-duo";
    maskSvg = `<mask id="${name}">
    <rect x="0" y="0" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="white" stroke-width="0" opacity="0.7" />
    <rect x="0" y="0" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="none" stroke="white" stroke-width="2" />
    ${svg}
  </mask>`;
  } else {
    maskSvg = `<mask id="${name}">
    <rect x="0" y="0" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="white" stroke-width="0" />
    ${svg}
  </mask>`;
  }
  const shapeSvg = path(shapePath);
  return `<defs>${maskSvg}</defs><g style="mask: url(#${name})">${shapeSvg}</g>`;
}

/**
 * @link https://travishorn.com/removing-parts-of-shapes-in-svg-b539a89e5649
 * @param {*} svg
 * @param {*} addon
 * @returns
 */
function addonMask(svg, addon) {
  let maskSvg;
  const addonSvg = path(data.addons[addon]);
  if (addon == "off") {
    const w = 2;
    const fw = ICON_SIZE - w;
    // This mask add some white space around the bar
    maskSvg = `<mask id="ci-mask-${addon}">
    <polygon fill="white" points="${ICON_SIZE},${fw} ${ICON_SIZE},0 ${w},0"/>
    <polygon fill="white" points="0,${w} 0,${ICON_SIZE} ${fw},${ICON_SIZE}"/>
</mask>`;
  } else {
    // Black => to remove, white => to keep
    maskSvg = `<mask id="ci-mask-${addon}">
    <rect x="0" y="0" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="white"/>
    <rect width="10" height="10" x="7.5" y="7.5" rx="4" fill="black" />
  </mask>`;
  }
  return `<defs>${maskSvg}</defs><g style="mask: url(#ci-mask-${addon})">${svg}</g>
${addonSvg}`;
}

/**
 * Add some text to the icon
 * @param {string} t
 * @returns {string}
 */
function text(t, bottom = false) {
  const x = ICON_SIZE / 2;
  const y = bottom ? ICON_SIZE - 2 : ICON_SIZE / 2 + 1;
  const size = t.length >= 3 || bottom ? 6 : t.length == 2 ? 8 : 10;
  const s = `font-size:${size}px;font-weight:bold;font-family:system-ui,sans-serif;`;
  return `<text x="${x}" y="${y}" style="${s}" text-anchor="middle" dominant-baseline="middle">${t}</text>`;
}

const options = {
  duotone: false,
  strokeWidth: 1,
};

class ComposableIcon extends HTMLElement {
  static configure(opts) {
    Object.assign(options, opts);
  }

  connectedCallback() {
    this.load();
  }

  load() {
    let v = this.getAttribute("v");
    let t = this.getAttribute("t");
    let size = this.getAttribute("size");
    if (size) {
      this.style.setProperty("--ci-size", `${size}px`);
    }

    let svg = "";

    let icon,
      shape,
      addon,
      rotationOrAddon = null;

    // syntax:
    // <c-i v="{icon}(_{text})(-{addonOrRotation})( {shape_{text}})( {addon})" t="{text}"></c-i>

    // First, split by space
    [icon, shape, addon] = v.split(" ");

    const [iconName, ...rest] = icon.split(/-|_/);

    // Maybe we skipped the icon?
    if (icon && data.shapes[iconName]) {
      addon = shape;
      shape = icon;
      icon = "";
    }

    // It has a built in addon or rotation
    let iconFill = false;
    if (icon.includes("-")) {
      [icon, ...rotationOrAddon] = icon.split("-");
      iconFill = rotationOrAddon.includes("fill");
      rotationOrAddon = rotationOrAddon.filter((item) => item !== "fill");
      rotationOrAddon = rotationOrAddon[0] || null;
    }

    // It has some text or simply use _ as placeholder
    if (icon.includes("_")) {
      const textParts = icon.split("_");
      if (textParts[1] != "") {
        t = textParts[1];
        icon = textParts[0];
      } else {
        t = textParts[0] || t;
        icon = null;
      }
    }
    if (shape && shape.includes("_")) {
      [shape, t] = shape.split("_");
    }

    if (icon) {
      icon = data.aliases[icon] || icon;
      if (data.icons[icon]) {
        const dataIcon = data.icons[icon][iconFill ? 1 : 0];
        svg = path(dataIcon);
      } else {
        t = icon; // use a text
      }
    }

    // Text is always above addons

    if (t) {
      const textBottom = shape && shape.includes("file") && t.length > 1;
      svg += text(t, textBottom);
      if (textBottom) {
        shape = "fileCut";
      }
    }

    if (shape) {
      const [shapeName, ...shapeOpt] = shape.split("-");
      const shapeDuo = shapeOpt.includes("duo");
      const shapeFill = shapeOpt.includes("fill");
      if (!data.shapes[shapeName]) {
        console.error(`Undefined shape ${shapeName}`);
        return;
      }
      const shapePath = data.shapes[shapeName][shapeFill ? 1 : 0];
      const [shapeOffset, scalePercentage] = (data.offsets[shapeName] || "").split("|");
      const defaultScale = data.scales[icon] || 1;
      if (shapeOffset || icon) {
        svg = `<g transform="translate(${shapeOffset || "0,0"}) scale(${
          scalePercentage || defaultScale
        })" transform-origin="50% 50%">${svg}</g>`;
      }

      if (shapeFill) {
        // For fill, let's inverse the icon by using it as a mask
        // We need a unique name for the mask that depends on the icon
        svg = fill(shapePath, svg, shapeName + icon, shapeDuo);
      } else {
        // Add the shape
        // We need a unique name for the mask that depends on the shape
        svg += path(shapePath);
        if (shapeDuo && data.shapes[shapeName][1]) {
          svg += path(data.shapes[shapeName][1], `opacity="0.2"`);
        }
      }
    }

    // Do we have an addon as a third arg?
    if (addon) {
      addon = data.aliases[addon] || addon;
      if (data.addons[addon]) {
        svg = addonMask(svg, addon);
      }
    }

    // Rotation or addon?
    const styles = [];
    if (rotationOrAddon) {
      rotationOrAddon = data.aliases[rotationOrAddon] || rotationOrAddon;
      if (data.addons[rotationOrAddon]) {
        svg = addonMask(svg, rotationOrAddon);
      } else {
        let rv = parseInt(rotationOrAddon);
        if (isNaN(rv)) {
          const map = {
            t: 0,
            tr: 45,
            tl: -45,
            l: -90,
            r: 90,
            b: 180,
            br: 135,
            bl: -135,
          };
          rv = map[rotationOrAddon] || 0;
        }
        styles.push(`transform: rotate(${rv}deg); transform-origin: center`);
      }
    }

    // We need to compute the stroke width since we prevent it from scaling
    this.innerHTML = wrap(svg, styles.join(";"));
  }

  static getData() {
    return data;
  }

  static get observedAttributes() {
    return ["v", "t"];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal) {
      this.load();
    }
  }
}

customElements.define("c-i", ComposableIcon);
