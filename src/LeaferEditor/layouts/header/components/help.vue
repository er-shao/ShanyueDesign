<template>
    <a-popover trigger="click" position="rt">
        <div>
            <slot />
        </div>
        <template #content>
            <div style="width: 450px">
                <a-tabs>
                    <a-tab-pane key="1">
                        <template #title>
                            <icon-command />
                            {{ $t('header.help.shortcuts') }}
                        </template>
                        <a-scrollbar style="height:400px;overflow: auto;">
                            <div>
                                <a-descriptions v-for="item in datas" :key="item.key" :label-style="labelStyle"
                                    :data="item.data" :title="item.title" :column="1" />
                            </div>
                        </a-scrollbar>
                    </a-tab-pane>
                    <a-tab-pane key="2">
                        <template #title>
                            <icon-customer-service />
                            {{ $t('header.help.about') }}
                        </template>
                        <a-scrollbar style="height:400px;overflow: auto;">
                            <div>
                                {{ $t('header.help.about-text') }}
                            </div>
                        </a-scrollbar>
                    </a-tab-pane>
                </a-tabs>
            </div>
        </template>
    </a-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const labelStyle = { width: '140px' }

const datas = computed(() => [
    {
        key: 'common',
        title: t('header.help.datas.common'),
        data: [
            {
                label: t('header.help.datas.copy'),
                value: 'Ctrl + C',
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.paste'),
                value: 'Ctrl + V',
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.cut'),
                value: 'Ctrl + X',
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.allSelect'),
                value: 'Ctrl + A',
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.undo'),
                value: 'Ctrl + Z',
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.redo'),
                value: 'Ctrl + Y / Ctrl + Shift + Z',
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.delete'),
                value: 'Delete / Backspace',
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.escape'),
                value: 'ESC',
                describe: 'Jane Doe',
            },
        ]
    },
    {
        key: 'canvas',
        title: t('header.help.datas.canvas'),
        data: [
            {
                label: t('header.help.datas.moveCanvas'),
                value: t('header.help.datas.moveCanvasInfo'),
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.zoomCanvas'),
                value: t('header.help.datas.zoomCanvasInfo'),
                describe: 'Jane Doe',
            },
        ]
    },
    {
        key: 'item',
        title: t('header.help.datas.item'),
        data: [
            {
                label: t('header.help.datas.select'),
                value: t('header.help.datas.selectInfo'),
                describe: 'Jane Doe',
            },
            {
                label: t('header.help.datas.moveDown'),
                value: '[',
            },
            {
                label: t('header.help.datas.moveUp'),
                value: ']',
            },
            {
                label: t('header.help.datas.moveToBottom'),
                value: 'Ctrl + [',
            },
            {
                label: t('header.help.datas.moveToTop'),
                value: 'Ctrl + ]',
            },
            {
                label: t('header.help.datas.group'),
                value: 'Ctrl + G',
            },
            {
                label: t('header.help.datas.ungroup'),
                value: 'Ctrl + Shift + G',
            },
            {
                label: t('header.help.datas.lock-unlock'),
                value: 'L',
            },
            {
                label: t('header.help.datas.horizontalFlip'),
                value: 'Shift + H',
            },
            {
                label: t('header.help.datas.verticalFlip'),
                value: 'Shift + V',
            },
            {
                label: t('header.help.datas.move'),
                value: '[Shift] + ↑ / ↓ / ← / → / w / a / s / d ',
            },
        ]
    },
    {
        key: 'gridlines',
        title: t('header.help.datas.gridlines'),
        data: [
            {
                label: t('header.help.datas.showOrHide'),
                value: 'H',
            },
            {
                label: t('header.help.datas.enableOrdisable'),
                value: 'Ctrl + H',
            },
        ]
    },
    {
        key: 'zoom',
        title: t('header.help.datas.zoom'),
        data: [
            {
                label: t('header.help.datas.zoomIn'),
                value: '+',
            },
            {
                label: t('header.help.datas.zoomOut'),
                value: '-',
            },
            {
                label: t('header.help.datas.percent100'),
                value: 'Ctrl + 1',
            },
            {
                label: t('header.help.datas.percent50'),
                value: '0 0',
            },
            {
                label: t('header.help.datas.zoomFit'),
                value: 'Ctrl + 0',
            },
        ]
    },
    {
        key: 'mode',
        title: t('header.help.datas.mode'),
        data: [
            {
                label: t('header.help.datas.selectMode'),
                value: 'v',
            },
            {
                label: t('header.help.datas.previewMode'),
                value: 'm',
            },
            {
                label: t('header.help.datas.pencilMode'),
                value: 'p',
            },
        ]
    }
])
</script>
