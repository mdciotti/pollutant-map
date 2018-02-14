// Linear normalization
function lnorm(val, min, max) {
    return (val - min) / (max - min);
}

// Function to linearly interpolate between a0 and a1
// Weight w should be in the range [0.0, 1.0]
function lerp(a0, a1, w) {
    return (1.0 - w)*a0 + w*a1;
}

function parseHexColor(colorStr) {
    return {
        r: parseInt(colorStr.substr(1, 2), 16),
        g: parseInt(colorStr.substr(3, 2), 16),
        b: parseInt(colorStr.substr(5, 2), 16)
    };
}

function mix(color1, color2, k) {
    return {
        r: lerp(color1.r, color2.r, k),
        g: lerp(color1.g, color2.g, k),
        b: lerp(color1.b, color2.b, k)
    };
}

function pad(str, ch, width) {
    while (str.length < width) str = ch + str;
    return str;
}

function toHex(color) {
    let r = pad(Math.floor(color.r).toString(16), '0', 2);
    let g = pad(Math.floor(color.g).toString(16), '0', 2);
    let b = pad(Math.floor(color.b).toString(16), '0', 2);
    return `#${r}${g}${b}`;
}

// Color lookup table
export default class LUT {
    constructor() {
        this.colors = []
        this.maxValue = null
        this.minValue = null
        this.customDraw = false

        this.canvas = document.createElement('canvas');
        this.width = this.canvas.width = 32;
        this.height = this.canvas.height = 256;
        // document.body.appendChild(this.canvas);
    }

    addStop(value, color) {
        this.maxValue = Math.max(value, this.maxValue);
        this.minValue = Math.min(value, this.minValue);
        this.colors.push({ value: value, color: color });
        this.colors.sort((a, b) => a.value - b.value);
    }

    // TODO: fix me?
    getColor(value) {
        value = lerp(this.minValue, this.maxValue, value);
        if (value > this.maxValue) return this.colors[this.colors.length - 1].color;
        if (value < this.minValue) return this.colors[0].color;

        let i = 1;
        // console.log(this.colors[1]);
        for (i = 1; i < this.colors.length; i++) {
            // console.log(i, this.colors[i].value, value);
            if (this.colors[i].value >= value) break;
        }
        // blend color i and i-1
        let k = lnorm(value, this.colors[i-1].value, this.colors[i].value);
        let color = mix(parseHexColor(this.colors[i-1].color), parseHexColor(this.colors[i].color), k);
        return toHex(color);
    }

    draw() {
        let ctx = this.canvas.getContext('2d');
        let grd = ctx.createLinearGradient(0, 0, 0, this.height);
        for (let stop of this.colors) {
            let k = lnorm(stop.value, this.minValue, this.maxValue);
            grd.addColorStop(k, stop.color);
        }
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    drawDiscrete(n_steps) {
        let ctx = this.canvas.getContext('2d');
        let start = 0;
        let end = 0;
        // let n = this.colors.length;
        let step = this.height / n_steps;
        // for (let stop of this.colors) {
        for (let i = 0; i < n_steps; i++) {
            // let stop = this.stops[n];
            // let k = lnorm(stop.value, this.minValue, this.maxValue);
            let color = this.getColor((i+0.5) / n_steps);
            // let r = Math.floor(256 * ((i+0.5) / n_steps));
            // let color = `rgb(${r},${r},${r})`;
            end = start + step;
            ctx.fillStyle = color;
            ctx.fillRect(0, Math.floor(start), this.width, Math.floor(end));
            start = end;
        }
    }

    drawCustom(n_steps, draw_fn) {
        let ctx = this.canvas.getContext('2d');
        draw_fn(ctx, n_steps);
    }
}
