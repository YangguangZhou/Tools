<template>
  <div class="app-container">
    <div class="header">
      <h1>Tools & Projects</h1>
      <h2>Jerry Zhou的工具箱和个人项目</h2>
    </div>
    <div class="content">
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
  </div>
</template>

<script>
import SearchBar from "./components/Search.vue";
import ProjectBlock from "./components/ProjectBlock.vue";

export default {
  name: "App",
  components: {
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
          icon: "https://jerryz.com.cn/favicon.png",
          tags: ["标签1", "标签2"],
        },
        {
          id: "2",
          title: "项目2",
          description: "这是项目2的描述",
          icon: "https://jerryz.com.cn/favicon.png",
          tags: ["标签3", "标签4"],
        },
        {
          id: "3",
          title: "测试项目",
          description: "这是一个用于测试FontAwesome的项目",
          icon: "fas fa-rocket", // 使用 FontAwesome 图标类
          tags: ["测试", "FontAwesome"],
        },
      ],
    };
  },
  computed: {
    filteredProjects() {
      const lowerSearchText = this.searchText.toLowerCase();
      return this.projects.filter(project => {
        const titleMatch = project.title.toLowerCase().includes(lowerSearchText);
        const descriptionMatch = project.description.toLowerCase().includes(lowerSearchText);
        const tagsMatch = project.tags.some(tag => tag.toLowerCase().includes(lowerSearchText));
        return titleMatch || descriptionMatch || tagsMatch;
      });
    },
  },
};
</script>

<style>
.app-container {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #2c3e50;
  margin: 60px auto;
  max-width: 1200px;
  padding: 40px;
  background-color: #f5f5f5;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #34495e;
  margin-bottom: 10px;
}

.header h2 {
  color: #7f8c8d;
  font-weight: normal;
}

.content {
  padding: 30px; /* 为内容区域添加更多的内边距 */
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.projects {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}

.no-results {
  text-align: center;
  width: 100%;
  margin-top: 20px;
  color: #e74c3c;
}

@media (max-width: 600px) {
  .projects {
    flex-direction: column;
    align-items: center;
  }
}
</style>
