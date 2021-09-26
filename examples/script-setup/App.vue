<template>
    <div>{{ state }}</div>
    <button @click="changeState">changeState</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
let state = ref(true)
const changeState = () => (state.value = !state.value)
</script>
