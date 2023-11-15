<template>
  <div class="project-container">
    <div class="project-block">
      <font-awesome-icon
        :icon="project.icon"
        v-if="isFontAwesomeIcon(project.icon)"
      />
      <img :src="project.icon" v-else />
      <h3>{{ project.title }}</h3>
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
  methods: {
    isFontAwesomeIcon(icon) {
      return icon.startsWith("fas");
    },
  },
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
  background-color: white;
  padding: 20px;
  border-radius: 10px; /* 圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  width: 300px; /* 统一项目卡片宽度 */
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
  
