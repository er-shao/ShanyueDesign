<template>
    <div class="header-box">
        <div class="left flex-center">
            <img class="logo no-seletion" src="/logo.png" />
            <div class="px-5px no-seletion">
                <div style="width: max-content">
                    <span class="block font-bold">{{ $t('sloganName') }}</span>
                </div>
            </div>
            <a-divider direction="vertical" />
            <file-popover />
            <a-divider direction="vertical" />
            <undo-redo />
            <a-divider direction="vertical" />
            <ruler-unit v-if="rulerEnabled" />
            <a-divider direction="vertical" v-if="rulerEnabled" />
            <operation />
            <a-divider direction="vertical" />
            <gridlines />
            <a-divider direction="vertical" />
            <zoom />
        </div>
        <div class="center">
            <tool-bar />
        </div>
        <div class="right">
            <save-oper />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useLeaferEditor } from '../../index';

import filePopover from './components/filePopover.vue'
import undoRedo from './components/undoRedo.vue'
import rulerUnit from './components/rulerUnit.vue';
import operation from "./components/operation.vue";
import gridlines from "./components/gridlines.vue";
import zoom from "./components/zoom.vue";
import toolBar from "./components/toolBar.vue";
import saveOper from "./components/saveOper.vue";

const editor = useLeaferEditor()
const rulerEnabled = ref(editor.ruler.enabled)

</script>

<style scoped lang="less">
@import "../styles/layouts.less";

.header-box {
    // height: @header-height;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;

    .left {
        --color-secondary-disabled: #ffffff;
        --color-secondary: #fff;
        height: 100%;
        justify-items: start;

        .logo {
            width: 25px;
            height: 25px;
            // margin-left: 10px;
        }

        :deep(.arco-btn-size-medium) {
            // width: 20px;
            padding: 0 4px;
        }
    }

    .center {
        --color-secondary-disabled: #ffffff;
        --color-secondary: #fff;
        height: 100%;

        :deep(.arco-btn-size-medium) {
            padding: 0 4px;
        }
    }

    .right {

        // height: 100%;
        :deep(.arco-btn-size-medium) {
            padding: 0 10px;
        }

        @media (max-width: 1280px) {
            :deep(.arco-btn-size-medium) {
                padding: 0 4px;
            }
        }
    }
}
</style>
