// http://perfectionkills.com/exploring-canvas-drawing-techniques/

<template>
  <div
    class="workspace"
    ref="workspace">
      <canvas
        ref="canvas"
        @mousedown.left="mousedown"
        @mouseup.left="mouseup"
        @mouseleave="mouseup"
        @mouseenter="mouseenter"
        @mousemove="mousemove">
      </canvas>
      <div
        class="brush"
        v-bind:style="brushStyle">
      </div>
      <div
        class="toolbelt">
          <button @click="brush.lineWidth--">-</button>
          <button @click="brush.lineWidth++">+</button>
          <button @click="undo">undo</button>
          <button @click="redo">redo</button>
          <button @click="clearClicked">clear</button>
          {{ history.length }}
          {{ future.length }}
      </div>
  </div>

</template>

<script>
import { deepCopy } from "@/utils/mutability"
const CLEAR = 'clear'


export default {
  name: 'Canvas',
  data: function() {
    return {
      canvas: {
        el: null,
        ctx: null,
      },
      brush: {
        strokeStyle: "#F63E02",
        lineWidth: 8,
        lineCap: "round",
        lineJoin: "round",
      },
      mouse: {
        down: false,
        position: {
          x: 0,
          y: 0,
        },
      },
      stroke: [],
      history: [],
      future: [],
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.canvas.el = this.$refs.canvas
      this.canvas.ctx = this.$refs.canvas.getContext("2d")
    })
  },
  computed: {
    brushStyle: function() {
      const width = this.brush.lineWidth
      return {
        position: "absolute",
        left: `${this.mouse.position.x - (width/2)}px`,
        top: `${this.mouse.position.y - (width/2)}px`,
        borderRadius: `${width/2}px`,
        width: `${width}px`,
        height: `${width}px`,
        backgroundColor: this.brush.strokeStyle,
        pointerEvents: "none",
      }
    },
  },
  methods: {
    mousedown: function() {
      this.mouse.down = true
      this.future = []
    },
    mouseup: function() {
      this.mouse.down = false
      if (this.stroke.length > 0) {
        this.history.push(this.stroke)
        this.stroke = []
      }
    },
    mousemove: function(event) {
      const new_position = {
        x: event.offsetX,
        y: event.offsetY,
      }

      if (this.mouse.down === true) {
        this.stroke.push(deepCopy({
          from: this.mouse.position,
          to: new_position,
          brush: this.brush,
        }))
        this.draw(this.stroke)
      }

      this.mouse.position.x = new_position.x
      this.mouse.position.y = new_position.y
    },
    mouseenter: function(event) {
      // if entering presed down, then we should draw
      // need to move the mouse position otherwise will
      // draw from last exit location
      this.mouse.position.x = event.offsetX
      this.mouse.position.y = event.offsetY
      this.mouse.down = (event.buttons === 1)
    },
    clearClicked: function(event) {
      this.history.push(CLEAR)
      this.future = []
      this.clear()
    },
    draw: function(stroke) {
      const ctx = this.canvas.ctx
      ctx.beginPath()
      for (const {from, to, brush} of stroke) {
        ctx.strokeStyle = brush.strokeStyle
        ctx.lineWidth = brush.lineWidth
        ctx.lineCap = brush.lineCap
        ctx.lineJoin = brush.lineJoin
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
      }
      ctx.stroke()
    },
    clear: function() {
      this.canvas.ctx.clearRect(0, 0, this.canvas.el.width, this.canvas.el.height)
    },
    redraw: function() {
      this.clear()
      for (const stroke of this.history) {
        if (stroke === CLEAR) {
          this.clear()
        } else {
          this.draw(stroke)
        }
      }
    },
    undo: function() {
      const lastStroke = this.history.pop()
      if (lastStroke === undefined) { return }
      this.future.push(lastStroke)
      this.redraw()
    },
    redo: function() {
      const lastStroke = this.future.pop()
      if (lastStroke === undefined) { return }
      this.history.push(lastStroke)
      this.redraw()
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.workspace {
  position: relative;
}

canvas:hover {
  cursor: none;
}

canvas {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: rgb(206, 206, 206);
}

/* hide brush on leaving canvas */
canvas:not(:hover) + div.brush {
  display: none;
}

</style>
