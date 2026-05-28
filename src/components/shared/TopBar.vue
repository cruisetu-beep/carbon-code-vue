<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="brand">
        <div class="brand-mark">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#4dc9ff"/>
                <stop offset="100%" stop-color="#2f7fff"/>
              </linearGradient>
            </defs>
            <path d="M16 3l11 6.5v13L16 29 5 22.5v-13L16 3z"
                  stroke="url(#bg-grad)" stroke-width="1.5" fill="rgba(47,127,255,0.08)"/>
            <circle cx="16" cy="16" r="2.5" fill="#4dc9ff"/>
            <circle cx="16" cy="9"  r="1.4" fill="#4dc9ff" opacity="0.8"/>
            <circle cx="22" cy="13" r="1.4" fill="#4dc9ff" opacity="0.8"/>
            <circle cx="22" cy="20" r="1.4" fill="#4dc9ff" opacity="0.8"/>
            <circle cx="16" cy="23" r="1.4" fill="#4dc9ff" opacity="0.8"/>
            <circle cx="10" cy="20" r="1.4" fill="#4dc9ff" opacity="0.8"/>
            <circle cx="10" cy="13" r="1.4" fill="#4dc9ff" opacity="0.8"/>
            <g stroke="#4dc9ff" stroke-width="0.6" opacity="0.6">
              <path d="M16 16L16 9M16 16L22 13M16 16L22 20M16 16L16 23M16 16L10 20M16 16L10 13"/>
            </g>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-title display">CARBON · CODE</div>
          <div class="brand-sub mono">建筑碳效码知识库 v3.2</div>
        </div>
      </div>
    </div>

    <nav class="topbar-nav">
      <a class="nav-item">总览驾驶舱</a>
      <a class="nav-item active">资源包管理</a>
      <a class="nav-item">碳效计算</a>
      <a class="nav-item">知识图谱</a>
      <a class="nav-item">考核评价</a>
    </nav>

    <div class="topbar-right">
      <div class="status-pill">
        <span class="dot"/> 知识库引擎在线
      </div>
      <button class="icon-btn"><AppIcon name="bell"/></button>
      <button class="icon-btn"><AppIcon name="settings"/></button>
      <div class="user-chip">
        <div class="avatar">CH</div>
        <span>陈工 / 双碳管理员</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
</script>
