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
          @click="tagClicked($$event, tag)"
          :title="tag"
        >
          {{ tag }}
        </span>
      </div>
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
      const url = "https://g3rvbpemgm.us.aircode.run/counter";
      const name = "tools-" + this.project.id;
      await axios.post(url, { name });
    },
    isFontAwesomeIcon(icon) {
      return icon.startsWith("fa");
    },
    tagClicked(event, tag) {
      event.stopPropagation();
      event.preventDefault();
      this.$$emit("tag-clicked", tag);
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
};
</script>

<style scoped>
:root {
  --primary-color: #279cff;
  --secondary-color: #2180d8;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #e0e0e0;
}

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
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-width: 100%;
  margin: auto;
  transition: all 0.3s ease;
}

.project-block:hover,
.project-block:focus {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.project-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 1rem;
}

.project-image {
  width: 40px;
  height: auto;
}

.project-block h3 {
  color: var(--primary-color);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.project-block p {
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.mine-border {
  border: 2px solid var(--primary-color);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0.5rem;
}

.tags span {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.tags span:hover,
.tags span:focus {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(39, 156, 255, 0.3);
}

@media (max-width: 680px) {
  .project-block {
    width: 95%;
    padding: 1rem;
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
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: white;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preview-window iframe {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.preview-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.preview-actions button {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-actions button:hover {
  background-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(39, 156, 255, 0.3);
}

.preview-actions button i {
  color: var(--text-color);
}

.preview-actions button:hover i {
  color: white;
}
</style>