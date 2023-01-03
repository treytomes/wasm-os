CFLAGS :=  -Os -s INITIAL_MEMORY=64KB -s ALLOW_MEMORY_GROWTH=0 -s TOTAL_STACK=0kb -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s STANDALONE_WASM -Wl, --no-entry
BUILD_DIR := ./dist
SOURCE_DIR := ./src

all: always kernel

rebuild: clean all

kernel: $(BUILD_DIR)/kernel.wasm

#emcc kernel.c -o kernel.wasm -s EXPORTED_FUNCTIONS="[main, irq_handler]" -s ERROR_ON_UNDEFINED_SYMBOLS=0
#emcc -Os -s INITIAL_MEMORY=64KB -s MAXIMUM_MEMORY=6MB -s ALLOW_MEMORY_GROWTH=0 -s TOTAL_STACK=0kb -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s STANDALONE_WASM -s EXPORTED_FUNCTIONS="['_main', '_irq_handler']" -Wl, --no-entry kernel.c -o kernel.wasm
$(BUILD_DIR)/kernel.wasm: $(SOURCE_DIR)/kernel.c
	emcc $(CFLAGS) -s EXPORTED_FUNCTIONS="['_main', '_irq_handler']" $(SOURCE_DIR)/kernel.c -o $(BUILD_DIR)/kernel.wasm

clean:
	rm -f *.wasm

always:
#	ifeq ($(OS),Windows_NT)
#		env.bat
#	else
#		env.sh
#	endif
