import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import logo from './logo.svg';
// import './App.css';
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl';

import ColorMapLayer from './ColorMapLayer/ColorMapLayer.js';
import LUT from './LUT.js';
import cmaps from './cmaps';
import gridData from './gridData_1362117600.js';
// data: 124x154
const west = -95.91;
const east = -94.67;
const north = 30.47;
const south = 28.93;

// Linear normalization
function lnorm(val, min, max) {
    return (val - min) / (max - min);
}

// Flatten a 2D array into a 1D array
function flatten(arr) {
    return arr.reduce((prev, curr) => {
        return prev.concat(curr);
    }, []);
}

// Interleaves two arrays, i.e.
// interleave([a,b,c],[x,y,z])
// >> [a, x, b, y, c, z]
function interleave(a, b) {
    if (a.length !== b.length) return null;
    let result = [];
    let i = 0, j = 0;
    while (i < a.length || j < b.length) {
        result[i+j] = a[i++];
        result[i+j] = b[j++];
    }
    return result;
}


function gauss(xSq, variance) {
    return Math.exp(-0.5*xSq/variance);
}


export default class App extends Component {
    constructor(props) {
        super(props);
        this.$parent = null;
        this._resizeListener = this.resize.bind(this);
        this.state = {
            mapboxApiAccessToken: 'pk.eyJ1IjoibWRjaW90dGkiLCJhIjoiY2l1cWdyamw5MDAxcTJ2bGFmdzJxdGFyNyJ9.2b6aTKZNlT1_DEJiJ9l3hw',
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                longitude: (west + east) / 2,
                latitude: (north + south) / 2,
                zoom: 7,
                pitch: 0,
                bearing: 0,
                interactive: true
            },
            time: 0
        };

        this.noDataImage = new Image(128, 128);
        this.noDataImage.src = 'noDataImage.png';

        // TODO: set this from the region data
        this.bbox = {
            minLng: gridData['gridExtent']['longmin'],
            maxLng: gridData['gridExtent']['longmax'],
            minLat: gridData['gridExtent']['latmin'],
            maxLat: gridData['gridExtent']['latmax']
        };

        // generate sample viability data
        const numGridRows = gridData['grid'].length;
        const numGridCols = gridData['grid'][0].length;
        this.sampleViability = [];
        const d0 = Math.hypot(numGridRows / 2, numGridCols / 2);
        for (let r = 0; r < numGridRows; r++) {
            for (let c = 0; c < numGridCols; c++) {
                const dr = r - numGridRows / 2;
                const dc = c - numGridCols / 2;
                const dSq = dr*dr + dc*dc;
                /* this.sampleViability[r * numGridCols + c] = gauss(dSq, 60*60);*/
                this.sampleViability[r * numGridCols + c] = 1;
            }
        }

        // create a sample hole in viability (BAD DATA)
        for (let r = 10; r < 20; r++) {
            for (let c = 10; c < 20; c++) {
                this.sampleViability[r * numGridCols + c] = 0.0;
            }
        }

        this.framesPerSecond = 10;
        this.NUM_FRAMES_PER_DAY = 288; //24*60*60/300;
        this.dataTextureArray = [];
        this.setDate(1362117600);
    }

    componentDidMount() {
        this.$parent = ReactDOM.findDOMNode(this).parentElement;
        window.addEventListener('resize', this._resizeListener);
        this.resize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._resizeListener);
    }

    startAnimation() {
        this.animation = requestAnimationFrame(this._animate.bind(this));
    }

    _animate(t) {
        let dt = (t - this.last_draw_t) / 1000;
        this.last_draw_t = t;
        this.animation = requestAnimationFrame(this._animate.bind(this));
        let time = this.state.time + dt * this.framesPerSecond;
        if (time > this.NUM_FRAMES_PER_DAY) {
            time -= this.NUM_FRAMES_PER_DAY;
        }
        this.setState({ time });
    }

    /**
     * Given a unix timestamp, create an AJAX request for the data at that timestamp
     * and return a promise.
     * @param timestamp the unix timestamp of the data to fetch.
     * @return a promise representing the request.
     */
    loadData(timestamp, index) {
        const MAX_OZONE = 60;
        let url = `data/gridData_${timestamp}.json`;
        return window.fetch(url, { method: 'GET' }).then((response) => {
            if (response.ok) {
                return response.json().then((json) => {
                    // console.log(`Loaded data set for ${timestamp}`);
                    const data = flatten(json['grid']).map(x => 0.999*lnorm(x, 0, MAX_OZONE));
                    this.dataTextureArray[index] = new Float32Array(interleave(data, this.sampleViability));
                }).catch((err) => {
                    console.error(`Error parsing JSON for ${timestamp}: `, err);
                });
            } else {
                console.warn(`Failed to load data for ${timestamp}`, response);
            }
        });
    }

    setDate(unix_time) {
        console.log(`Setting date to`, new Date(unix_time*1000));
        // TODO: load day's worth of data asynchronously
        // (eventually will be selected from the client DB)
        this.dataTextureArray = [];
        const time_start = unix_time; // 1362117600;
        //const time_end = 1362203700;
        const time_interval = 300;
        // load_data(time_start);
        
        let frames = [];
        for (let i = 0; i < this.NUM_FRAMES_PER_DAY; i++) {
            frames[i] = time_start + i * time_interval;
        }

        Promise.all(frames.map(this.loadData.bind(this))).then(() => {
            console.log('Loaded all data sets');
            this.last_draw_t = performance.now();
            this.startAnimation();
        });
    }

    resize() {
        this.setState({
            viewport: Object.assign(this.state.viewport, {
                width: this.$parent.offsetWidth,
                height: this.$parent.offsetHeight
            })
        });
    }

    render() {

        // const rainbow = new LUT();
        // rainbow.addStop(0, '#741A14');
        // rainbow.addStop(1, '#CC362C');
        // rainbow.addStop(2, '#EC6C33');
        // rainbow.addStop(3, '#F7BD33');
        // rainbow.addStop(4, '#E9F636');
        // rainbow.addStop(5, '#A6F57F');
        // rainbow.addStop(6, '#7CF7DC');
        // rainbow.addStop(7, '#50C0FB');
        // rainbow.addStop(8, '#0072FB');
        // rainbow.addStop(9, '#003EDC');
        // rainbow.addStop(10, '#00248D');
        // rainbow.draw();

        return (
            <MapGL
                {...this.state.viewport}
                mapboxApiAccessToken={this.state.mapboxApiAccessToken}
                onViewportChange={(viewport) => this.setState({viewport})}
            >
                <DeckGL {...this.state.viewport} layers={[
                    new ColorMapLayer({
                        id: 'color-layer',
                        bbox: this.bbox,
                        colorMap: cmaps.inferno,
                        time: this.state.time,
                        opacity: 0.9,
                        dataTextureArray: this.dataTextureArray,
                        noDataImage: this.noDataImage
                    })
                ]} />
            </MapGL>
        );
    }
}
