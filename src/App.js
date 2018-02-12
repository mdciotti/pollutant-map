import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl';

import ColorMapLayer from './ColorMapLayer/ColorMapLayer.js';
// import gridData from './gridData_1362117600.js';
// data: 124x154
const west = -95.91;
const east = -94.67;
const north = 30.47;
const south = 28.93;


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

        return (
            <MapGL {...viewport} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
                <DeckGL {...viewport} layers={[
                    new ColorMapLayer({id: 'color-layer', bbox})
                ]} />
            </MapGL>
        );
    }
}
