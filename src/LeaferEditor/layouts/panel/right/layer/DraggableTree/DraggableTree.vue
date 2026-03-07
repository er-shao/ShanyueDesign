<template>
  <draggable v-model="items" :animation="200" group="nested" item-key="id" @change="onChange" @start="onStart"
    @end="onEnd">
    <template #item="{ element }">
      <div class="tree-node" :style="{ marginLeft: props.depth > 0 ? `${props.depthMarginLeft}px` : '' }">
        <div @contextmenu="handleContextMenu($event, element)" @click.stop="handleNodeClick($event, element)"
          class="node-content" :class="{
            'group-node': !!element.children,
            'collapsed': isExpandedMap[element.id] && !!element.children,
            'selected': selectedKeys.includes(element.id),
            'selectable': props.selectable,
            [props.contentClass]: props.contentClass,
            [element.itemClass]: element.itemClass,
          }">
          <div class="info">
            <!-- 展开/收起图标 -->
            <span v-if="element.children?.length" class="toggle-icon" @click.stop="handleToggleClick($event, element)">
              {{ isExpandedMap[element.id] ? '▼' : '▶' }}
            </span>
            <span v-else class="toggle-placeholder"></span>
            <!-- 缩略图 -->
            <div v-if="element.thumbnailURL" style="width: 30px; height: 30px;">
              <img class="thumbnail" :src="element.thumbnailURL"
                style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <!-- 节点内容 -->
            <div class="node-header">
              <span class="node-text">{{ element.label }}</span>
            </div>
          </div>
          <!-- 节点操作按钮 -->
          <div class="actions-container">
            <slot name="actions" :node="element"></slot>
          </div>
        </div>
        <div v-if="element.children?.length && isExpandedMap[element.id]" class="children-container"
          :class="{ [element.itemClass]: element.itemClass }">
          <draggable-tree v-model:items="element.children" v-model:selected-keys="selectedKeys"
            :selectable="props.selectable" :default-expanded="props.defaultExpanded" :depth="props.depth + 1"
            :depth-margin-left="props.depthMarginLeft" :parentID="element.id" :content-class="props.contentClass"
            @drag-change="(e, items, parentId) => emit('drag-change', e, items, parentId)"
            @drag-start="(e, items, parentId) => emit('drag-start', e, items, parentId)"
            @drag-end="(e, items, parentId) => emit('drag-end', e, items, parentId)"
            @toggle="(e, node) => emit('toggle', e, node)" @select="(e, keys) => emit('select', e, keys)"
            @contextmenu="(e, node) => emit('contextmenu', e, node)">
            <template v-slot:actions="slotProps">
              <slot name="actions" v-bind="slotProps"></slot>
            </template>
          </draggable-tree>
        </div>
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';

type TreeNode = {
  id: number | string;
  label: string;
  children?: TreeNode[];
  thumbnailURL?: string;
  itemClass?: string;
};
defineSlots<{
  actions(props: {
    node: TreeNode;
  }): any // 或更具体的类型，如 { item: ItemType }
}>()

const props = withDefaults(defineProps<{
  items: TreeNode[];
  selectedKeys?: (number | string)[];
  selectable?: boolean;
  defaultExpanded?: boolean;
  depth?: number;
  depthMarginLeft?: number;
  parentID?: string | null; // 用于拖拽事件标识
  contentClass?: string; // 节点内容样式类
}>(), {
  selectedKeys: () => [],
  selectable: true,
  defaultExpanded: true,
  depth: 0,
  depthMarginLeft: 10,
  parentID: null,
  contentClass: ''
});

const emit = defineEmits([
  'update:items',
  'update:selectedKeys',
  'drag-change',
  'drag-start',
  'drag-end',
  'toggle',
  'select',
  'contextmenu',
]);

// 双向绑定 items
const items = computed({
  get: () => props.items,
  set: (val) => emit('update:items', val)
});

// 双向绑定 selectedKeys
const selectedKeys = computed({
  get: () => props.selectedKeys,
  set: (val) => emit('update:selectedKeys', val)
});

// 展开状态（内部 UI 状态）
// const defaultExpanded = ref(props.defaultExpanded);
const isExpandedMap = ref((() => {
  const map: { [key: string]: boolean } = {}
  props.items.forEach(item => {
    map[item.id] = props.defaultExpanded;
  });
  return map;
})())


// 节点点击处理
function handleNodeClick(e: MouseEvent, node: TreeNode) {
  if (!props.selectable) return;
  let newKeys: (number | string)[];
  if (e.shiftKey) {
    // shift 多选（简单追加，可按需改为范围选择）
    newKeys = [...selectedKeys.value, node.id];
  } else {
    if (selectedKeys.value.includes(node.id)) {
      newKeys = selectedKeys.value.filter(id => id !== node.id);
    } else {
      newKeys = [node.id];
    }
  }
  selectedKeys.value = newKeys;
  emit('select', e, newKeys);
}
const handleContextMenu = (e: MouseEvent, node: TreeNode) => {
  e.preventDefault();
  e.stopPropagation();
  emit('contextmenu', e, node);
}

// 展开/折叠


function handleToggleClick(e: MouseEvent, node: TreeNode) {
  isExpandedMap.value[node.id] = !isExpandedMap.value[node.id] || !props.defaultExpanded;
  emit('toggle', e, node);
}

// 拖拽事件
function onChange(e: any) {
  emit('drag-change', e, props.items, props.parentID);
}
function onStart(e: any) {
  emit('drag-start', e, props.items, props.parentID);
}
function onEnd(e: any) {
  emit('drag-end', e, props.items, props.parentID);
}
</script>

<style scoped lang="less">
.tree-node {
  // margin-bottom: 4px;
  user-select: none;
  // padding: 0 10px;
}

.node-content {
  // background-color: #f9f9f9;
  border-left: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  // border-radius: 4px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-height: 40px;
  gap: 8px;

  &:hover {
    background-color: #f0f8ff;
    border-color: #c0d9ff;
  }

  .info {
    display: flex;
    align-items: center;
    justify-content: start;
    flex: 1;
    max-width: 100%;

    .thumbnail {
      border: 1px solid #e0e0e0b0;
    }
  }

  .actions-container {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    // gap: 8px;
    // padding: 0 10px;
    height: 100%;
  }

  &.group-node {
    // background-color: #eff3f7;
    border-left: 4px solid #e1e1e1;
  }


  &.collapsed {
    background-color: #f5f5f5;
    border-color: #d9d9d9;
  }

  /* 选中状态 */
  &.selected {
    background-color: #e6f7ff;
    border-color: #188fffa8;
    /* border-width: 2px; */
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  }

  &.selectable {
    cursor: pointer;
  }

  &.selectable:hover {
    background-color: #f0f8ff;
  }

  .toggle-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 12px;
    color: #666;
    transition: transform 0.2s ease;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      color: #1890ff;
      transform: scale(1.1);
    }
  }

  .toggle-placeholder {
    width: 20px;
    height: 20px;
    display: inline-block;
    flex-shrink: 0;
  }

  .node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    gap: 8px;
    padding: 6px;
    max-width: 70%;

    .node-text {
      flex: 1;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

}

:deep(.arco-btn-secondary, .arco-btn-secondary[type='button'], .arco-btn-secondary[type='submit']) {
  background-color: transparent;
}
</style>