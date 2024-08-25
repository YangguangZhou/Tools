<template>
  <div
    class="project-container"
    @click="goToProjectUrl"
    :title="project.url"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
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
      <div class="views">访问量: {{ project.views }}</div>
    </div>
    <transition name="fade">
      <div
        class="preview-window"
        :style="{ width: previewWidth, height: previewHeight }"
        v-if="showPreview"
      >
        <div class="preview-actions">
          <button @click.stop="openInNewTab">
            <i class="fas fa-external-link-alt"></i>
          </button>
          <button @click.stop="copyLink"><i class="fas fa-copy"></i></button>
        </div>
        <iframe ref="previewFrame" :src="project.url" frameborder="0"></iframe>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProjectBlock",
  props: ["project"],
  data() {
    return {
      showPreview: false,
      previewTimeout: null,
      hoverDelay: 500,
      isMouseOver: false,
      times: 0,
    };
  },
  computed: {
    iconComponent() {
      return this.isFontAwesomeIcon(this.project.icon)
        ? "font-awesome-icon"
        : "img";
    },
    previewWidth() {
      return Math.min(600, window.innerWidth * 0.5) + "px";
    },
    previewHeight() {
      return Math.min(400, window.innerHeight * 0.5) + "px";
    },
  },
  methods: {
    async incrementCounter() {
      const url = "https://counter-sever.jerryz.com.cn/counter";
      const name = "tools-" + this.project.id;
      await axios.post(url, { name });
      this.views++;
    },
    isFontAwesomeIcon(icon) {
      return icon.startsWith("fa");
    },
    tagClicked(event, tag) {
      event.stopPropagation(); // 阻止事件冒泡
      event.preventDefault();
      this.$emit("tag-clicked", tag);
    },
    async goToProjectUrl() {
      this.showPreview = false;
      clearTimeout(this.previewTimeout);
      await this.incrementCounter();
      this.$nextTick(() => {
        window.location.href = this.project.url;
      });
    },
    openInNewTab(event) {
      this.incrementCounter();
      event.stopPropagation();
      clearTimeout(this.previewTimeout);
      window.open(this.project.url, "_blank");
    },
    copyLink(event) {
      this.incrementCounter();
      event.stopPropagation();
      clearTimeout(this.previewTimeout);
      navigator.clipboard.writeText(this.project.url);
    },
    handleMouseOver() {
      this.isMouseOver = true;
      this.previewTimeout = setTimeout(() => {
        if (this.isMouseOver) {
          this.showPreview = true;
        }
      }, this.hoverDelay);
    },
    handleMouseLeave() {
      this.isMouseOver = false;
      clearTimeout(this.previewTimeout);
      this.showPreview = false;
    },
  },
  // mounted() {
  //   this.fetchTimes();
  // },
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
  transition: box-shadow 0.3s ease, transform 0.3s ease; /* 添加过渡效果 */
}

.project-block:hover,
.project-block:focus {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 鼠标悬停或聚焦时增加阴影效果 */
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
  border: 2px solid #c0e2ff;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.tags span {
  margin: 5px;
  padding: 5px 10px;
  background-color: #41a8ff;
  color: #fff;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease; /* 添加过渡效果 */
}

.tags span:hover,
.tags span:focus {
  background-color: #279cff;
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 鼠标悬停或聚焦时增加阴影效果 */
}

.views {
  margin-top: 10px;
  font-size: 14px;
  color: #888;
}

@media (max-width: 768px) {
  .project-block {
    max-width: 75%;
  }
  .preview-window {
    display: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.preview-window {
  position: absolute;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #fff;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: width 0.3s ease, height 0.3s ease;
}
.preview-window iframe {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}
.preview-actions {
  position: absolute;
  top: 15px;
  right: 30px;
}
.preview-actions button {
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 5px;
  margin-left: 5px;
  padding: 5px;
  cursor: pointer;
}
.preview-actions button i {
  color: #666;
}
</style>