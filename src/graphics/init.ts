/**
 * Use this to start up the framework.
 */

// TODO: Remove needed functions from this: https://github.com/greggman/twgl.js

// This was helpful: https://webgl2fundamentals.org/webgl/lessons/webgl-qna-how-to-get-pixelize-effect-in-webgl-.html

/*
TODO:
http://marcgg.com/blog/2016/11/21/chiptune-sequencer-multiplayer/
http://marcgg.com/blog/2016/11/01/javascript-audio/
https://webglfundamentals.org/
*/

import * as twgl from 'twgl.js';
import RenderContext from './RenderContext';
import { PaletteContext } from './PaletteContext';
import CanvasShader from './CanvasShader';

import RENDER_SHADER_VS from '../shaders/render.vs';
import RENDER_SHADER_FS from '../shaders/render.fs';
import { DisplayMode } from './DisplayMode';
import { Color } from './Color';

// Setup a unit quad composed of 2 triangles for rendering the framebuffer to the canvas.
const FRAMEBUFFER_POSITIONS = [
	1, 1,
	-1, 1,
	-1, -1,

	1, 1,
	-1, -1,
	1, -1,
];

let canvas: HTMLCanvasElement = null;
export let displayMode: DisplayMode = null;
let gl: WebGLRenderingContext = null;
let renderContext: RenderContext = null;
let paletteContext: PaletteContext = null;
let renderShader: twgl.ProgramInfo = null;

let depthBuffer: WebGLRenderbuffer = null;
let fb: WebGLFramebuffer = null;
export let VIDEO_MEMORY = 0;
let isInitialized = false;
let isDisplayModeSet = false;

let canvasShader: CanvasShader = null;

function hsv2rgb(hue: number, saturation: number, brightness: number) {
	if (hue < 0) hue = 0;
	if (saturation < 0) saturation = 0;
	if (brightness < 0) brightness = 0;

	if (hue > 1) hue = 1;
	if (saturation > 1) saturation = 1;
	if (brightness > 1) brightness = 1;

	if (0 == saturation) {
		brightness = Math.floor(brightness * 255);
		return [brightness, brightness, brightness];
	}

	let fMax = 0;
	let fMid = 0;
	let fMin = 0;

	if (0.5 < brightness) {
		fMax = brightness - (brightness * saturation) + saturation;
		fMin = brightness + (brightness * saturation) - saturation;
	} else {
		fMax = brightness + (brightness * saturation);
		fMin = brightness - (brightness * saturation);
	}

	let iSextant = Math.floor(hue / 60);
	if (300 <= hue) {
		hue -= 360;
	}
	hue /= 60;
	hue -= 2 * Math.floor(((iSextant + 1) % 6) / 2.0);
	if (0 == (iSextant % 2)) {
		fMid = hue * (fMax - fMin) + fMin;
	} else {
		fMid = fMin - hue * (fMax - fMin);
	}

	switch (iSextant) {
		case 1:
			return [fMid, fMax, fMin];
		case 2:
			return [fMin, fMax, fMid];
		case 3:
			return [fMin, fMid, fMax];
		case 4:
			return [fMid, fMin, fMax];
		case 5:
			return [fMax, fMin, fMid];
		default:
			return [fMax, fMid, fMin];
	}
}

/**
 * Generate the quad buffer for rendering the image data to the framebuffer.
 */
function initializeQuadBuffer() {
}

/**
 * Create a depth buffer to use with the render texture.
 */
function initializeDepthBuffer() {
	if (depthBuffer) {
		gl.deleteRenderbuffer(depthBuffer);
	}
	depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, displayMode.width, displayMode.height);
}

/**
 * Create the framebuffer.  Attach the texture and depth buffer to the framebuffer. 
 */
function initializeFramebuffer() {
	if (fb) {
		gl.deleteFramebuffer(fb);
	}
	fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderContext.texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
}

function loadRenderShader() {
	renderShader = twgl.createProgramInfo(gl, [RENDER_SHADER_VS, RENDER_SHADER_FS]);

	gl.useProgram(renderShader.program);
	let imageLoc = gl.getUniformLocation(renderShader.program, "u_image");
	let paletteLoc = gl.getUniformLocation(renderShader.program, "u_palette");

	// Tell it to use texture units 0 and 1 for the image and palette.
	gl.uniform1i(imageLoc, 0);
	gl.uniform1i(paletteLoc, 1);
}

function setPalette(index: number, r: number, g: number, b: number, a: number = 255) {
	paletteContext.set(index, r, g, b, a);
}

function loadPalette(colors: Array<Color>) {
	paletteContext.load(colors);
}

