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
          @tag-clicked="tagClicked"
        />
        <div v-if="filteredProjects.length === 0" class="no-results">
          未找到匹配的项目。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
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
      projects: [],
    };
  },
  created() {
    axios.get('./projects.json')
      .then(response => {
        this.projects = response.data;
      })
      .catch(error => {
        console.error(error);
      });
  },
  computed: {
    filteredProjects() {
      const lowerSearchText = this.searchText.toLowerCase();
      return this.projects.filter((project) => {
        const titleMatch = project.title
          .toLowerCase()
          .includes(lowerSearchText);
        const descriptionMatch = project.description
          .toLowerCase()
          .includes(lowerSearchText);
        const tagsMatch = project.tags.some((tag) =>
          tag.toLowerCase().includes(lowerSearchText)
        );
        return titleMatch || descriptionMatch || tagsMatch;
      });
    },
  },
  methods: {
    tagClicked(tag) {
      this.searchText = tag;
    },
  },
};
</script>

<style>
.app-container {
  font-family: "Segoe UI", Arial, sans-serif;
  color: #333;
  margin: 30px auto;
  max-width: 1200px;
  padding: 20px;
  background-color: #fff;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #279cff; /* 更亮的蓝色 */
  margin-bottom: 15px;
}

.header h2 {
  color: #6c757d; /* 柔和的灰色 */
  font-weight: normal;
}

.content {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.projects {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.no-results {
  text-align: center;
  width: 100%;
  margin-top: 15px;
  color: #f17162; /* 更鲜艳的红色 */
}

@media (max-width: 768px) {
  .projects {
    flex-direction: column;
    align-items: center;
  }
}
</style>