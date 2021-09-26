<template>
    <CompA />
    <CompB />
</template>

<script lang="ts">
import CompA from './CompA.vue'
import CompB from './CompB.vue'
export const msg = 'Hello world!'
export default {
    components: {
        CompA,
        CompB
    }
}
</script>
