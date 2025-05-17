<template>
  <div
    class="project-container"
    @click="goToProjectUrl"
    :title="project.url"
    @mouseover="handleCardMouseOver"
    @mouseleave="handleCardMouseLeave"
  >
    <div class="project-block" :class="{ 'mine-border': project.mine }">
      <div class="project-header">
        <component
          :is="iconComponent"
          :icon="project.icon"
          v-if="isFontAwesomeIcon(project.icon)"
          class="project-image"
          style="color: #3b82f6"
        />
        <!-- Apply color style for SVGs that might use currentColor -->
        <img 
          :src="project.icon" 
          v-else 
          class="project-image"
          :style="project.icon && project.icon.endsWith('.svg') ? { color: '#3b82f6' } : {}" 
        />
        <h3>{{ project.title }}</h3>
      </div>
      <p class="project-description">{{ project.description }}</p>
      <div class="tags">
        <span
          v-for="tag in project.tags"
          :key="tag"
          @click="tagClicked($event, tag)"
          :title="tag"
        >
          <i class="fas fa-tag"></i> {{ tag }}
        </span>
      </div>
      <div class="views">
        <i class="fas fa-eye"></i> 访问量: {{ project.views }}
      </div>
    </div>
    <transition name="fade">
      <div
        class="preview-window"
        :style="previewStyle"
        v-if="showPreview"
        @mouseover="handlePreviewMouseOver"
        @mouseleave="handlePreviewMouseLeave"
      >
        <div class="preview-header">
          <div class="preview-title-section">
            <div class="preview-title">{{ project.title }}</div>
            <div class="preview-url" :title="project.url">{{ project.url }}</div>
          </div>
          <div class="preview-actions">
            <button @click.stop="openInNewTab" title="在新标签页打开">
              <i class="fas fa-external-link-alt"></i>
            </button>
            <button @click.stop="copyLink" title="复制链接">
              <i class="fas fa-copy"></i>
            </button>
          </div>
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
      previewStyle: {},
      hoverDelay: 500, // Time to wait before showing preview
      
      cardHoverTimeout: null,
      previewHideTimeout: null,
      
      isMouseOverCard: false,
      isMouseOverPreview: false,
      
      latestMouseEvent: null, // To store mouse event for positioning
    };
  },
  computed: {
    iconComponent() {
      return this.isFontAwesomeIcon(this.project.icon)
        ? "font-awesome-icon"
        : "img";
    },
    previewWidth() {
      return Math.min(600, window.innerWidth * 0.8) + "px"; // 稍微调整宽度计算
    },
    previewHeight() {
      return Math.min(400, window.innerHeight * 0.7) + "px"; // 稍微调整高度计算
    },
    numericPreviewWidth() {
      return parseInt(this.previewWidth);
    },
    numericPreviewHeight() {
      return parseInt(this.previewHeight);
    }
  },
  methods: {
    async incrementCounter() {
      const url = "https://counter-sever.jerryz.com.cn/counter";
      const name = "tools-" + this.project.id;
      // console.log('Incrementing counter for:', name); // For debugging
      await axios.post(url, { name });
      // It seems `this.views++` was removed, but project.views is passed as prop.
      // To reflect view changes immediately, we might need to emit an event or handle state differently.
      // For now, assuming the parent list re-fetches or this is handled.
      // If project is an object, this.project.views++ might work if it's not strictly uni-directional flow.
      if (this.project && typeof this.project.views !== 'undefined') {
        this.project.views++;
      }
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
      clearTimeout(this.cardHoverTimeout);
      clearTimeout(this.previewHideTimeout);
      await this.incrementCounter();
      this.$nextTick(() => {
        window.location.href = this.project.url;
      });
    },
    openInNewTab(event) {
      this.showPreview = false;
      clearTimeout(this.cardHoverTimeout);
      clearTimeout(this.previewHideTimeout);
      this.incrementCounter();
      event.stopPropagation();
      window.open(this.project.url, "_blank");
    },
    copyLink(event) {
      this.showPreview = false;
      clearTimeout(this.cardHoverTimeout);
      clearTimeout(this.previewHideTimeout);
      event.stopPropagation();
      navigator.clipboard.writeText(this.project.url);
    },

    handleCardMouseOver(event) {
      this.isMouseOverCard = true;
      this.latestMouseEvent = event; // Store the most recent event for positioning
      
      clearTimeout(this.previewHideTimeout); // Cancel any pending hide operations

      if (this.showPreview) { // If preview is already showing, do nothing
        return;
      }

      clearTimeout(this.cardHoverTimeout); // Clear previous hover timeout
      this.cardHoverTimeout = setTimeout(() => {
        if (this.isMouseOverCard) { // Check if mouse is still over the card
          const e = this.latestMouseEvent; // Use the stored mouse event
          const mouseX = e.clientX;
          const mouseY = e.clientY;
          const offsetX = 15; 
          const offsetY = 15;

          let newLeft = mouseX + offsetX;
          let newTop = mouseY + offsetY;

          const previewW = this.numericPreviewWidth;
          const previewH = this.numericPreviewHeight;
          const viewportW = window.innerWidth;
          const viewportH = window.innerHeight;

          if (newLeft + previewW > viewportW - offsetX) { // Adjust boundary check
            newLeft = mouseX - previewW - offsetX;
          }
          if (newTop + previewH > viewportH - offsetY) { // Adjust boundary check
            newTop = mouseY - previewH - offsetY;
          }

          if (newLeft < offsetX) newLeft = offsetX; // Adjust boundary check
          if (newTop < offsetY) newTop = offsetY; // Adjust boundary check
          
          this.previewStyle = {
            top: newTop + 'px',
            left: newLeft + 'px',
            width: this.previewWidth,
            height: this.previewHeight,
          };
          this.showPreview = true;
        }
      }, this.hoverDelay);
    },

    handleCardMouseLeave() {
      this.isMouseOverCard = false;
      clearTimeout(this.cardHoverTimeout); // Cancel pending show if mouse leaves early
      this.tryHidePreview();
    },

    handlePreviewMouseOver() {
      this.isMouseOverPreview = true;
      clearTimeout(this.previewHideTimeout); // Cancel pending hide
    },

    handlePreviewMouseLeave() {
      this.isMouseOverPreview = false;
      this.tryHidePreview();
    },

    tryHidePreview() {
      clearTimeout(this.previewHideTimeout); // Clear any existing hide timeout
      this.previewHideTimeout = setTimeout(() => {
        if (!this.isMouseOverCard && !this.isMouseOverPreview) {
          if (this.showPreview) {
            this.incrementCounter(); // Increment views when preview is hidden
          }
          this.showPreview = false;
        }
      }, 100); // A small delay to allow mouse to move between card and preview
    }
  },
};
</script>

