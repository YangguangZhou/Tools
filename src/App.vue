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
          <!-- <option value="views">按访问量排序</option> -->
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
import ProjectBlock from "./components/ProjectBlock.vue";

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
  name: "App",
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
      // for (let project of this.originalProjects) {
      //   const url = "https://g3rvbpemgm.us.aircode.run/view";
      //   const name = "tools-" + project.id;
      //   const res = await axios.post(url, { name });
      //   project.views = res.data.times;
      // }
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
      } 
        // else if (this.sortMethod === "views") {
        // this.projects = [...this.originalProjects];
        // this.projects.sort((a, b) => b.views - a.views);
      // } 
      else {
        this.projects = [...this.originalProjects];
        this.projects.sort((a, b) => b.recommended - a.recommended);
      }
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&display=swap");

* {
  font-family: "EB Garamond", "Noto Serif SC", "simsun", songti sc,
    microsoft yahei, serif;
}

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

.isLoading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px; /* 你可以根据需要调整这个值 */
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
  color: unset;
  transition: opacity 0.2s;
}

.copyright a:hover {
  opacity: 0.5;
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

@media (max-width: 768px) {
  .projects {
    align-items: center;
  }
}
</style>