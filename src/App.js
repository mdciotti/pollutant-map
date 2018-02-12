// APP
import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';
import MapGL from 'react-map-gl';
import DeckGL, { Layer } from 'deck.gl';
import { GL, Model, Geometry, loadTextures, Texture2D } from 'luma.gl';
// import glslify from 'glslify';

// import colormap_fs from './ColorMapLayer/colormap-fragment.glsl';
// import colormap_vs from './ColorMapLayer/colormap-vertex.glsl';

// import ColorMapLayer from './colormaplayer.js';
import gridData from './gridData_1362117600.js';
// data: 124x154
const west = -95.91;
const east = -94.67;
const north = 30.47;
const south = 28.93;

const vertex = `
#define SHADER_NAME solid-polygon-layer-vertex-shader
attribute vec3 vertices;
void main(void) {
    vec4 position_worldspace = vec4(project_position(vertices), 1.0);
    gl_Position = project_to_clipspace(position_worldspace);
}`;

const fragment = `
#define SHADER_NAME solid-polygon-layer-fragment-shader
#ifdef GL_ES
precision highp float;
#endif
void main(void) {
    gl_FragColor = vec4(vec3(0.0), 1.0);
}
`;

class ColorMapLayer extends Layer {
    initializeState() {
        const {gl} = this.context;
        const {dataTextureSize, bbox} = this.props;

        // TODO: retrieve data
        // loadTextures(gl, {
        //     urls: [ELEVATION_DATA_IMAGE],
        //     parameters: {
        //         parameters: {
        //             [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
        //             [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
        //             [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        //             [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
        //         }
        //     }
        // }).then(textures => {
        //     this.setState({elevationTexture: textures[0]});
        // });

        const model = this.getModel({gl, bbox});
        const {width, height} = dataTextureSize;
        const textureFrom = this.createTexture(gl, {});
        const textureTo = this.createTexture(gl, {});
        
        this.setState({
            model,
            textureFrom,
            textureTo,
            width,
            height
        });
    }

    updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
        this.updateTime();
    }

    updateTime() {
        const {time} = this.props;
        const timeInterval = Math.floor(time);
        this.setState({
            timeInterval,
            delta: time - timeInterval
        });
    }

    draw({uniforms}) {
        // if (!data_loaded) return;
        const {gl} = this.context;
        const {model, textureFrom, textureTo, width, height, delta, timeInterval} = this.state;
        const {bbox, dataBounds, dataTextureArray} = this.props;

        textureFrom.setImageData({
            pixels: dataTextureArray[timeInterval | 0],
            width,
            height,
            format: gl.RGBA32F,
            type: gl.FLOAT,
            dataFormat: gl.RGBA
        });

        textureTo.setImageData({
            pixels: dataTextureArray[(timeInterval + 1) | 0],
            width,
            height,
            format: gl.RGBA32F,
            type: gl.FLOAT,
            dataFormat: gl.RGBA
        });

        const parameters = {
            clearDepth: 1.0,
            depthTest: true,
            depthFunc: gl.LEQUAL
        };

        uniforms['bbox'] = [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat];
        uniforms['uData0Sampler'] = textureFrom;
        uniforms['uData1Sampler'] = textureTo;
        uniforms['uColorScaleSampler'] = null;
        uniforms['k_noise'] = 0.035;
        uniforms['k_alpha'] = 0.5;
        uniforms['frame'] = delta;

        model.draw({uniforms, parameters});
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    getModel({gl, bbox}) {
        // const positions = this.calculatePositions({bbox});
        // const vertices = new Float32Array([0.3, 0, 250, 0, 0.1, 0, 1, 0, 0, 0, -0.1, 0, 0, 0.1, 0]);
        // const normals = new Float32Array([0, 0, 1, 0, 0.1, 0, 1, 0, 0, 0, -0.1, 0, 0, 0.1, 0]);

        const vertices = new Float32Array([
            west, south, 0.0,
            west, north, 0.0,
            east, north, 0.0,
            east, south, 0.0
        ]);

        const geometry = new Geometry({
            id: this.props.id,
            drawMode: GL.TRIANGLE_FAN,
            attributes: {
                vertices: {size: 3, type: gl.FLOAT, value: vertices}
            }
        });

        return new Model(gl, {
            vs: vertex,
            fs: fragment,
            modules: [],
            isIndexed: false,
            isInstanced: false,
            geometry
        });
    }

    old_getModel(gl) {
        // vertices are in [lon, lat, alt] coordinate format
        const mesh = {
            indices: [
                0, 1, 2,
                3, 2, 1
            ],
            vertices: [
                west, south, 0.0,
                west, north, 0.0,
                east, south, 0.0,
                east, north, 0.0
            ],
            // vertices: [
            //     -1.0, -1.0, 0.0,
            //     -1.0, 1.0, 0.0,
            //     1.0, -1.0, 0.0,
            //     1.0, 1.0, 0.0
            // ],
            vertexNormals: [
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0
            ],
            colors: [
                0.0, 0.0, 0.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                1.0, 1.0, 0.0, 1.0,
                1.0, 1.0, 1.0, 1.0
            ],
            textures: [
                0.0, 0.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 1.0
            ]
        };

        return new Model(gl, {
            id: this.props.id,
            geometry: new Geometry({
                id: this.props.id,
                drawMode: GL.TRIANGLES,
                // attributes: {
                //     indices: new Uint16Array(mesh.indices),
                //     positions: new Float32Array(mesh.vertices),
                //     normals: new Float32Array(mesh.vertexNormals),
                //     texCoords: new Float32Array(mesh.textures),
                //     colors: new Float32Array(mesh.colors)
                // }
            }),
            // uniforms: {},
            vs: vertex,
            fs: fragment,
            modules: ['project'],
            vertexCount: 0,
            isIndexed: true
        });
        // return new Plane(gl, {
        //     type: 'x,y',
        //     xlen: 10,
        //     ylen: 10,
        //     nx: 1,
        //     ny: 1,
        //     offset: 0,
        //     colors: [1, 1, 1, 1]
        // });
    }

    createTexture(gl, opt) {
        const textureOptions = Object.assign({
            format: gl.RGBA32F,
            dataFormat: gl.RGBA,
            type: gl.FLOAT,
            parameters: {
                [gl.TEXTURE_MAG_FILTER]: gl.NEAREST,
                [gl.TEXTURE_MIN_FILTER]: gl.NEAREST,
                [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
                [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
            },
            pixelStore: {[gl.UNPACK_FLIP_Y_WEBGL]: true}
        }, opt);

        return new Texture2D(gl, textureOptions);
    }
}

ColorMapLayer.layerName = 'ColorMapLayer';
ColorMapLayer.defaultProps = {
    bbox: null,
    dataBounds: null,
    dataTextureArray: [],
    dataTextureSize: { width: 124, height: 154 },
    time: 0
};

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

const testLineData = [
  {sourcePosition: [west, north], targetPosition: [east, south]}
];


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
                    // new LineLayer({id: 'line-layer', testLineData})
                    new ColorMapLayer({id: 'color-layer', bbox})
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


