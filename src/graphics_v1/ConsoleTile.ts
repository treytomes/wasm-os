import { isNumber } from 'lodash'

export default class ConsoleTile {
  foregroundColor: number
  backgroundColor: number
  private _tileIndex: number

  constructor(tileIndex: number | string, foregroundColor: number, backgroundColor: number) {
    this._tileIndex = 0
    this.tileIndex = tileIndex
    this.foregroundColor = foregroundColor
    this.backgroundColor = backgroundColor
  }

  set tileIndex(value: string | number) {
    if (!isNumber(value)) {
      this._tileIndex = value.toString().charCodeAt(0)
    } else {
      this._tileIndex = Math.floor(value)
    }
  }

  get tileIndex(): number {
    return this._tileIndex
  }
}
