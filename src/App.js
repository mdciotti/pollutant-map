import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl';

import ColorMapLayer from './ColorMapLayer/ColorMapLayer.js';
import LUT from './LUT.js';
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

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWRjaW90dGkiLCJhIjoiY2l1cWdyamw5MDAxcTJ2bGFmdzJxdGFyNyJ9.2b6aTKZNlT1_DEJiJ9l3hw';
const viewport = {
    width: 512,
    height: 512,
    longitude: (west + east) / 2,
    latitude: (north + south) / 2,
    zoom: 7,
    pitch: 0,
    bearing: 0,
    interactive: true
};

export default class App extends Component {
    render() {
        const bbox = {
            minLng: east,
            maxLng: west,
            minLat: south,
            maxLat: north
        };

        const rainbow = new LUT();
        rainbow.addStop(0, '#741A14');
        rainbow.addStop(1, '#CC362C');
        rainbow.addStop(2, '#EC6C33');
        rainbow.addStop(3, '#F7BD33');
        rainbow.addStop(4, '#E9F636');
        rainbow.addStop(5, '#A6F57F');
        rainbow.addStop(6, '#7CF7DC');
        rainbow.addStop(7, '#50C0FB');
        rainbow.addStop(8, '#0072FB');
        rainbow.addStop(9, '#003EDC');
        rainbow.addStop(10, '#00248D');
        rainbow.draw();

        const MAX_OZONE = 60;
        const dataTextureArray = [
            new Float32Array(flatten(gridData['grid']).map(x => 0.999*lnorm(x, 0, MAX_OZONE))),
            new Float32Array(flatten(gridData['grid']).map(x => 0.999*lnorm(x, 0, MAX_OZONE)))
        ];

        return (
            <MapGL {...viewport} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
                <DeckGL {...viewport} layers={[
                    new ColorMapLayer({
                        id: 'color-layer',
                        bbox,
                        colorMap: rainbow.canvas,
                        time: 0,
                        dataTextureArray
                    })
                ]} />
            </MapGL>
        );
    }
}
