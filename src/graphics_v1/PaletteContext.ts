export const PALETTE_SIZE = 256

export class PaletteContext {
  gl: WebGLRenderingContext
  size: number
  palette: Uint8Array
  texture: WebGLTexture

  constructor(gl: WebGLRenderingContext, size = PALETTE_SIZE) {
    this.gl = gl
    this.size = size

    // The 256-color screen palette.
    this.palette = new Uint8Array(this.size * 4)

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

  load(colors: Array<Array<number>>) {
    for (let index = 0; index < colors.length; index++) {
      const c = colors[index]
      const r = c[0]
      const g = c[1]
      const b = c[2]
      const a = c.length > 3 ? c[3] : 255

      this.palette[index * 4 + 0] = r
      this.palette[index * 4 + 1] = g
      this.palette[index * 4 + 2] = b
      this.palette[index * 4 + 3] = a
    }
    this.refresh()
  }

  set(index: number, r: number, g: number, b: number, a: number = 255) {
    this.palette[index * 4 + 0] = r
    this.palette[index * 4 + 1] = g
    this.palette[index * 4 + 2] = b
    this.palette[index * 4 + 3] = a
    this.refresh()
  }
}
