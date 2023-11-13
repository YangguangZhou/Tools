<template>
  <div class="project-container">
    <div class="project-block">
      <img :src="project.icon" alt="项目图标" />
      <h2>{{ project.title }}</h2>
      <p>{{ project.description }}</p>
      <div class="tags">
        <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  name: "ProjectBlock",
  props: ["project"],
};
</script>
  
<style scoped>
.project-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  /* 其他样式属性 */
}
.project-block {
  width: 200px;
  margin: 10px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  text-align: center;
}

.project-block img {
  width: 50px;
  height: 50px;
}

.project-block h2 {
  font-size: 20px;
  color: #2c3e50;
}

.project-block p {
  font-size: 14px;
  color: #95a5a6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.tags span {
  margin: 5px;
  padding: 5px;
  background-color: #3498db;
  color: #fff;
  border-radius: 5px;
}
</style>
  