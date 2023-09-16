import { DisplayMode } from './DisplayMode'

export default class RenderContext {
  gl: WebGLRenderingContext
  displayMode: DisplayMode
  image: Uint8Array
  imageTexture: WebGLTexture
  texture: WebGLTexture

  constructor(gl: WebGLRenderingContext, displayMode: DisplayMode) {
    this.gl = gl
    this.resize(displayMode)
  }

  get width(): number {
    return this.displayMode.width
  }

  get height(): number {
    return this.displayMode.height
  }

  resize(displayMode: DisplayMode) {
    this.displayMode = displayMode

    // The image representing our screen.
    this.image = new Uint8Array(displayMode.width * displayMode.height)
    this.imageTexture = null

    if (this.texture) {
      this.gl.deleteTexture(this.texture)
    }
    const _texture = this.gl.createTexture()
    if (!_texture) throw new Error('Unable to create the render texture.')
    this.texture = _texture

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.displayMode.width,
      this.displayMode.height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    )
    this.setTextureParameters()
  }

  /**
   * Upload the render image data to video memory.
   */
  createTexture() {
    if (this.imageTexture) {
      this.gl.deleteTexture(this.imageTexture)
    }
    const _imageTexture = this.gl.createTexture()
    if (!_imageTexture) throw new Error('Unable to create the image texture.')
    this.imageTexture = _imageTexture
    this.refresh()
    this.setTextureParameters()
  }

  setTextureParameters() {
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
  }

  /**
   * Reload the render texture in video memory from the renderImage array.
   */
  refresh() {
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.ALPHA,
      this.displayMode.width,
      this.displayMode.height,
      0,
      this.gl.ALPHA,
      this.gl.UNSIGNED_BYTE,
      this.image
    )
  }

  /**
   * Get the palette index at a position.
   *
   * @returns {number} The palette index at the given position.
   */
  getPixel(x: number, y: number) {
    return this.image[y * this.displayMode.width + x]
  }

  /**
   * Set a pixel to a palette index at a position.
   */
  setPixel(x: number, y: number, color: number) {
    x = Math.floor(x)
    y = Math.floor(y)
    color = Math.floor(color)
    if (color < 0) color = 0
    if (color > 255) color = 255

    this.image[y * this.displayMode.width + x] = color
  }

  link(src: ArrayBuffer, startingIndex: number) {
    this.image = new Uint8Array(src).subarray(startingIndex, startingIndex + this.image.length)
  }

  /**
   * Clear the image buffer to a color.
   */
  clear(color: number) {
    this.image = this.image.fill(color)
  }
}
