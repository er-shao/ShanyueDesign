<script lang="ts" setup>
import { useMounted, useDraggable, clamp, useWindowSize } from '@vueuse/core'
import { ref, watch } from 'vue';
import { Button as AButton, } from "@arco-design/web-vue";
import { IconClose } from "@arco-design/web-vue/es/icon";
const props = defineProps<{
  hideClose?: boolean
  onClose?: () => void
  top?: number
  left?: number
  width?: number
  height?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const mounted = useMounted()

const el = ref<HTMLDivElement>()
const handle = ref<HTMLDivElement>()

const windowSize = useWindowSize()

const clampXY = ({ x, y }: { x: number; y: number }) => {
  return {
    x: clamp(x, 0, windowSize.width.value - (el.value?.clientWidth ?? 0)),
    y: clamp(y, 0, windowSize.height.value - (el.value?.clientHeight ?? 0)),
  }
}

const { style, position } = useDraggable(el, {
  initialValue: { x: props.left ?? 0, y: props.top ?? 0 },
  handle,
  preventDefault: true,
  onMove(position) {
    const { x, y } = clampXY(position)
    position.x = x
    position.y = y
  },
})

watch([windowSize.height, windowSize.width], () => {
  const { x, y } = clampXY(position.value)
  position.value.x = x
  position.value.y = y
})

const handleClose = () => {
  emit('close')
}

defineExpose({
  handleClose,
})
</script>

<template>
  <div class="dialog-container">
    <div v-if="mounted" ref="el"
      class="dialog-el absolute flex flex-col bg-$color-bg-4 border border-$color-border-2 rounded-md z1000 shadow-lg" :style="[
        {
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        },
        style,
      ]">
      <div ref="handle" class="flex items-center p1 border-b border-$color-border-2">
        <div class="truncate flex-1 pl3">
          <slot name="title"></slot>
        </div>
        <div v-if="!hideClose">
          <a-button size="mini" class="icon-btn" @click="handleClose">
            <template #icon>
              <IconClose />
            </template>
          </a-button>
        </div>
      </div>
      <div class="flex-shrink-0">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-btn {
  --color-secondary-disabled: #ffffff;
  --color-secondary: #fff;
}
.dialog-container .dialog-el  {
  border: 1px solid #cdcdcdab
}
</style>