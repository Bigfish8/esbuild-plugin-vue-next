<template>
    <div class="foo">{{ msg }}</div>
</template>

<script lang="ts">
export default {
    setup() {
        return {
            msg: 'Hello world!'
        }
    }
}
</script>

<style scoped>
.foo {
    color: red;
}
</style>
