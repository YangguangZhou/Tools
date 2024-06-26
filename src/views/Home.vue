<template>
  <div class="app-container">
    <div class="header">
      <h1>Tools & Projects</h1>
      <h2>一些有趣的工具和项目</h2>
      <p>边框为蓝色表示是Jerry Zhou自己搭建或部署的项目</p>
    </div>
    <div class="content">
      <input type="text" placeholder="搜索项目" v-model="searchText" />
      <div class="sort-container">
        <select
          id="sort"
          class="sort-select"
          v-model="sortMethod"
          @change="sortProjects"
        >
          <option value="recommended">推荐排序</option>
          <option value="random">随机排序</option>
        </select>
      </div>
      <div v-if="isLoading" class="isLoading">加载中...</div>
      <div v-else>
        <div class="projects">
          <ProjectBlock
            v-for="project in filteredProjects"
            :key="project.id"
            :project="project"
            @tag-clicked="tagClicked"
          />
          <div v-if="filteredProjects.length === 0" class="no-results">
            未找到匹配的项目
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="counter">
    <span id="busuanzi_value_page_pv"><i class="el-icon-loading"></i></span>
    Views |
    <span id="busuanzi_value_site_uv"><i class="el-icon-loading"></i></span>
    Viewers
  </div>
  <div class="copyright">
    <p>点击项目可以直接跳转到对应的网站</p>
    <p>鼠标在方框上停留可以预览项目网站</p>
    <p>点击标签可以查找相同标签的内容</p>
    <a href="https://github.com/YangguangZhou/Tools/issues" target="_blank"
      >申请收录</a
    >
    |
    <a href="https://github.com/YangguangZhou/Tools" target="_blank">GitHub</a>
  </div>
  <div class="copyright">
    Copyright &copy; 2023-2024
    <a href="https://jerryz.com.cn" target="_blank">Jerry Zhou</a>
  </div>
</template>

<script>
import axios from "axios";
import ProjectBlock from "../components/ProjectBlock.vue";

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export default {
  name: "Home",
  components: {
    ProjectBlock,
  },
  data() {
    return {
      searchText: "",
      projects: [],
      sortMethod: "random",
      originalProjects: [],
      isLoading: true,
    };
  },
  async created() {
    try {
      const response = await axios.get("./projects.json");
      this.originalProjects = response.data;
      this.projects = [...this.originalProjects];
      this.sortProjects();
      this.isLoading = false;
    } catch (error) {
      console.error(error);
    }
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
        const urlMatch = project.url.toLowerCase().includes(lowerSearchText);
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
    sortProjects() {
      if (this.sortMethod === "random") {
        this.projects = shuffle([...this.originalProjects]);
      } else {
        this.projects = [...this.originalProjects];
        this.projects.sort((a, b) => b.recommended - a.recommended);
      }
    },
  },
};
</script>

<style>
:root {
  --primary-color: #279cff;
  --secondary-color: #2180d8;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #e0e0e0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
  color: var(--text-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container {
  width: 90%;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: var(--primary-color);
  margin-bottom: 15px;
  font-size: 2.5rem;
  font-weight: 700;
}

.header h2 {
  color: #6c757d;
  font-weight: normal;
}

.header p {
  color: #888;
  font-weight: normal;
}

.content {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #fff;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(39, 156, 255, 0.2);
}

.projects {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.isLoading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.no-results {
  text-align: center;
  width: 100%;
  margin-top: 15px;
  color: #f17162;
}

.copyright {
  text-align: center;
  margin: 7px 0;
  color: #999;
  font-size: 14px;
}

.copyright a {
  text-decoration: none;
  font-weight: bold;
  color: var(--primary-color);
  transition: opacity 0.2s;
}

.copyright a:hover {
  opacity: 0.7;
}

.counter {
  text-align: center;
  margin-top: 10px;
  color: #999;
  font-size: 14px;
}

.sort-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  align-items: center;
}

.sort-select {
  border: none;
  border-radius: 5px;
  padding: 10px;
  background-color: #f2f2f2;
  color: #333;
  font-size: 16px;
  outline: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.sort-select:focus {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.sort-select:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

@media screen and (max-width: 680px) {
  .app-container {
    width: 95%;
    padding: 1.5rem;
  }

  .header h1 {
    font-size: 2rem;
  }
}

@media screen and (min-width: 680px) {
  .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .button-container button {
    width: 350px;
    margin-bottom: 10px;
  }
}
</style>