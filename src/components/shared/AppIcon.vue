<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="stroke"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- cube -->
    <template v-if="name === 'cube'">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
      <path d="M12 12l8-4.5"/><path d="M12 12L4 7.5"/><path d="M12 12v9"/>
    </template>
    <!-- plus -->
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14"/>
    </template>
    <!-- search -->
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
    </template>
    <!-- doc -->
    <template v-else-if="name === 'doc'">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <path d="M14 3v6h6"/>
    </template>
    <!-- graph -->
    <template v-else-if="name === 'graph'">
      <circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/>
      <circle cx="12" cy="18" r="2.5"/><circle cx="12" cy="12" r="1.5"/>
      <path d="M7.5 7.5l3.5 3.5M16.5 7.5L13 11M12 13.5V15.5"/>
    </template>
    <!-- bolt -->
    <template v-else-if="name === 'bolt'">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
    </template>
    <!-- panel -->
    <template v-else-if="name === 'panel'">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 9v12"/>
    </template>
    <!-- leaf -->
    <template v-else-if="name === 'leaf'">
      <path d="M21 3c-7 0-13 4-13 12 0 3 1 6 1 6s9-1 12-7c2-4 0-11 0-11z"/>
      <path d="M8 21c0-6 4-10 10-12"/>
    </template>
    <!-- sun -->
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </template>
    <!-- plug -->
    <template v-else-if="name === 'plug'">
      <path d="M9 2v4M15 2v4M5 10h14v4a7 7 0 0 1-14 0v-4z"/>
      <path d="M12 21v-3"/>
    </template>
    <!-- factory -->
    <template v-else-if="name === 'factory'">
      <path d="M3 21V10l6 4V10l6 4V7l6 3v11H3z"/>
    </template>
    <!-- check -->
    <template v-else-if="name === 'check'">
      <path d="M5 12l4 4L19 6"/>
    </template>
    <!-- chevron-right -->
    <template v-else-if="name === 'chevron-right'">
      <path d="M9 6l6 6-6 6"/>
    </template>
    <!-- chevron-left -->
    <template v-else-if="name === 'chevron-left'">
      <path d="M15 6l-6 6 6 6"/>
    </template>
    <!-- chevron-down -->
    <template v-else-if="name === 'chevron-down'">
      <path d="M6 9l6 6 6-6"/>
    </template>
    <!-- upload -->
    <template v-else-if="name === 'upload'">
      <path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>
    </template>
    <!-- tag -->
    <template v-else-if="name === 'tag'">
      <path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="7.5" r="1"/>
    </template>
    <!-- sparkles -->
    <template v-else-if="name === 'sparkles'">
      <path d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5L12 3z"/>
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"/>
    </template>
    <!-- scan -->
    <template v-else-if="name === 'scan'">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <path d="M7 12h10"/>
    </template>
    <!-- database -->
    <template v-else-if="name === 'database'">
      <ellipse cx="12" cy="5" rx="8" ry="3"/>
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/>
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>
    </template>
    <!-- settings -->
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
    </template>
    <!-- user -->
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
    </template>
    <!-- bell -->
    <template v-else-if="name === 'bell'">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/>
      <path d="M10 21a2 2 0 0 0 4 0"/>
    </template>
    <!-- trash -->
    <template v-else-if="name === 'trash'">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    </template>
    <!-- more -->
    <template v-else-if="name === 'more'">
      <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
    </template>
    <!-- cpu -->
    <template v-else-if="name === 'cpu'">
      <rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 9h6v6H9z"/>
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>
    </template>
    <!-- zap -->
    <template v-else-if="name === 'zap'">
      <path d="M13 2L4 14h7l-1 8 9-12h-7z"/>
    </template>
    <!-- filter -->
    <template v-else-if="name === 'filter'">
      <path d="M3 4h18l-7 9v6l-4 2v-8L3 4z"/>
    </template>
    <!-- eye -->
    <template v-else-if="name === 'eye'">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
    </template>
    <!-- download -->
    <template v-else-if="name === 'download'">
      <path d="M12 4v12M6 14l6 6 6-6"/><path d="M4 20h16"/>
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name:   { type: String, required: true },
  size:   { type: [Number, String], default: 16 },
  stroke: { type: String, default: 'currentColor' },
})
</script>
