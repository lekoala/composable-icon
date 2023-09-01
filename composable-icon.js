import data from "./src/data.js";

/**
 * Wrap icon in svg
 * @param {string} svg
 * @param {string} styles
 * @returns {string}
 */
function wrap(svg, styles = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="${options.strokeWidth}" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" style="${styles}">${svg}</svg>`;
}

/**
 * Create paths based on definitions
 * @param {string} d
 * @returns {string}
 */
function path(d) {
  return d
    .split("|")
    .map((d) => {
      const isDuotone = d.includes("*");
      if (isDuotone) {
        d = d.replace("*", "");
      }
      if (options.duotone && isDuotone) {
        return `<path d="${d}"></path><path d="${d}"opacity="0.2" fill="currentColor" stroke="none"></path>`;
      }
      return `<path d="${d}"></path>`;
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
  let pos = "12,14";
  let s = 10;

  // Need specific positioning
  if (icon == "calendar") {
    pos = "12,16.5";
    s = 6;
  }
  return `<g transform="translate(${pos})"><text x="0" y="0" style="font-size:${s}px;font-weight:lighter;letter-spacing:1px;font-family:system-ui,sans-serif;" text-anchor="middle" dominant-baseline="middle">${t}</text></g>`;
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

    let svg = "";

    let icon,
      t,
      frame,
      addon,
      rotationOrAddon = null;

    [icon, frame, addon] = v.split(" ");

    // It has a built in addon
    if (icon.includes("-")) {
      [icon, rotationOrAddon] = icon.split("-");
    }

    // It has some text
    if (icon.includes("_")) {
      [icon, t] = icon.split("_");
    }

    if (icon) {
      if (data.icons[icon]) {
        svg = path(data.icons[icon]);
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
      svg += path(frameSvg);
      if (!isMonotone && (options.duotone || isDuotone)) {
        svg += duotone(frameSvg);
      }
    }

    // Text is always above addons
    if (t) {
      svg += text(t, icon);
    }

    if (addon && data.addons[addon]) {
      svg = addonMask(svg, addon);
    }

    const styles = [];
    if (rotationOrAddon) {
      if (data.addons[rotationOrAddon]) {
        svg = addonMask(svg, rotationOrAddon);
      } else {
        let rv = parseInt(rotationOrAddon);
        if (isNaN(rv)) {
          switch (rotationOrAddon) {
            case "top":
            case "t":
              rv = 0;
              break;
            case "left":
            case "l":
              rv = -90;
              break;
            case "right":
            case "r":
              rv = 90;
              break;
            case "bottom":
            case "b":
              rv = 180;
              break;
          }
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
    return ["v"];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal) {
      this.load();
    }
  }
}

customElements.define("c-i", ComposableIcon);
