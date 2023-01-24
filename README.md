# WASM-OS

![Screenshot](/screenshots/screenshot_20230112.png?raw=true "Exercising the 8-bit display.")

## TODO

- How to compile WASM?
- How to load WASM files from a WASM file?
- Consider rewriting the C code in [AssemblyScript](https://www.assemblyscript.org/introduction.html).

## Userland

The idea is to have the kernel and user programs running in separate Web Works.
User programs call a `syscall` function that is exported from the kernel, then reimported into the user program.

`syscall` takes 3 parameters:
- A function number.
- The data length in bytes.
- A blob of data that contains the parameters to be processed by the kernel.

The data might need to be copied to the kernel through TypeScript.

## References

- https://emscripten.org/
- https://alastairbarber.com/simple-web-assembly-from-the-ground-up/
    - Useful for building the WASM file without the JavaScript.
- https://www.youtube.com/@MichaelGrieco/videos
    - Video series on building an operating system using WebAssembly.
- [Webpack DevServer Configuration](https://webpack.js.org/configuration/dev-server/)
- How to write your own WebAssembly compiler.
    - https://www.bitfalter.com/webassembly-compiler-runtime
    - https://news.ycombinator.com/item?id=21889614
    - https://www.infoq.com/presentations/webassembly-compiler/
    - https://www.infoq.com/presentations/webassembly-details/
    - https://blog.scottlogic.com/2019/05/17/webassembly-compiler.html
