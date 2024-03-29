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

import * as twgl from 'twgl.js'
import GameCanvas from './GameCanvas'
import RenderContext from './RenderContext'
import { PaletteContext, PALETTE_SIZE } from './PaletteContext'

import RENDER_SHADER_VS from '../shaders/render.vs'
import RENDER_SHADER_FS from '../shaders/render.fs'
import CANVAS_SHADER_VS from '../shaders/canvas.vs'
import CANVAS_SHADER_FS from '../shaders/canvas.fs'

// These are used to setup the quad buffer for rendering the image data to the framebuffer.
const QUAD_ARRAYS = {
  position: {
    numComponents: 2,
    data: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]
  },
  texcoord: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]
}

// Setup a unit quad composed of 2 triangles for rendering the framebuffer to the canvas.
const FRAMEBUFFER_POSITIONS = [
  1, 1, -1, 1, -1, -1,

  1, 1, -1, -1, 1, -1
]

let _instance: GameCanvas
let gl: WebGLRenderingContext
let renderContext: RenderContext
let paletteContext: PaletteContext
let canvasShader: twgl.ProgramInfo
let renderShader: twgl.ProgramInfo
let quadBufferInfo: twgl.BufferInfo
let depthBuffer: WebGLRenderbuffer
let fb: WebGLFramebuffer

function hsv2rgb(hue: number, saturation: number, brightness: number) {
  if (hue < 0) hue = 0
  if (saturation < 0) saturation = 0
  if (brightness < 0) brightness = 0

  if (hue > 1) hue = 1
  if (saturation > 1) saturation = 1
  if (brightness > 1) brightness = 1

  if (0 == saturation) {
    brightness = Math.floor(brightness * 255)
    return [brightness, brightness, brightness]
  }

  let fMax = 0
  let fMid = 0
  let fMin = 0

  if (0.5 < brightness) {
    fMax = brightness - brightness * saturation + saturation
    fMin = brightness + brightness * saturation - saturation
  } else {
    fMax = brightness + brightness * saturation
    fMin = brightness - brightness * saturation
  }

  const iSextant = Math.floor(hue / 60)
  if (300 <= hue) {
    hue -= 360
  }
  hue /= 60
  hue -= 2 * Math.floor(((iSextant + 1) % 6) / 2.0)
  if (0 == iSextant % 2) {
    fMid = hue * (fMax - fMin) + fMin
  } else {
    fMid = fMin - hue * (fMax - fMin)
  }

  switch (iSextant) {
    case 1:
      return [fMid, fMax, fMin]
    case 2:
      return [fMin, fMax, fMid]
    case 3:
      return [fMin, fMid, fMax]
    case 4:
      return [fMid, fMin, fMax]
    case 5:
      return [fMax, fMin, fMid]
    default:
      return [fMax, fMid, fMin]
  }
}

/**
 * Generate the quad buffer for rendering the image data to the framebuffer.
 */
function initializeQuadBuffer() {
  // calls gl.createBuffer, gl.bindBuffer, gl.bufferData for each array
  quadBufferInfo = twgl.createBufferInfoFromArrays(gl, QUAD_ARRAYS)
}

/**
 * Create a depth buffer to use with the render texture.
 */
function initializeDepthBuffer() {
  const _depthBuffer = gl.createRenderbuffer()
  if (!_depthBuffer) throw new Error('Unable to acquire depth buffer.')
  depthBuffer = _depthBuffer

  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
  gl.renderbufferStorage(
    gl.RENDERBUFFER,
    gl.DEPTH_STENCIL,
    _instance.screenWidth,
    _instance.screenHeight
  )
}

/**
 * Create the framebuffer.  Attach the texture and depth buffer to the framebuffer.
 */
function initializeFramebuffer() {
  const _fb = gl.createFramebuffer()
  if (!_fb) throw new Error('Unable to acquire frame buffer.')
  fb = _fb

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    renderContext.texture,
    0
  )
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_STENCIL_ATTACHMENT,
    gl.RENDERBUFFER,
    depthBuffer
  )
}

