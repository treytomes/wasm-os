import { Color } from './Color'

const BYTES_PER_COLOR = 4

export class PaletteContext {
  gl: WebGLRenderingContext
  size!: number
  palette!: Uint8Array
  texture!: WebGLTexture

  constructor(gl: WebGLRenderingContext, size: number) {
    this.gl = gl

    this.resize(size)
  }

  resize(size: number) {
    this.size = size
    this.palette = new Uint8Array(this.size * BYTES_PER_COLOR)

    if (this.texture) {
      this.gl.deleteTexture(this.texture)
    }

    const _texture = this.gl.createTexture()
    if (!_texture) throw new Error('Unable to create palette texture.')
    this.texture = _texture

    this.gl.activeTexture(this.gl.TEXTURE1)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.size,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.palette
    )
  }

  /**
   * Reload the palette texture in video memory from the renderImage array.
   */
  refresh() {
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.size,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.palette
    )
  }

  load(colors: Array<Color>) {
    for (let index = 0; index < colors.length; index++) {
      const c = colors[index]
      this.palette[index * BYTES_PER_COLOR + 0] = c.red
      this.palette[index * BYTES_PER_COLOR + 1] = c.green
      this.palette[index * BYTES_PER_COLOR + 2] = c.blue
      this.palette[index * BYTES_PER_COLOR + 3] = c.alpha
    }
    this.refresh()
  }

  set(index: number, r: number, g: number, b: number, a: number = 255) {
    this.palette[index * BYTES_PER_COLOR + 0] = r
    this.palette[index * BYTES_PER_COLOR + 1] = g
    this.palette[index * BYTES_PER_COLOR + 2] = b
    this.palette[index * BYTES_PER_COLOR + 3] = a
    this.refresh()
  }
}
