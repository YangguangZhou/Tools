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

/* 项目卡片内部样式 */
.project-block img,font-awesome-icon {
  max-width: 100%;
  height: auto;
  border-radius: 5px; /* 图片圆角 */
  margin-bottom: 15px;
}

.project-block h3 {
  margin-top: 0;
  color: #34495e; /* 标题颜色 */
}

.project-block p {
  color: #7f8c8d; /* 描述文字颜色 */
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
  
