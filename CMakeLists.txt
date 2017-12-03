cmake_minimum_required(VERSION 3.4)

add_definitions(-DDISABLE_HW_SUPPORT)

file(GLOB_RECURSE Vgmplay_HEADERS "modules/vgmplay/VGMPlay/*.h")

set (Vgmplay_INCLUDE_DIRS "")
foreach (_headerFile ${Vgmplay_HEADERS})
    get_filename_component(_dir ${_headerFile} PATH)
    list (APPEND Vgmplay_INCLUDE_DIRS ${_dir})
endforeach()
list(REMOVE_DUPLICATES Vgmplay_INCLUDE_DIRS)
include_directories(${Vgmplay_INCLUDE_DIRS})

file(GLOB_RECURSE SOURCES "modules/vgmplay/VGMPlay/*.c")

list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/chips/opl.c")
list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/chips/scsplfo.c")
list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/Stream.c")
list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/pt_ioctl.c")
#list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/VGMPlayUI.c")
list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/vgm2wav.c")
list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/vgm2pcm.c")
list(REMOVE_ITEM SOURCES "${PROJECT_SOURCE_DIR}/modules/vgmplay/VGMPlay/VGMPlay_AddFmts.c")

add_library(vgmplay STATIC ${SOURCES})
target_link_libraries(vgmplay m)

set(CMAKE_C_FLAGS "-O3 -Wall")

file(GLOB SOURCES VGMPlay/src/*.c)

if(EMSCRIPTEN)
  add_executable(vgmplay-js src/main.c)
  target_link_libraries(vgmplay-js vgmplay)
  set(VGMPLAY_EXPORTS "'_VGMPlay_Init','_VGMPlay_Init2','_PlayVGM','_FillBuffer2','_OpenVGMFile','_CloseVGMFile','_FillBuffer','_SetSampleRate','_SetLoopCount','_StopVGM','_VGMEnded','_GetTrackLength','_GetLoopPoint','_SeekVGM','_SamplePlayback2VGM'")
  set(CMAKE_EXE_LINKER_FLAGS "-s USE_ZLIB=1 -s TOTAL_MEMORY=134217728 -s RESERVED_FUNCTION_POINTERS=100 --memory-init-file 0 --preload-file ${PROJECT_SOURCE_DIR}/files@/ -O3 -s EXPORTED_FUNCTIONS=\"[${VGMPLAY_EXPORTS}]\"")
endif()

#33554432

