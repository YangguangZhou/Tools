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
      projects: [], // 从 config.json 中获取的项目数据
    };
  },
  created() {
    fetch('./config.json')
      .then(response => response.json())
      .then(data => {
        this.projects = data.projects
      })
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
}

.projects {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
  