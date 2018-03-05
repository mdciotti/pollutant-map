
import { Layer } from 'deck.gl';
import { GL, Model, Geometry, loadTextures, Texture2D } from 'luma.gl';

import fragment from './colormap-fragment.glsl';
import vertex from './colormap-vertex.glsl';

export default class ColorMapLayer extends Layer {
    initializeState() {
        const {gl} = this.context;
        const {dataTextureSize, bbox, colorMap, noDataImage} = this.props;

        const model = this.getModel({gl, bbox});
        const {width, height} = dataTextureSize;
        const textureFrom = this.createTexture(gl, {});
        const textureTo = this.createTexture(gl, {});
        const colorMapTexture = this.createTexture(gl, {
            format: gl.RGB32F,
            type: gl.FLOAT,
            dataFormat: gl.RGB
        });
        const noDataTexture = this.createTexture(gl, {
            format: gl.RGB,
            type: gl.UNSIGNED_BYTE,
            dataFormat: gl.RGB,
            parameters: {
                [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
                [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
                [gl.TEXTURE_WRAP_S]: gl.REPEAT,
                [gl.TEXTURE_WRAP_T]: gl.REPEAT
            }
        });

        this.setState({
            model,
            textureFrom,
            textureTo,
            width,
            height,
            colorMapTexture,
            noDataTexture
        });

        // TODO: this should be in its own function so we can re-set it later
        colorMapTexture.setImageData({
            pixels: colorMap,
            width: 1,
            height: colorMap.length / 3,
            format: gl.RGB32F,
            type: gl.FLOAT,
            dataFormat: gl.RGB
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
        const {gl} = this.context;
        const {model, textureFrom, textureTo, width, height, delta, timeInterval, colorMapTexture, noDataTexture} = this.state;
        const {dataTextureArray, interpolationMode, colorMap, opacity, noDataImage} = this.props;

        textureFrom.setImageData({
            pixels: dataTextureArray[timeInterval | 0],
            width,
            height,
            format: gl.RG32F,
            type: gl.FLOAT,
            dataFormat: gl.RG
        });

        textureTo.setImageData({
            pixels: dataTextureArray[(timeInterval + 1) | 0],
            width,
            height,
            format: gl.RG32F,
            type: gl.FLOAT,
            dataFormat: gl.RG
        });

        if (noDataImage.complete) {
            noDataTexture.setImageData({
                pixels: noDataImage,
                format: gl.RGB,
                type: gl.UNSIGNED_BYTE,
                dataFormat: gl.RGB
            });
        }

        const parameters = {
            clearDepth: 1.0,
            depthTest: true,
            depthFunc: gl.LEQUAL
        };

        uniforms['uData0Sampler'] = textureFrom;
        uniforms['uData1Sampler'] = textureTo;
        uniforms['uColorScaleSampler'] = colorMapTexture;
        uniforms['uNoDataSampler'] = noDataTexture;
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
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
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
            format: gl.RG32F,
            dataFormat: gl.RG,
            type: gl.FLOAT,
            parameters: {
                // [gl.TEXTURE_MAG_FILTER]: gl.NEAREST,
                // [gl.TEXTURE_MIN_FILTER]: gl.NEAREST,
                [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
                [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
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
    time: 0,
    opacity: 0.9,
    interpolationMode: 0,
    colorMap: null
};
