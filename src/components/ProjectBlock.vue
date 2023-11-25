<template>
  <div class="project-container" @click="goToProjectUrl" :title="project.url">
    <div class="project-block" :class="{ 'mine-border': project.mine }">
      <div class="project-header">
        <component
          :is="iconComponent"
          :icon="project.icon"
          v-if="isFontAwesomeIcon(project.icon)"
          class="project-image"
          style="color: #888"
        />
        <img :src="project.icon" v-else class="project-image" />
        <h3>{{ project.title }}</h3>
      </div>
      <p>{{ project.description }}</p>
      <div class="tags">
        <span
          v-for="tag in project.tags"
          :key="tag"
          @click="tagClicked($event, tag)"
          :title="tag"
        >
          {{ tag }}
        </span>
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
      return this.isFontAwesomeIcon(this.project.icon)
        ? "font-awesome-icon"
        : "img";
    },
  },
  methods: {
    isFontAwesomeIcon(icon) {
      return icon.startsWith("fa");
    },
    tagClicked(event, tag) {
      event.stopPropagation(); // 阻止事件冒泡
      event.preventDefault();
      this.$emit("tag-clicked", tag);
    },
    goToProjectUrl() {
      window.location.href = this.project.url;
    },
  },
};
</script>

<style scoped>
.project-container {
  margin: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.project-container:hover {
  transform: scale(1.05);
}

.project-block {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 300px;
  max-width: 100%;
  margin: auto;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.project-image {
  width: 30px;
  height: auto;
  /* border-radius: 50%; */
}

.project-block h3 {
  color: #279cff;
  margin: 0;
}

.project-block p {
  color: #6c757d;
}

.mine-border {
  border-radius: 10px;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); */
  border: 2px solid #C0E2FF;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.tags span {
  margin: 5px;
  padding: 5px 10px;
  background-color: #41A8FF;
  color: #fff;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.tags span:hover {
  background-color: #279CFF;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .project-block {
    max-width: 90%;
  }
}
</style>