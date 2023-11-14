<template>
    <input type="text" v-model="searchText" placeholder="搜索项目">
</template>

<script>
export default {
  name: "SearchBar",
  props: ["value"], // 确保父组件传递了 value 属性
  data() {
    return {
      searchText: this.value, // 在组件的本地数据中声明 searchText
    };
  },
  watch: {
    value(newVal) {
      this.searchText = newVal; // 监听 value 的变化
    }
  },
  methods: {
    updateValue(value) {
      this.$emit("input", value); // 发出事件以更新父组件的值
    }
  }
};
</script>

<style scoped>
input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
