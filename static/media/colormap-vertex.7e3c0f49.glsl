#define SHADER_NAME colormap-layer-vertex-shader
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

void main(void) {
    vec4 position_worldspace = vec4(project_position(aVertexPosition), 1.0);
    gl_Position = project_to_clipspace(position_worldspace);
    vTextureCoord = aTextureCoord;
}