
import { Layer } from 'deck.gl';
import { GL, Model, Geometry, loadTextures, Texture2D } from 'luma.gl';

import fragment from './colormap-fragment.glsl';
import vertex from './colormap-vertex.glsl';

export default class ColorMapLayer extends Layer {
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
        const colorMapTexture = this.createTexture(gl, {
            format: gl.RGBA,
            type: gl.UINT8,
            dataFormat: gl.RGBA
        });
        
        this.setState({
            model,
            textureFrom,
            textureTo,
            width,
            height,
            colorMapTexture
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
        const {model, textureFrom, textureTo, width, height, delta, timeInterval, colorMapTexture} = this.state;
        const {dataTextureArray, interpolationMode, colorMap, opacity} = this.props;

        textureFrom.setImageData({
            pixels: dataTextureArray[timeInterval | 0],
            width,
            height,
            format: gl.R32F,
            type: gl.FLOAT,
            dataFormat: gl.RED
        });

        textureTo.setImageData({
            pixels: dataTextureArray[(timeInterval + 1) | 0],
            width,
            height,
            format: gl.R32F,
            type: gl.FLOAT,
            dataFormat: gl.RED
        });

        colorMapTexture.setImageData({
            pixels: colorMap.canvas,
            format: gl.RGBA,
            type: gl.UNSIGNED_BYTE,
            dataFormat: gl.RGBA
        });

        const parameters = {
            clearDepth: 1.0,
            depthTest: true,
            depthFunc: gl.LEQUAL
        };

        uniforms['uData0Sampler'] = textureFrom;
        uniforms['uData1Sampler'] = textureTo;
        uniforms['uColorScaleSampler'] = colorMapTexture;
        uniforms['k_noise'] = 0.035;
        uniforms['k_alpha'] = 0.5;
        uniforms['k_opacity'] = opacity;
        uniforms['frame'] = delta;
        uniforms['interpolationMode'] = interpolationMode;

        model.draw({uniforms, parameters});
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    getModel({gl, bbox}) {
        const vertices = new Float32Array([
            bbox.minLng, bbox.minLat, 0.0,
            bbox.minLng, bbox.maxLat, 0.0,
            bbox.maxLng, bbox.maxLat, 0.0,
            bbox.maxLng, bbox.minLat, 0.0
        ]);

        const texCoords = new Float32Array([
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0
        ]);

        const geometry = new Geometry({
            id: this.props.id,
            drawMode: GL.TRIANGLE_FAN,
            vertexCount: 4,
            attributes: {
                aVertexPosition: {size: 3, type: gl.FLOAT, value: vertices},
                aTextureCoord: {size: 2, type: gl.FLOAT, value: texCoords}
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
            pixelStore: {[gl.UNPACK_FLIP_Y_WEBGL]: false}
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
    time: 0,
    opacity: 0.9,
    interpolationMode: 0,
    colorMap: null
};
