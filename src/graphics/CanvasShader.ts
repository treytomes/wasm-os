import * as twgl from 'twgl.js';
import CANVAS_SHADER_VS from '../shaders/canvas.vs';
import CANVAS_SHADER_FS from '../shaders/canvas.fs';
import RenderContext from './RenderContext';

// These are used to setup the quad buffer for rendering the image data to the framebuffer.
const QUAD_ARRAYS = {
	position: {
		numComponents: 2,
		data: [
			0, 0,
			1, 0,
			0, 1,
			0, 1,
			1, 0,
			1, 1,
		],
	},
	texcoord: [
		0, 0,
		1, 0,
		0, 1,
		0, 1,
		1, 0,
		1, 1,
	],
};

export default class CanvasShader {
    private gl: WebGLRenderingContext;
    private shader: twgl.ProgramInfo;
    private quadBufferInfo: twgl.BufferInfo;

    time: number;
    renderContext: RenderContext;
    useCurveRemap: boolean = false;
    useScanlines: boolean = true;
    useBloom: boolean = true;
    useVignette: boolean = true;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        // Compiles shaders, links program, looks up locations.
        this.shader = twgl.createProgramInfo(this.gl, [CANVAS_SHADER_VS, CANVAS_SHADER_FS]);

        this.time = 0;
        this.renderContext = null;

    	// gl.createBuffer, gl.bindBuffer, gl.bufferData for each array
    	this.quadBufferInfo = twgl.createBufferInfoFromArrays(gl, QUAD_ARRAYS);
    }

    present(m: twgl.m4.Mat4) {
        this.gl.useProgram(this.shader.program);

        // gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        twgl.setBuffersAndAttributes(this.gl, this.shader, this.quadBufferInfo);
        
        // gl.uniformXXX, gl.activeTexture, gl.bindTexture
        twgl.setUniforms(this.shader, {
            u_matrix: m,
            u_texture: this.renderContext.texture,
            u_time: this.time,
            u_screenResolution: [this.renderContext.width, this.renderContext.height],
            u_useCurveRemap: this.useCurveRemap ? 1.0 : 0.0,
            u_useScanlines: this.useScanlines ? 1.0 : 0.0,
            u_useBloom: this.useBloom ? 1.0 : 0.0,
            u_useVignette: this.useVignette ? 1.0 : 0.0,
        });

	    // calls gl.drawArrays or gl.drawElements
    	twgl.drawBufferInfo(this.gl, this.quadBufferInfo);
    }
}