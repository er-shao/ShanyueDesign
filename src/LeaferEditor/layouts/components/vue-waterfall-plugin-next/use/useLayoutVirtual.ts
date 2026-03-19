// @ts-nocheck
/*
 * @Author: Yaowen Liu
 * @Date: 2022-03-08 15:04:02
 * @LastEditors: Yaowen Liu
 * @LastEditTime: 2025-10-22
 */
import type { Ref } from 'vue'
import { ref } from 'vue'
import { addClass, hasClass, prefixStyle } from '../utils/dom'
import type { WaterfallProps } from '../types/waterfall'
import type { CssStyleObject, Nullable } from '../types/util'

const transform = prefixStyle('transform')
const duration = prefixStyle('animation-duration')
const delay = prefixStyle('animation-delay')
const transition = prefixStyle('transition')
const fillMode = prefixStyle('animation-fill-mode')

export function useLayoutVirtual(
  props: WaterfallProps,
  colWidth: Ref<number>,
  cols: Ref<number>,
  offsetX: Ref<number>,
  waterfallWrapper: Ref<Nullable<HTMLElement>>,
  horizontalOrder: Boolean,
  heightDifference: number,
) {
  const posY = ref<number[]>([])
  const wrapperHeight = ref(0)

  // 获取对应y下标的x的值
  const getX = (index: number): number => {
    const count = props.hasAroundGutter ? index + 1 : index
    return props.gutter * count + colWidth.value * index + offsetX.value
  }

  // 初始y
  const initY = (): void => {
    const curSpace = props.space || props.gutter
    posY.value = new Array(cols.value).fill(props.hasAroundGutter ? curSpace : 0)
  }

  // 添加动画逻辑
  const addEnterAnimation = (el: HTMLElement) => {
    const content = el.firstChild as HTMLElement
    if (content && !hasClass(content, props.animationPrefix)) {
      const styleC = content.style as CssStyleObject
      addClass(content, props.animationPrefix)
      addClass(content, props.animationEffect)
      if (duration) styleC[duration] = `${props.animationDuration / 1000}s`
      if (delay) styleC[delay] = `${props.animationDelay / 1000}s`
      if (fillMode) styleC[fillMode] = 'both'
    }
  }

  // 🧩 主逻辑：带 isFix 参数
  const layoutHandle = async(isFix = false): Promise<boolean> => {
    if (!waterfallWrapper.value) return false

    // 初始化每列的 y 值
    initY()

    // 获取元素
    const wrapper = waterfallWrapper.value
    const items: HTMLElement[] = []
    wrapper.childNodes.forEach((el: any) => {
      if (el?.nodeType === 1 && el.classList?.contains('waterfall-item'))
        items.push(el)
    })
    if (items.length === 0) return false

    // 先读取所有高度
    const heights = items.map(el => el.offsetHeight || el.getBoundingClientRect().height)
    const time = props.posDuration / 1000

    // 计算布局写入任务
    const writes: Array<() => void> = []
    for (let i = 0; i < items.length; i++) {
      const yIndex = horizontalOrder
        ? i % cols.value
        : findIndexWithinHeightDifference(posY.value, heightDifference)
      const minY = posY.value[yIndex]
      const curX = getX(yIndex)
      const h = heights[i]
      const curItem = items[i]

      writes.push(() => {
        const style = curItem.style as CssStyleObject
        if (transform)
          style[transform] = `translate3d(${Math.floor(curX)}px,${Math.floor(minY)}px,0)`
        style.width = `${colWidth.value}px`
        style.visibility = 'visible'

        // 🟢 非修正布局时添加入场动画
        if (!isFix && !props.animationCancel)
          addEnterAnimation(curItem)
      })

      const curSpace = props.space || props.gutter
      posY.value[yIndex] += h + curSpace
    }

    // 更新容器高度
    wrapperHeight.value = Math.max(...posY.value)

    // 🟢 如果是修正模式：直接同步执行写入，不再延迟或动画
    if (isFix) {
      writes.forEach(fn => fn())
      return true
    }

    // 🟢 正常布局：分帧执行，带动画
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        writes.forEach(fn => fn())

        // 第二帧：加动画过渡
        requestAnimationFrame(() => {
          for (const el of items) {
            const style = el.style as CssStyleObject
            if (transition) style[transition] = `transform ${time}s`
          }
          setTimeout(() => resolve(true), props.posDuration)
        })
      })
    })
  }

  return {
    wrapperHeight,
    layoutHandle,
  }
}

// 获取误差范围内的最小Y
function findIndexWithinHeightDifference(arr: number[], heightDifference: number): number {
  if (arr.length === 0) return -1
  const minValue = Math.min(...arr)
  const upperLimit = minValue + heightDifference
  let resultIndex = -1
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= minValue && arr[i] <= upperLimit) {
      resultIndex = i
      break
    }
  }
  return resultIndex
}