<style scoped>
.project-container {
  position: relative;
  margin: 10px;
  cursor: pointer;
}

.project-container:hover {
}

.project-block {
  background-color: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 320px;
  max-width: 100%;
  margin: auto;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.project-block:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  transform: translateZ(10px) translateY(-5px); /* Added translateY here for a lift effect */
}

.project-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.project-image {
  width: 36px;
  height: 36px; /* Ensure consistent height */
  padding: 8px;
  background-color: #f3f4f6;
  border-radius: 12px;
  box-sizing: border-box; /* Ensure padding is included in width/height */
  display: flex; /* For centering content */
  align-items: center; /* For centering content */
  justify-content: center; /* For centering content */
}

/* Specific styles for img elements acting as project icons */
img.project-image {
  object-fit: contain; /* Scale image to fit within the box, maintain aspect ratio */
  /* The color style is applied inline for SVGs using currentColor */
}

.project-block h3 {
  color: #3b82f6;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.2;
}

.project-description {
  color: #4b5563;
  margin-bottom: 20px;
  line-height: 1.5;
  flex-grow: 1;
}

.mine-border {
  border: 2px solid #c0e2ff;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.12);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: auto;
  padding-top: 8px;  /* 减少顶部间距，原为15px */
}

.tags span {
  margin: 3px;  /* 减少标签间距，原为5px */
  padding: 4px 10px;  /* 减少内部填充，原为6px 12px */
  background-color: #e0f2fe;
  color: #3b82f6;
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.tags span i {
  margin-right: 4px;
  font-size: 0.75rem;
}

.tags span:hover {
  background-color: #3b82f6;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
}

.views {
  margin-top: 10px;  /* 减少与标签的距离，原为15px */
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.views i {
  margin-right: 5px;
  color: #3b82f6;
}

@media (max-width: 768px) {
  .project-block {
    width: 280px;
    padding: 20px;
  }

  .preview-window {
    display: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); /* 调整动画曲线和时长 */
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.preview-window {
  position: fixed; 
  border-radius: 12px;
  background: #fff;
  z-index: 10000; 
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25); 
  overflow: hidden;
  pointer-events: none; /* Base element non-interactive */
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px; /* Adjusted padding */
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  pointer-events: auto; 
}

.preview-title-section {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* For text ellipsis */
  margin-right: 10px; /* Space before actions */
}

.preview-title {
  font-weight: 600;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-url {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.preview-window iframe {
  width: 100%;
  height: calc(100% - 40px);
  pointer-events: auto; /* 允许与iframe交互 */
}

.preview-actions {
  display: flex;
  flex-shrink: 0; /* Prevent actions from shrinking */
}

.preview-actions button {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-left: 5px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto; /* 确保按钮可以点击 */
}

.preview-actions button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.preview-actions button i {
  color: #4b5563;
}

/* 添加进入退出动画 */
@keyframes cardPop {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.project-block {
  animation: cardPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>