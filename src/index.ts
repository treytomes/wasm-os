import './assets/favicon.svg';

console.log('Starting wasm-os.');

// Initialize structures.
let memory = new WebAssembly.Memory({
    initial: 0x100,
    maximum: 0x200
});

let exports;

const wasi_imports = {
    'proc_exit' : (code: number) => {
        throw {
            name: 'ExitStatus',
            message: `Program terminated with exit(${code})`,
            status: code
        };
    }
};

const URL_KERNEL_WASM = 'kernel.wasm';

// ISR values.
const TIM_IRQ = 0;
const KEY_IRQ = 1;

const MEM_LASTKEYPRESS = 0x1000;
const TICK_INTERVAL_MS = 1000;

interface IExports {
    memory: WebAssembly.Memory;
    
    main: () => void;
    irq_handler: (irq: number) => void;
}

// Load the operating system.
fetch(URL_KERNEL_WASM)
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        js: {
            mem: memory
        },
        env: {
            trace: (channel: number, data: number) => console.log(`${Date.now()}: ${channel} => ${data}`)
        },
        wasi_snapshot_preview1: wasi_imports
    }))
    .then(results => {
        let exports: IExports = (results.instance.exports as unknown) as IExports;
        memory = exports.memory as WebAssembly.Memory;

        // Initialize.
        exports.main();

        // systick
        setInterval(() => exports.irq_handler(TIM_IRQ), TICK_INTERVAL_MS);

        document.addEventListener('keypress', function(e) {
            // Write in memory.
            (new Uint8Array(memory.buffer))[MEM_LASTKEYPRESS] = e.key.charCodeAt(0); // Get the ASCII character indicated by this key press.
            exports.irq_handler(KEY_IRQ);
        });
    });
