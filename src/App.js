// APP

import React, {Component} from 'react';
// import logo from './logo.svg';
// import './App.css';
import MapGL from 'react-map-gl';
import DeckGL, {LineLayer} from 'deck.gl';

// import ColorMapLayer from './colormaplayer.js';

const west = -96.652917;
const east = -94.291975;
const north = 30.997559;
const south = 28.845403;
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWRjaW90dGkiLCJhIjoiY2l1cWdyamw5MDAxcTJ2bGFmdzJxdGFyNyJ9.2b6aTKZNlT1_DEJiJ9l3hw';
const viewport = {
   width: 512,
   height: 512,
   longitude: (west + east) / 2,
   latitude: (north + south) / 2,
   zoom: 7,
   pitch: 0,
   bearing: 0
}

// const data = {
//   width: 32,
//   height: 32,
//   values: []
// }

const data = [
  {sourcePosition: [west, north], targetPosition: [east, south]}
];


export default class App extends Component {
    render() {
        return (
            <MapGL {...viewport} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
                <DeckGL {...viewport} layers={[
                    new LineLayer({id: 'line-layer', data})
                ]} />
            </MapGL>
        );
    }
}

// COLOR MAP LAYER
// import {GL, Model, Geometry} from 'luma.gl';

// export default class ColorMapLayer extends Layer {

//     initializeState() {
//         const {gl} = this.context;
//         this.setState({
//             model: this._getModel(gl)
//         });
//     }

//     _getModel(gl) {
//         return new Model(gl, {
//             vs: ``,
//             fs: ``,
//             modules: ['projection']
//         });
//     }

// }


