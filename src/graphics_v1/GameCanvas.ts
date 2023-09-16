export default class GameCanvas {
  canvas: HTMLCanvasElement
  screenWidth: number
  screenHeight: number
  isContentLoaded: boolean

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = (canvas ?? document.querySelector('canvas')) as HTMLCanvasElement

    // Standard SNES resolution.
    this.screenWidth = 256
    this.screenHeight = 224
    this.isContentLoaded = false
  }

  onInit() {}
  loadContent() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onKeyDown(e: KeyboardEvent) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onKeyUp(e: KeyboardEvent) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onKeyPress(e: KeyboardEvent) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseDown(x: number, y: number, buttons: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseUp(x: number, y: number, buttons: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseMove(x: number, y: number, buttons: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUpdate(time: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRender(time: number) {}
}
