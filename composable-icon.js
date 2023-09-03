import data from "./src/data.js";

/**
 * Wrap icon in svg
 * @link https://stackoverflow.com/questions/18467982/are-svg-parameters-such-as-xmlns-and-version-needed
 * @param {string} svg
 * @param {string} styles
 * @returns {string}
 */
function wrap(svg, styles = "") {
  return `<svg viewBox="0 0 24 24" stroke-width="${options.strokeWidth}" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" style="${styles}">${svg}</svg>`;
}

/**
 * Create paths based on definitions
 * vector-effect="non-scaling-stroke" is required to avoid stroke changing when scaling
 * @param {string} d
 * @returns {string}
 */
function path(d) {
  return d
    .split("|")
    .map((d) => {
      // It's a circle
      if (d.indexOf('cx="') === 0) {
        return `<circle ${d} fill="currentColor" vector-effect="non-scaling-stroke" />`;
      }
      const isDuotone = d.includes("*");
      if (isDuotone) {
        d = d.replace("*", "");
      }
      const p = `<path d="${d}" vector-effect="non-scaling-stroke"></path>`;
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
  return `<path d="${d}" opacity="0.2" fill="currentColor" stroke="none"></path>`;
}

/**
 * @link https://travishorn.com/removing-parts-of-shapes-in-svg-b539a89e5649
 * @param {*} svg
 * @param {*} addon
 * @returns
 */
function addonMask(svg, addon) {
  // A circle corner
  let mask = "addonMaskBr";
  let maskSvg = `<mask id="ci-addonMaskBr">
  <path fill="white" d="M12,24"/>
  <path fill="white" d="M24,12"/>
  <path fill="white" d="M24,12V0H0V24H12v-.06A12,12,0,0,1,24,12Z"/>
</mask>`;

  largeAddon = ["star", "heart", "time", "stats"].includes(addon);
  if (largeAddon) {
    // A rounded rectangle corner
    mask = "addonMaskBrLarge";
    maskSvg = `<mask id="ci-addonMaskBrLarge">
    <path fill="white" d="M12,18c0-3.31,2.69-6,6-6h6V0H0v24h12"/>
    </mask>`;
  } else if (addon == "off") {
    const w = options.strokeWidth * 1.5;
    const fw = 24 - w;
    // This mask add some white space around the bar
    mask = "addonMaskOff";
    maskSvg = `<mask id="ci-addonMaskOff">
    <polygon fill="white" points="24,${fw} 24,0 ${w},0"/>
    <polygon fill="white" points="0,${w} 0,24 ${fw},24"/>
</mask>`;
  }
  const addonSvg = path(data.addons[addon]);
  return `<defs>${maskSvg}</defs><g style="mask: url(#ci-${mask})">${svg}</g>
${addonSvg}`;
}

/**
 * Add some text to the icon
 * @param {string} t
 * @param {string} icon
 * @returns {string}
 */
function text(t, icon) {
  // Center by default
  let pos = "12,13";
  let s = 10;

  // Need specific positioning
  const offset = data.offsets[icon];
  if (offset) {
    pos = offset.split("|")[0];
    s = offset.split("|")[1] || 6;
  }

  // This may need some finetuning...
  fw = "normal";
  // Bold small signs
  if (["+", "-", ":", "/"].includes(t)) {
    fw = "bold";
  }
  sw = options.strokeWidth * 0.5;
  return `<g transform="translate(${pos})"><text x="0" y="0" style="font-size:${s}px;font-weight:${fw};font-family:system-ui,sans-serif;" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke-width="${sw}">${t}</text></g>`;
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

    let svg = "";

    let icon,
      frame,
      addon,
      rotationOrAddon = null;

    // syntax:
    // <c-i v="{icon}(_{text})(-{addonOrRotation})( {frame})( {addon})" t="{text}"></c-i>

    // First, split by space
    [icon, frame, addon] = v.split(" ");

    // It has a built in addon or rotation
    if (icon.includes("-")) {
      [icon, rotationOrAddon] = icon.split("-");
    }

    // It has some text
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

    if (icon) {
      icon = data.aliases[icon] || icon;
      const dataIcon = data.icons[icon];
      if (dataIcon) {
        svg = path(dataIcon);
      } else {
        t = icon; // use a text
      }
    }

    if (frame) {
      const isDuotone = frame.includes("-duo");
      if (isDuotone) {
        frame = frame.replace("-duo", "");
      }
      const isMonotone = frame.includes("-mono");
      if (isMonotone) {
        frame = frame.replace("-mono", "");
      }
      const frameSvg = data.frames[frame];
      // Scales icons that do not fit will
      const scaled = ["alert"];
      if (!scaled.includes(icon)) {
        svg = `<g transform="scale(0.6)" transform-origin="50% 50%">${svg}</g>`;
      }
      svg += path(frameSvg);
      if (!isMonotone && (options.duotone || isDuotone)) {
        svg += duotone(frameSvg);
      }
    }

    // Text is always above addons
    if (t) {
      svg += text(t, icon);
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
        styles.push(`transform: rotate(${rv}deg)`);
      }
    }

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
