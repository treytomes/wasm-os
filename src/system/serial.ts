import { pointerToString } from './util'

export enum StandardFile {
  DEBUG = 0,
  INFO = 1,
  ERROR = 2
}

export function serialWrite(memory: WebAssembly.Memory, file: StandardFile, dataPointer: number) {
  const text = `${Date.now()}: ${pointerToString(memory, dataPointer)}`

  switch (file) {
    case StandardFile.DEBUG:
      console.debug(text)
      break
    case StandardFile.INFO:
      console.info(text)
      break
    case StandardFile.ERROR:
      console.error(text)
      break
  }
}

export function trace(channel: number, data: number) {
  console.debug(`${Date.now()}: ${channel} => ${data}`)
}