function loadRenderShader() {
  renderShader = twgl.createProgramInfo(gl, [RENDER_SHADER_VS, RENDER_SHADER_FS])

  gl.useProgram(renderShader.program)
  const imageLoc = gl.getUniformLocation(renderShader.program, 'u_image')
  const paletteLoc = gl.getUniformLocation(renderShader.program, 'u_palette')

  // Tell it to use texture units 0 and 1 for the image and palette.
  gl.uniform1i(imageLoc, 0)
  gl.uniform1i(paletteLoc, 1)
}

function loadCanvasShader() {
  // Compiles shaders, links program, looks up locations.
  canvasShader = twgl.createProgramInfo(gl, [CANVAS_SHADER_VS, CANVAS_SHADER_FS])
}

/**
 * Upload the palette data to video memory.
 */
function initializePalette() {}

function setPalette(index: number, r: number, g: number, b: number, a: number = 255) {
  paletteContext.set(index, r, g, b, a)
}

function loadPalette(colors: Array<Array<number>>) {
  paletteContext.load(colors)
}

/**
 * Get the palette index at a position.
 */
function getPixel(x: number, y: number) {
  return renderContext.getPixel(x, y)
}

/**
 * Set a pixel to a palette index at a position.
 */
function setPixel(x: number, y: number, color: number) {
  renderContext.setPixel(x, y, color)
}

/**
 * Clear the image buffer to a color.
 */
function clearScreen(color: number) {
  renderContext.clear(color)
}

/**
 * Draw the image data to the frame buffer.
 */
function refreshFrameBuffer() {
  const vertBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FRAMEBUFFER_POSITIONS), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.TRIANGLES, 0, FRAMEBUFFER_POSITIONS.length / 2)
}

/**
 * Render the framebuffer to the canvas.
 */
function presentFrameBuffer(time: number) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  const clientWidth = (gl.canvas as HTMLCanvasElement).clientWidth
  const clientHeight = (gl.canvas as HTMLCanvasElement).clientHeight

  const displayWidth = clientWidth
  const displayHeight = clientHeight
  let drawWidth = 0
  let drawHeight = 0
  if (displayWidth > displayHeight) {
    // Most of the time the monitor will be horizontal.
    drawHeight = displayHeight
    drawWidth = (_instance.screenWidth * drawHeight) / _instance.screenHeight
  } else {
    // Sometimes the monitor will be vertical.
    drawWidth = displayWidth
    drawHeight = (_instance.screenHeight * drawWidth) / _instance.screenWidth
  }
  const m = twgl.m4.ortho(0, clientWidth, 0, clientHeight, -1, 1)
  twgl.m4.translate(m, [(displayWidth - drawWidth) / 2, (displayHeight - drawHeight) / 2, 0], m)
  twgl.m4.scale(m, [drawWidth, drawHeight, 1], m)

  gl.useProgram(canvasShader.program)
  // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
  twgl.setBuffersAndAttributes(gl, canvasShader, quadBufferInfo)
  // calls gl.uniformXXX, gl.activeTexture, gl.bindTexture
  twgl.setUniforms(canvasShader, {
    u_matrix: m,
    u_texture: renderContext.texture,
    u_time: time * 0.0001,
    u_screenResolution: [_instance.screenWidth, _instance.screenHeight]
  })
  // calls gl.drawArrays or gl.drawElements
  twgl.drawBufferInfo(gl, quadBufferInfo)
}

/**
 * Prepare the screen for rendering.
 *
 * @param {number} time How much time has passed, in milliseconds, since the start.
 */
function beginRender(time: number) {
  twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)
  // this makes WebGL render to the texture and depthBuffer
  // all draw calls will render there instead of the canvas
  // until we bind something else.
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.viewport(0, 0, _instance.screenWidth, _instance.screenHeight)

  gl.useProgram(renderShader.program)
  const timeLoc = gl.getUniformLocation(renderShader.program, 'u_time')
  gl.uniform1f(timeLoc, time * 0.001)
}

/**
 * Present the completed image data to the screen.
 */
function endRender(time: number) {
  renderContext.refresh()
  refreshFrameBuffer()
  presentFrameBuffer(time)
}

/**
 * Convert canvas coordinates into virtual screen coordinates.
 *
 * @returns An object with the converted x and y properties.
 */
