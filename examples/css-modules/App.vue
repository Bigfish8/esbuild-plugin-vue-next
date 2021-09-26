<template>
    <div :class="moduleClassName.foo">{{ msg }}</div>
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

<style module="moduleClassName">
.foo {
    color: red;
}
</style>
