import { Image } from 'image-js'
import { setPixel } from './bootstrap.js'

const DEFAULT_COLORKEY = [0x00, 0x00, 0x00]

export default class TileSet {
  filename: string
  tileWidth: number
  tileHeight: number
  tilesPerRow: number
  image?: Image
  isLoaded: boolean
  colorKey: Array<number>

  constructor(filename: string, tileWidth: number, tileHeight: number) {
    this.filename = filename
    this.tileWidth = tileWidth
    this.tileHeight = tileHeight
    this.tilesPerRow = 0

    this.image = undefined
    this.isLoaded = false

    this.colorKey = DEFAULT_COLORKEY
  }

  loadContent() {
    Image.load(this.filename).then((image) => {
      this.image = image
      this.tilesPerRow = this.image.width / this.tileWidth
      this.isLoaded = true
    })
  }

  draw(x: number, y: number, tileIndex: number, fg: number, bg: number) {
    if (!this.image) throw new Error('Image data is not loaded.')

    const src_x = Math.floor(tileIndex % this.tilesPerRow) * this.tileWidth
    const src_y = Math.floor(tileIndex / this.tilesPerRow) * this.tileHeight

    for (let off_y = 0; off_y < this.tileHeight; off_y++) {
      for (let off_x = 0; off_x < this.tileWidth; off_x++) {
        const c = this.image.getPixelXY(src_x + off_x, src_y + off_y)
        if (c[0] !== this.colorKey[0] || c[1] !== this.colorKey[1] || c[2] !== this.colorKey[2]) {
          setPixel(x + off_x, y + off_y, fg)
        } else {
          setPixel(x + off_x, y + off_y, bg)
        }
      }
    }
  }
}
