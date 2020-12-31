<template>
  <section class="marquee-wrap">
    <div class="marquee" ref="marquee" :style="{ animationDuration: duration }">
      <span class="text-item" v-for="(item, index) of data" :key="index">{{ item }}</span>
      <span class="text-item" v-for="(item, index) of data" :key="`copy-${index}`">{{
        item
      }}</span>
    </div>
  </section>
</template>

<script>
export default {
  name: "marquee",
  props: {
    /* 跑马灯数据 */
    data: {
      type: Array,
      default: () => [],
    },
    /* 跑马灯速度，数值越大速度越快 */
    speed: {
      type: Number,
      default: 50,
    },
  },
  data() {
    return {
      duration: 0,
    };
  },
  mounted() {
    /* 跑马灯速度，使用跑马灯内容宽度 除以 速度 得到完整跑完一半内容的时间 */
    this.duration = this.speed + "s";
  },
};
</script>

<style lang="scss" scoped>
// 自行使用 px2rem，这部分不讲述

.marquee-wrap {
  position: relative;
  overflow: hidden;
  &:after {
    content: "0";
    opacity: 0;
  }
}

.marquee {
  position: absolute;
  font-size: 0;
  white-space: nowrap;
  animation-name: marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.text-item {
  margin-right: 14px;
  font-size: 14px;
  /* 解决Font Boosting */
  -webkit-text-size-adjust: none;
  // max-height: 999px; //如果上面的依然未解决问题就加上这句吧
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
</style>