/**
 * Get the palette index at a position.
 */
function getPixel(x: number, y: number) {
	return renderContext.getPixel(x, y);
}

/**
 * Set a pixel to a palette index at a position.
 */
function setPixel(x: number, y: number, color: number) {
	renderContext.setPixel(x, y, color);
}

export function link(src: ArrayBuffer, startingIndex: number) {
	VIDEO_MEMORY = startingIndex;
	renderContext.link(src, startingIndex);
}

/**
 * Clear the image buffer to a color.
 */
function clearScreen(color: number) {
	renderContext.clear(color);
}

/**
 * Draw the image data to the frame buffer.
 */
function refreshFrameBuffer() {
	let vertBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FRAMEBUFFER_POSITIONS), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, FRAMEBUFFER_POSITIONS.length / 2);
}

/**
 * Render the framebuffer to the canvas.
 */
function presentFrameBuffer(time: number) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	const clientWidth = canvas.clientWidth;
	const clientHeight = canvas.clientHeight;

	const displayWidth = clientWidth;
	const displayHeight = clientHeight;
	let drawWidth = 0;
	let drawHeight = 0;
	if (displayWidth > displayHeight) {
		// Most of the time the monitor will be horizontal.
		drawHeight = displayHeight;
		drawWidth = displayMode.width * drawHeight / displayMode.height;
	} else {
		// Sometimes the monitor will be vertical.
		drawWidth = displayWidth;
		drawHeight = displayMode.height * drawWidth / displayMode.width;
	}
	const m = twgl.m4.ortho(0, clientWidth, 0, clientHeight, -1, 1);
	twgl.m4.translate(m, [
		(displayWidth - drawWidth) / 2,
		(displayHeight - drawHeight) / 2,
		0
	], m);
	twgl.m4.scale(m, [drawWidth, drawHeight, 1], m);

	canvasShader.time = time;
	canvasShader.renderContext = renderContext;
	canvasShader.present(m);
}

/**
 * Prepare the screen for rendering, then present the completed image data to the screen.
 */
export function refresh(time: number) {
	if (!isInitialized || !isDisplayModeSet) {
		return;
	}
	twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

	// This makes WebGL render to the texture and depthBuffer.
	// All draw calls will render there instead of the canvas until we bind something else.
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.viewport(0, 0, displayMode.width, displayMode.height);

	gl.useProgram(renderShader.program);
	
	renderContext.refresh();
	refreshFrameBuffer();
	presentFrameBuffer(time);
}

/**
 * Convert canvas coordinates into virtual screen coordinates.
 *
 * @returns An object with the converted x and y properties.
 */
function convertPosition(x: number, y: number) {
	const rect = canvas.getBoundingClientRect();

	const displayWidth = canvas.clientWidth;
	const displayHeight = canvas.clientHeight;
	let drawWidth = 0;
	let drawHeight = 0;
	if (displayWidth > displayHeight) {
		// Most of the time the monitor will be horizontal.
		drawHeight = displayHeight;
		drawWidth = displayMode.width * drawHeight / displayMode.height;
	} else {
		// Sometimes the monitor will be vertical.
		drawWidth = displayWidth;
		drawHeight = displayMode.height * drawWidth / displayMode.width;
	}

	rect.x += (displayWidth - drawWidth) / 2;
	rect.y += (displayHeight - drawHeight) / 2;
	rect.width = drawWidth;
	rect.height = drawHeight;

	const newX = Math.floor((x - rect.left) / rect.width * displayMode.width);
	const newY = Math.floor((y - rect.top) / rect.height * displayMode.height);

	return { x: newX, y: newY };
}

export function initialize() {
	if (canvas) {
		console.error('Graphics system is already initialized.');
		return;
	}

	canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	gl = canvas.getContext('webgl');

	canvasShader = new CanvasShader(gl);
	loadRenderShader();
	initializeQuadBuffer();

	isInitialized = true;
}

export function setDisplayMode(mode: DisplayMode) {
	if (!isInitialized) {
		console.error('Please initialize the graphics system before setting the display mode.');
		return;
	}

	displayMode = mode;

	// Make a pixel texture to match the requested screen size.
	if (!renderContext) {
		renderContext = new RenderContext(gl, displayMode);
	} else {
		renderContext.resize(displayMode);
	}

	initializeDepthBuffer();
	initializeFramebuffer();

	if (!paletteContext) {
		paletteContext = new PaletteContext(gl, mode.palette.length);
	} else if (mode.palette.length !== paletteContext.size) {
		paletteContext.resize(mode.palette.length);
	}
	loadPalette(mode.palette);
	renderContext.createTexture();
	isDisplayModeSet = true;
}
