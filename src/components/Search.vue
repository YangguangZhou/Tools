<template>
    <input type="text" v-model="searchText" placeholder="搜索项目">
</template>
  
<script>
export default {
  name: "SearchBar",
  props: ["value"],
  data() {
    // Remove searchText from data
    return {};
  },
  computed: {
    searchText: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
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
  