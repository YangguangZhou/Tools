<template>
  <div class="header">
    <h1>Tools & Projects</h1>
    <h2>Jerry Zhou的工具箱和个人项目</h2>
  </div>
  <div id="app">
    <Navbar />
    <SearchBar v-model="searchText" />
    <div class="projects">
      <ProjectBlock
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
      />
      <div v-if="filteredProjects.length === 0" class="no-results">
        No matching projects found.
      </div>
    </div>
  </div>
</template>
  
<script>
import Navbar from "./components/Navbar.vue";
import SearchBar from "./components/Search.vue";
import ProjectBlock from "./components/ProjectBlock.vue";

export default {
  name: "App",
  components: {
    Navbar,
    SearchBar,
    ProjectBlock,
  },
  data() {
    return {
      searchText: "",
      projects: [
        {
          id: "1",
          title: "项目1",
          description: "这是项目1的描述",
          icon: "https://example.com/icon1.png",
          tags: ["标签1", "标签2"],
        },
        {
          id: "2",
          title: "项目2",
          description: "这是项目2的描述",
          icon: "https://example.com/icon2.png",
          tags: ["标签3", "标签4"],
        },
      ],
    };
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(
        (project) =>
          project.title.includes(this.searchText) ||
          project.tags.some((tag) => tag.includes(this.searchText))
      );
    },
  },
};
</script>
  
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #2c3e50;
  margin-top: 60px;
  padding: 20px;
  background-color: #f5f5f5; /* 浅灰色背景 */
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #34495e; /* 深蓝色 */
  margin-bottom: 10px;
}

.header h2 {
  color: #7f8c8d; /* 淡灰色 */
  font-weight: normal;
}

.projects {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px; /* 项目间距 */
}

.project-block {
  background-color: white;
  padding: 20px;
  border-radius: 10px; /* 圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  width: 300px; /* 统一项目卡片宽度 */
}

.no-results {
  text-align: center;
  width: 100%;
  margin-top: 20px;
  color: #e74c3c; /* 红色突出显示无结果 */
}

.search-bar {
  margin-bottom: 30px; /* 搜索栏与项目间的间距 */
}

/* 搜索栏样式 */
.search-bar input {
  padding: 10px;
  border: 1px solid #bdc3c7; /* 边框颜色 */
  border-radius: 5px; /* 圆角输入框 */
  width: 100%; /* 完整宽度 */
  box-sizing: border-box; /* 防止内边距影响宽度 */
}

/* 适应屏幕大小的响应式设计 */
@media (max-width: 600px) {
  .projects {
    flex-direction: column;
    align-items: center;
  }

  .project-block {
    width: 100%; /* 小屏幕下项目卡片宽度 */
  }

  .search-bar input {
    width: calc(100% - 20px); /* 考虑边距的宽度 */
  }
}

/* 项目卡片内部样式 */
.project-block img {
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
</style>