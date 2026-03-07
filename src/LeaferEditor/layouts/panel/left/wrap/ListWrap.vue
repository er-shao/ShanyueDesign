<template>
    <div class="wrap">
        TODO: TempListWrap1
        <a-menu mode="inline" :default-selected-keys="['1']">
            <a-menu-item key="1" @click="to('/')">Home</a-menu-item>
            <a-menu-item key="2" @click="to('/about')">About</a-menu-item>
            <a-menu-item key="3" @click="to('/editor')">Editor</a-menu-item>
            <a-menu-item key="4" @click="to('/test')">Test</a-menu-item>
        </a-menu>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';


const router = useRouter();

const to = (path: string) => {
    router.push(path);
}

</script>

<style lang="less" scoped></style>
