<template>
  <div class="app-container">
    <div class="header">
      <h1>Tools & Projects</h1>
      <h2>Jerry Zhou的工具箱和个人项目</h2>
      <p>边框为蓝色表示是Jerry Zhou自己搭建或部署的项目</p>
    </div>
    <div class="content">
      <input
        type="text"
        placeholder="搜索项目"
        v-model="searchText"
      />
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
  <div class="counter">
    <span id="busuanzi_value_page_pv"><i class="el-icon-loading"></i></span> Views |
    <span id="busuanzi_value_site_uv"><i class="el-icon-loading"></i></span> Viewers
  </div>
  <div class="copyright">
    Copyright &copy; 2023 <a href="https://jerryz.com.cn" target="_blank">Jerry Zhou</a>
    <br/>
    <a href="https://github.com/YangguangZhou/Tools" target="_blank">GitHub</a>
  </div>
</template>

<script>
import axios from "axios";
import ProjectBlock from "./components/ProjectBlock.vue";

export default {
  name: "App",
  components: {
    ProjectBlock,
  },
  data() {
    return {
      searchText: "",
      projects: [],
    };
  },
  created() {
    axios
      .get("./projects.json")
      .then((response) => {
        this.projects = response.data;
      })
      .catch((error) => {
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
        const urlMatch = project.url
          .toLowerCase()
          .includes(lowerSearchText);
        const tagsMatch = project.tags.some((tag) =>
          tag.toLowerCase().includes(lowerSearchText)
        );
        return titleMatch || descriptionMatch || tagsMatch || urlMatch;
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
/* @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&display=swap');

* {
    font-family: "EB Garamond",  "Noto Serif SC" , "simsun", songti sc, microsoft yahei, serif;
} */

.app-container {
  font-family: "Segoe UI", Arial, sans-serif;
  color: #333;
  margin: 30px auto;
  max-width: 1200px;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #279cff;
  margin-bottom: 15px;
}

.header h2 {
  color: #6c757d;
  font-weight: normal;
}

.header p {
  color: #888;
  font-weight: normal;
}

input {
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  outline-color: #279cff;
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
  color: #f17162;
}

.copyright {
    text-align: center;
    margin: 15px 0;
    color: #999;
    font-size: 14px;
}

.copyright a {
    text-decoration: none;
    font-weight: bold;
    color: unset;
    transition: opacity .2s;
}

.copyright a:hover {
    opacity: .5;
}

.counter {
    text-align: center;
    margin-top: 10px;
    color: #999;
    font-size: 14px;
}

@media (max-width: 768px) {
  .projects {
    flex-direction: column;
    align-items: center;
  }
}
</style>