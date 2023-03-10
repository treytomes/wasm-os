#CFLAGS :=  -Os -s INITIAL_MEMORY=64KB -s ALLOW_MEMORY_GROWTH=0 -s TOTAL_STACK=0kb -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s STANDALONE_WASM -Wl, --no-entry
CFLAGS := -s ERROR_ON_UNDEFINED_SYMBOLS=0
BUILD_DIR := ./dist
SOURCE_DIR := ./src/wasm
KERNEL_SRC := $(SOURCE_DIR)/kernel

all: always kernel

rebuild: clean all

kernel: $(BUILD_DIR)/kernel.wasm

#emcc kernel.c -o kernel.wasm -s EXPORTED_FUNCTIONS="[main, irq_handler]" -s ERROR_ON_UNDEFINED_SYMBOLS=0
#emcc -Os -s INITIAL_MEMORY=64KB -s MAXIMUM_MEMORY=6MB -s ALLOW_MEMORY_GROWTH=0 -s TOTAL_STACK=0kb -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s STANDALONE_WASM -s EXPORTED_FUNCTIONS="['_main', '_irq_handler']" -Wl, --no-entry kernel.c -o kernel.wasm
$(BUILD_DIR)/kernel.wasm: $(KERNEL_SRC)/main.c $(KERNEL_SRC)/graphics.c $(KERNEL_SRC)/text.c
	emcc $(CFLAGS) -s EXPORTED_FUNCTIONS="['_main', '_irq_handler', '_get_memory_map']" $(KERNEL_SRC)/main.c $(KERNEL_SRC)/graphics.c $(KERNEL_SRC)/text.c -o $(BUILD_DIR)/kernel.wasm

clean:
	rm -f $(BUILD_DIR)/*.wasm

always:
#	ifeq ($(OS),Windows_NT)
#		env.bat
#	else
#		env.sh
#	endif
