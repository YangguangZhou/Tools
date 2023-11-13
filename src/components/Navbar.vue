<template>
  <nav>
    <button><i class="fas fa-search"></i> 搜索</button>
    <button><i class="fas fa-home"></i> 主页</button>
    <button><i class="fas fa-donate"></i> 赞助</button>
  </nav>
</template>
  
<script>
export default {
  name: "Navbar",
};
</script>
  
<style scoped>
nav {
  position: fixed;
  top: 0;
  right: 0;
  padding: 20px;
  background-color: #2c3e50;
}

button {
  margin-left: 10px;
  color: #fff;
  background-color: transparent;
  border: none;
  cursor: pointer;
}
</style>
  