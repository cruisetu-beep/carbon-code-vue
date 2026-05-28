<template>
  <TopBar/>
  <div class="app">
    <ListView     v-if="view === 'list'"   @create="view = 'wizard'" @open="openDetail"/>
    <DetailView   v-else-if="view === 'detail'" :pkg="detailPkg" @back="view = 'list'"/>
    <WizardShell  v-else-if="view === 'wizard'" @back="view = 'list'"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TopBar      from './components/shared/TopBar.vue'
import ListView    from './components/list/ListView.vue'
import DetailView  from './components/detail/DetailView.vue'
import WizardShell from './components/wizard/WizardShell.vue'

const view      = ref('list')
const detailPkg = ref(null)

function openDetail(pkg) { detailPkg.value = pkg; view.value = 'detail' }
</script>
