<template>
  <div class="container">
    <div v-if="!auth" class="auth-form">
      <h1>请输入密码</h1>
      <input type="password" v-model="password" @keyup.enter="handleAuth" />
      <button @click="handleAuth">提交</button>
    </div>
    <div v-else class="project-form">
      <h1>新增项目</h1>
      <div class="form-group">
        <label for="title">标题</label>
        <input id="title" type="text" placeholder="标题" v-model="newProject.title" />
      </div>
      <div class="form-group">
        <label for="description">简介</label>
        <textarea id="description" placeholder="简介" v-model="newProject.description"></textarea>
      </div>
      <div class="form-group">
        <label for="icon">图标</label>
        <input id="icon" type="text" placeholder="图标" v-model="newProject.icon" />
      </div>
      <div class="form-group">
        <label for="url">URL</label>
        <input id="url" type="text" placeholder="URL" v-model="newProject.url" />
      </div>
      <div class="form-group mine-section">
        <label for="mine">自建项目</label>
        <button id="mine" @click="toggleMine" :class="{'active': newProject.mine}">
          {{ newProject.mine ? '是' : '否' }}
        </button>
      </div>
      <div class="form-group">
        <label>标签</label>
        <input
          type="text"
          placeholder="添加标签"
          v-model="newTag"
          @keydown.enter.prevent="handleAddTag"
        />
        <div class="tags">
          <span v-for="(tag, index) in newProject.tags" :key="index" class="tag">
            {{ tag }}
            <i class="fas fa-xmark tag-remove" @click="handleRemoveTag(index)"></i>
          </span>
        </div>
      </div>
      <button @click="handleSubmit" :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '新增项目' }}
      </button>
    </div>
  </div>
</template>

<script>
// Script 部分保持不变
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #0070f3;
}

textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: #e1f5fe;
  color: #0288d1;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.tag:hover {
  background-color: #b3e5fc;
}

.tag-remove {
  background: none;
  border: none;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: #0288d1;
  transition: color 0.3s ease;
}

.tag-remove:hover {
  color: #01579b;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #005bb5;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.mine-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mine-section button {
  width: auto;
  padding: 0.5rem 1rem;
}

.mine-section button.active {
  background-color: #28a745;
}

.auth-form input {
  margin-bottom: 1rem;
}

input[type="text"] {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .container {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>