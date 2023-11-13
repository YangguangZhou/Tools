<template>
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
          "id": "1",
          "title": "项目1",
          "description": "这是项目1的描述",
          "icon": "https://example.com/icon1.png",
          "tags": [
            "标签1",
            "标签2"
          ]
        },
        {
          "id": "2",
          "title": "项目2",
          "description": "这是项目2的描述",
          "icon": "https://example.com/icon2.png",
          "tags": [
            "标签3",
            "标签4"
          ]
        }
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
  }
  
};
</script>
  
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #2c3e50;
  margin-top: 60px;
  padding: 20px;
}

.projects {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.no-results {
  text-align: center;
  width: 100%;
  margin-top: 20px;
  color: #e74c3c; /* Red color for emphasis */
}
</style>