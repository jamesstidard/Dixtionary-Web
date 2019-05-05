// http://perfectionkills.com/exploring-canvas-drawing-techniques/

<template>
  <div
    class="workspace"
    ref="workspace">
      <canvas
        ref="canvas">
      </canvas>
  </div>

</template>

<script>
const CLEAR = 'clear'


export default {
  name: 'Preview',
  props: [
    'artwork',
  ],
  data: function() {
    return {
      size: {
        width: 0,
        height: 0,
      },
      canvas: {
        el: null,
        ctx: null,
      },
    }
  },
  mounted: function() {
    window.addEventListener('resize', this.resize)

    this.$nextTick(function() {
      this.canvas.el = this.$refs.canvas
      this.canvas.ctx = this.$refs.canvas.getContext("2d")
      this.resize()
    })
  },
  beforeDestory() {
    window.removeEventListener('resize', this.resize)
  },
  watch: {
    artwork: async function() {
      this.redraw()
    }
  },
  methods: {
    absolutePosition: function(relativePostition) {
      return {
        x: relativePostition.x*this.size.width,
        y: relativePostition.y*this.size.height,
      }
    },
    resize: function() {
      this.size.width = this.canvas.el.clientWidth
      this.size.height = this.canvas.el.clientHeight
      this.canvas.el.width = this.size.width
      this.canvas.el.height = this.size.height
      this.$nextTick(function() {
        this.redraw()
      })
    },
    draw: function(stroke) {
      const ctx = this.canvas.ctx
      ctx.beginPath()
      for (const position of stroke.path) {
        ctx.strokeStyle = stroke.brush.strokeStyle
        ctx.lineWidth = stroke.brush.lineWidth
        ctx.lineCap = stroke.brush.lineCap
        ctx.lineJoin = stroke.brush.lineJoin
        const {x, y} = this.absolutePosition(position)
        ctx.lineTo(x, y)
        ctx.moveTo(x, y)
      }
      ctx.stroke()
    },
    clear: function() {
      this.canvas.ctx.clearRect(0, 0, this.size.width, this.size.height)
    },
    redraw: function() {
      this.clear()
      if (this.artwork) {
        for (const stroke of JSON.parse(this.artwork)) {
          if (stroke === CLEAR) {
            this.clear()
          } else {
            this.draw(stroke)
          }
        }
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.workspace {
  width: 100%;
  height: 100%;
}

canvas {
  /* position: absolute;
  top: 0px;
  left: 0px; */
  width: 100%;
  height: 100%;
}

</style>
