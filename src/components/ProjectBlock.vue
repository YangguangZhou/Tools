<template>
  <div class="project-container">
    <div class="project-block">
      <component :is="iconComponent" :icon="project.icon" v-if="isFontAwesomeIcon(project.icon)" />
      <img :src="project.icon" v-else class="project-image" />
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
  computed: {
    iconComponent() {
      return this.isFontAwesomeIcon(this.project.icon) ? 'font-awesome-icon' : 'img';
    }
  },
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
  border-radius: 10px;
  padding: 10px;
  margin: 15px;
}

.project-block {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.project-image {
  max-width: 100%; /* 确保图片不超过容器宽度 */
  height: auto; /* 保持原始宽高比 */
  display: block; /* 防止默认的内联元素间距 */
  margin: 0 auto; /* 居中显示 */
}

.project-block img, .project-block .font-awesome-icon {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin-bottom: 15px;
}

.project-icon {
  max-width: 100%; /* 确保图片不会超出容器宽度 */
  height: auto; /* 保持图片的原始宽高比 */
}

.project-block h3 {
  color: #34495e;
}

.project-block p {
  color: #7f8c8d;
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
