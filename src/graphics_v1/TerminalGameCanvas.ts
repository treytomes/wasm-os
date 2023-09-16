import { GameCanvas } from './bootstrap'
import { generatePalette } from './palettes/radial'
import ConsoleTile from './ConsoleTile'
import TileSet from './TileSet'
import OEM437_8 from '../assets/OEM437_8.png'

export default class TerminalGameCanvas extends GameCanvas {
  tileSet: TileSet
  rows: number
  columns: number
  tiles: Array<Array<ConsoleTile>>

  constructor(rows: number, columns: number) {
    super()

    this.tileSet = new TileSet(OEM437_8, 8, 8)

    this.rows = rows // 28; // this.screenHeight / this.tileSet.tileHeight;
    this.columns = columns // 32; //this.screenWidth / this.tileSet.tileWidth;

    this.screenWidth = this.columns * this.tileSet.tileWidth
    this.screenHeight = this.rows * this.tileSet.tileHeight

    //Logger.log(`rows=${this.rows}, columns=${this.columns}`);
    //Logger.log(`width=${this.screenWidth}, height=${this.screenHeight}`);

    this.tiles = []
    for (let r = 0; r < this.rows; r++) {
      const row = []
      for (let c = 0; c < this.columns; c++) {
        row.push(new ConsoleTile(0, 0, 0))
      }
      this.tiles.push(row)
    }
  }

  onInit() {
    generatePalette()
  }

  /**
   * @param {number} time Total elapsed milliseconds.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUpdate(time: number) {}

  loadContent() {
    this.tileSet.loadContent()
  }

  drawTile(
    row: number,
    column: number,
    tileIndex?: string | number,
    foregroundColor?: number,
    backgroundColor?: number
  ) {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
      return
    }

    const tile = this.tiles[row][column]
    if (tileIndex) {
      tile.tileIndex = tileIndex
    }
    if (foregroundColor) {
      tile.foregroundColor = foregroundColor
    }
    if (backgroundColor) {
      tile.backgroundColor = backgroundColor
    }
  }

  drawString(
    row: number,
    column: number,
    text: string,
    foregroundColor?: number,
    backgroundColor?: number
  ) {
    for (let n = 0; n < text.length; n++) {
      this.drawTile(row, column + n, text[n], foregroundColor, backgroundColor)
    }
  }

  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    tileIndex: number,
    fg: number,
    bg: number
  ) {
    if (x + width > this.columns) {
      width = this.columns - x
    }
    if (y + height > this.rows) {
      height = this.rows - y
    }

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.drawTile(y + dy, x + dx, tileIndex, fg, bg)
      }
    }
  }

  clear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        this.drawTile(r, c, 0, 0, 0)
      }
    }
  }

  /**
   * @param {number} time Total elapsed milliseconds.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRender(time: number) {
    if (!this.tileSet.isLoaded) {
      return
    }

    for (let r = 0, y = 0; r < this.rows; r++, y += this.tileSet.tileHeight) {
      for (let c = 0, x = 0; c < this.columns; c++, x += this.tileSet.tileWidth) {
        const tile = this.tiles[r][c]
        this.tileSet.draw(x, y, tile.tileIndex, tile.foregroundColor, tile.backgroundColor)
      }
    }
  }
}