function convertPosition(x: number, y: number) {
  const rect = _instance.canvas.getBoundingClientRect()

  const displayWidth = _instance.canvas.clientWidth
  const displayHeight = _instance.canvas.clientHeight
  let drawWidth = 0
  let drawHeight = 0
  if (displayWidth > displayHeight) {
    // Most of the time the monitor will be horizontal.
    drawHeight = displayHeight
    drawWidth = (_instance.screenWidth * drawHeight) / _instance.screenHeight
  } else {
    // Sometimes the monitor will be vertical.
    drawWidth = displayWidth
    drawHeight = (_instance.screenHeight * drawWidth) / _instance.screenWidth
  }

  rect.x += (displayWidth - drawWidth) / 2
  rect.y += (displayHeight - drawHeight) / 2
  rect.width = drawWidth
  rect.height = drawHeight

  const newX = Math.floor(((x - rect.left) / rect.width) * _instance.screenWidth)
  const newY = Math.floor(((y - rect.top) / rect.height) * _instance.screenHeight)

  return { x: newX, y: newY }
}

let lastUpdateTime = 0
function onUpdateFrame(time: number) {
  _instance.onUpdate(time - lastUpdateTime)
  lastUpdateTime = time
  requestAnimationFrame(onUpdateFrame)
}

function onRenderFrame(time: number) {
  beginRender(time)
  if (!_instance.isContentLoaded) {
    _instance.loadContent()
    _instance.isContentLoaded = true
  }
  _instance.onRender(time)
  endRender(time)
  requestAnimationFrame(onRenderFrame)
}

function initialize(gameInstance: GameCanvas) {
  _instance = gameInstance
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  _instance.canvas = canvas

  const _gl = canvas.getContext('webgl')
  if (!_gl) throw Error('Unable to acquire webgl context.')
  gl = _gl

  loadCanvasShader()
  loadRenderShader()
  initializeQuadBuffer()

  // Make a pixel texture to match the requested screen size.
  renderContext = new RenderContext(gl, _instance.screenWidth, _instance.screenHeight)

  initializeDepthBuffer()

  initializeFramebuffer()

  paletteContext = new PaletteContext(gl, PALETTE_SIZE)
  initializePalette()
  renderContext.createTexture()

  document.addEventListener('keydown', function (e) {
    //console.log('keydown', e);
    _instance.onKeyDown(e)
  })

  document.addEventListener('keyup', function (e) {
    //console.log('keyup', e);
    _instance.onKeyUp(e)
  })

  document.addEventListener('keypress', function (e) {
    //console.log('keypress', e);
    _instance.onKeyPress(e)
  })

  _instance.canvas.addEventListener('mousedown', function (e) {
    const pos = convertPosition(e.clientX, e.clientY)
    _instance.onMouseDown(pos.x, pos.y, e.buttons)
  })

  _instance.canvas.addEventListener('mouseup', function (e) {
    const pos = convertPosition(e.clientX, e.clientY)
    _instance.onMouseUp(pos.x, pos.y, e.buttons)
  })

  _instance.canvas.addEventListener('mousemove', function (e) {
    const pos = convertPosition(e.clientX, e.clientY)
    _instance.onMouseMove(pos.x, pos.y, e.buttons)
  })

  // TODO: getTouchPos went missing at some point?  Replace it with something that works?
  /*
    _instance.canvas.addEventListener('touchstart', function(e) {
        mousePos = getTouchPos(canvas, e);
        for (let n = 0; n < e.touches.length; n++) {
            const touch = e.touches[n];
            const pos = convertPosition(touch.clientX, touch.clientY);
            _instance.onMouseMove(pos.x, pos.y, 1);
        }
    });

    _instance.canvas.addEventListener('touchend', function(e) {
        _instance.onMouseUp(null, null, 1);
    });

    _instance.canvas.addEventListener('touchmove', function(e) {
        for (let n = 0; n < e.touches.length; n++) {
            const touch = e.touches[n];
            const pos = convertPosition(touch.clientX, touch.clientY);
            _instance.onMouseMove(pos.x, pos.y, 1);
        }
    });
	*/

  _instance.onInit()
  requestAnimationFrame(onRenderFrame)
  requestAnimationFrame(onUpdateFrame)
}

export {
  PALETTE_SIZE,
  GameCanvas,
  setPalette,
  loadPalette,
  hsv2rgb,
  clearScreen,
  getPixel,
  setPixel,
  initialize,
  beginRender,
  endRender,
  convertPosition,
  gl,
  FRAMEBUFFER_POSITIONS
}
