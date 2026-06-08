<template>
  <div ref="chartEl" class="energy-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data:  { type: Array,  default: () => [] },
  unit:  { type: String, default: '千瓦时' },
  color: { type: String, default: '#4dc9ff' },
})

const chartEl = ref(null)
let chart = null

function buildOption() {
  // 数据是降序的，反转为时间正序
  const sorted = [...props.data].sort((a, b) => a.time.localeCompare(b.time))
  const times  = sorted.map(d => d.time.slice(11, 16)) // 只取 HH:mm
  const values = sorted.map(d => d.value)

  return {
    grid: { top: 16, right: 8, bottom: 36, left: 40 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0d1f3c',
      borderColor: props.color + '66',
      textStyle: { color: '#c8daf4', fontSize: 11 },
      formatter: (params) => {
        const p = params[0]
        return `${sorted[p.dataIndex]?.time?.slice(5)}<br/><b>${p.value}</b> ${props.unit}`
      },
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLine:  { lineStyle: { color: '#1e3a5f' } },
      axisTick:  { show: false },
      axisLabel: {
        color: '#5a7fa8', fontSize: 9,
        interval: 11, // 每小时显示一个标签（4个15min = 1h，显示每第12个）
      },
    },
    yAxis: {
      type: 'value',
      name: props.unit,
      nameTextStyle: { color: '#5a7fa8', fontSize: 9 },
      splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
      axisLabel: { color: '#5a7fa8', fontSize: 9 },
    },
    series: [{
      type: 'bar',
      data: values,
      barMaxWidth: 6,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: props.color },
          { offset: 1, color: props.color + '44' },
        ]),
        borderRadius: [2, 2, 0, 0],
      },
      emphasis: {
        itemStyle: { color: props.color },
      },
    }],
  }
}

function init() {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value, null, { renderer: 'canvas' })
  chart.setOption(buildOption())
}

onMounted(init)
onBeforeUnmount(() => chart?.dispose())
watch(() => props.data, () => chart?.setOption(buildOption()), { deep: true })
</script>

<style scoped>
.energy-chart {
  width: 100%;
  height: 140px;
  margin-top: 4px;
}
</style>
