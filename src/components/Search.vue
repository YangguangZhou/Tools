<template>
  <input
    type="text"
    v-model="searchText"
    placeholder="搜索项目"
    @input="updateValue"
  />
</template>

<script>
export default {
  name: "SearchBar",
  props: ["value"],
  data() {
    return {
      searchText: this.value,
    };
  },
  watch: {
    value(newVal) {
      this.searchText = newVal;
    }
  },
  methods: {
    updateValue() {
      this.$emit("input", this.searchText);
    },
  },
};
</script>

<style scoped>
input {
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  outline-color: #279cff; /* 焦点颜色 */
}
</style>