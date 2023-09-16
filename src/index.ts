import './style.css'
import * as bootloader from './bootloader'
import * as graphics from './graphics/init'
import { Image } from 'image-js'
import * as memory from './system/memory'

function onRenderFrame(time: number) {
  graphics.refresh(time)
  requestAnimationFrame(onRenderFrame)
}

function initializeEnvironment() {
  graphics.initialize()

  // Begin the render loop.
  requestAnimationFrame(onRenderFrame)
}

async function loadFont() {
  const colorKey = [0x00, 0x00, 0x00]
  const image = await Image.load('OEM437_8.png')

  //let ch = 0;
  let ptr = memory.MemoryMap.instance.fontMemory
  for (let row = 0; row < 16; row++) {
    for (let column = 0; column < 16; column++) {
      const x = column * 8
      const y = row * 8

      for (let yd = 0; yd < 8; yd++) {
        let byte = 0
        for (let xd = 0; xd < 8; xd++) {
          byte = byte << 1
          const c = image.getPixelXY(x + xd, y + yd)
          if (c[0] !== colorKey[0] || c[1] !== colorKey[1] || c[2] !== colorKey[2]) {
            byte = byte + 1
          }
        }

        memory.HEAPU8[ptr] = byte
        ptr++
      }
      //ch++;
    }
  }
}

function onWindowLoad() {
  initializeEnvironment()
  bootloader.main().then(() => loadFont())
}

window.addEventListener('load', onWindowLoad, false)
