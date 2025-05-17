<template>
    <div class="app-container">
      <div class="header">
        <h1>Tools & Projects</h1>
        <h2>一些有趣的工具和项目</h2>
        <p>边框为蓝色表示是Jerry Zhou自己搭建或部署的项目</p>
        <a href="https://github.com/YangguangZhou/Tools/issues" target="_blank" class="apply-inclusion-button">
          <i class="fab fa-github"></i> 申请收录
        </a>
      </div>
      <div class="content">
        <div class="search-container">
          <input type="text" placeholder="搜索项目..." v-model="searchText" />
          <i class="fas fa-search search-icon"></i>
        </div>
        <div class="sort-container">
          <label for="sort" class="sort-label">排序方式：</label>
          <div class="select-wrapper">
            <select
              id="sort"
              class="sort-select"
              v-model="sortMethod"
              @change="sortProjects"
            >
              <option value="recommended">推荐排序</option>
              <option value="random">随机排序</option>
              <option value="views">按访问量排序</option>
            </select>
            <i class="fas fa-sort sort-icon"></i>
          </div>
        </div>
        <div v-if="isLoading" class="isLoading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else>
          <div class="projects">
            <ProjectBlock
              v-for="project in filteredProjects"
              :key="project.id"
              :project="project"
              @tag-clicked="tagClicked"
            />
            <div v-if="filteredProjects.length === 0" class="no-results">
              <i class="fas fa-search-minus"></i>
              <p>未找到匹配的项目</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="counter">
      <i class="fas fa-eye"></i> <span id="busuanzi_value_page_pv"><i class="fas fa-spinner fa-spin"></i></span>
      Views |
      <i class="fas fa-user"></i> <span id="busuanzi_value_site_uv"><i class="fas fa-spinner fa-spin"></i></span>
      Viewers
    </div>
    <div class="copyright">
      <p>点击项目可以直接跳转到对应的网站</p>
      <p>鼠标在方框上停留可以预览项目网站</p>
      <p>点击标签可以查找相同标签的内容</p>
      <a href="https://github.com/YangguangZhou/Tools" target="_blank"><i class="fas fa-code-branch"></i> GitHub</a>
    </div>
    <div class="copyright">
      Copyright &copy; 2023-2025
      <a href="https://jerryz.com.cn" target="_blank">Jerry Zhou</a>
    </div>
  </template>

  <script>
  import axios from "axios";
  import ProjectBlock from "../components/ProjectBlock.vue"; // 更新路径
  
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
        sortMethod: "random", // 默认排序方式可以根据产品需求调整
        originalProjects: [],
        isLoading: true,
      };
    },
    async created() {
      try {
        const projectsResponse = await axios.get("./projects.json");
        // 初始化项目，并为每个项目设置默认 views 为 0
        this.originalProjects = projectsResponse.data.map(project => ({
          ...project,
          views: 0 
        }));
        
        this.sortProjects(); // 根据初始数据（views为0）进行排序
        this.isLoading = false; // 先显示卡片
        
        this.loadProjectViews(); // 然后异步加载真实访问量
      } catch (error) {
        console.error("Error loading initial project data:", error);
        this.isLoading = false; // 即使出错也停止加载状态
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
      async loadProjectViews() {
        try {
          const viewsResponse = await axios.get("https://counter-sever.jerryz.com.cn/json");
          const viewsData = viewsResponse.data;
          
          const viewsMap = new Map();
          viewsData.forEach(item => {
            viewsMap.set(item.name, item.times);
          });

          let viewsUpdated = false;
          this.originalProjects.forEach(project => {
            const projectKey = `tools-${project.id}`;
            if (viewsMap.has(projectKey)) {
              const newViews = viewsMap.get(projectKey);
              if (project.views !== newViews) {
                project.views = newViews;
                viewsUpdated = true;
              }
            }
          });

          // 如果访问量有更新，并且当前是按访问量排序，则重新排序
          if (viewsUpdated) {
            this.sortProjects(); 
          }
        } catch (error) {
          console.error("Error loading project views:", error);
        }
      },
      tagClicked(tag) {
        this.searchText = tag;
      },
      sortProjects() {
        let sortedProjects = [...this.originalProjects]; // 从原始数据创建副本进行排序
        if (this.sortMethod === "random") {
          this.projects = shuffle(sortedProjects);
        } 
          else if (this.sortMethod === "views") {
          sortedProjects.sort((a, b) => b.views - a.views);
          this.projects = sortedProjects;
        } 
        else { // 'recommended' or any other default
          sortedProjects.sort((a, b) => (b.recommended || 0) - (a.recommended || 0));
          this.projects = sortedProjects;
        }
      },
    },
  };
  </script>

  <style>
  /* 保留现有基础样式 */
  @import url("https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&display=swap");
  
  * {
    font-family: "EB Garamond", "Noto Serif SC", "simsun", songti sc,
      microsoft yahei, serif;
  }
  
  body {
    background-color: #f9fafb;
    margin: 0;
    padding: 0;
  }
  
  .app-container {
    font-family: "Segoe UI", Arial, sans-serif;
    color: #333;
    margin: 30px auto;
    max-width: 1200px;
    padding: 20px;
    animation: fadeIn 0.6s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .header {
    text-align: center;
    margin-bottom: 30px;
    position: relative; /* 为按钮定位提供基准 */
  }
  
  .header h1 {
    color: #3b82f6;
    margin-bottom: 15px;
    font-size: 2.5rem;
    letter-spacing: -0.5px;
    text-shadow: 0px 2px 3px rgba(0,0,0,0.1);
  }
  
  .header h2 {
    color: #4b5563;
    font-weight: normal;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .header p {
    color: #6b7280;
    font-weight: normal;
    font-size: 1rem;
  }
  
  .apply-inclusion-button {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .apply-inclusion-button:hover {
    background-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .apply-inclusion-button i {
    margin-right: 8px;
  }
  
  .search-container {
    position: relative;
    margin-bottom: 15px;
  }
  
  .search-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }
  
  input {
    padding: 12px 40px 12px 15px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
    outline: none;
    transition: all 0.3s ease;
    font-size: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
  
  .content {
    padding: 30px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .projects {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-top: 25px;
  }
  
  .isLoading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #6b7280;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #3b82f6;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .no-results {
    text-align: center;
    width: 100%;
    margin-top: 30px;
    color: #ef4444;
    padding: 20px;
  }
  
  .no-results i {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .no-results p {
    font-size: 1.2rem;
  }
  
  .copyright {
    text-align: center;
    margin: 15px 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .copyright a {
    text-decoration: none;
    font-weight: bold;
    color: #4b5563;
    transition: color 0.2s;
    margin: 0 5px; /* 为链接之间增加一些间距 */
  }
  
  .copyright a:hover {
    color: #3b82f6;
  }
  
  .counter {
    text-align: center;
    margin: 20px 0;
    color: #6b7280;
    font-size: 16px;
    background: #fff;
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .counter i {
    color: #3b82f6;
    margin-right: 5px;
  }
  
  .sort-container {
    display: flex;
    justify-content: flex-end;
    margin: 15px 0;  /* 减少间距，原为20px 0 */
    align-items: center;
  }
  
  .sort-label {
    font-size: 14px;
    color: #4b5563;
    margin-right: 8px;
  }
  
  .select-wrapper {
    position: relative;
    display: inline-block;
  }
  
  .sort-select {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 30px 8px 12px;  /* 右边增加空间显示图标 */
    background-color: #f9fafb;
    color: #4b5563;
    font-size: 14px;
    outline: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
    appearance: none;  /* 移除默认下拉箭头 */
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  
  .sort-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;  /* 确保点击能穿透到select */
  }
  
  .sort-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  
  .sort-select:hover {
    background-color: #f3f4f6;
  }
  
  @media (max-width: 768px) {
    .projects {
      align-items: center;
      gap: 15px;
    }
    
    .app-container {
      padding: 10px;
      margin: 10px auto;
    }
    
    .content {
      padding: 15px;
    }
    
    .header h1 {
      font-size: 2rem;
    }
    
    .header h2 {
      font-size: 1.2rem;
    }
  }
  </style>
