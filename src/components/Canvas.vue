<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.workspace {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  flex-flow: column;
}

canvas:hover {
  cursor: none;
}

canvas {
  background-color: rgb(255, 255, 255);
  flex-grow: 1;
}

/* hide brush on leaving canvas */
canvas:not(:hover) + div.brush {
  display: none;
}

</style>

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
        :style="brushStyle">
      </div>
      <div
        class="toolbelt">
          <button @click="brush.lineWidth--">-</button>
          <button @click="brush.lineWidth++">+</button>
          <button @click="undo">undo</button>
          <button @click="redo">redo</button>
          <button @click="clearClicked">clear</button>
      </div>
  </div>

</template>

<script>
import { deepCopy } from "@/utils/mutability"
import gql from 'graphql-tag'

const CLEAR = 'clear'


const UPDATE_TURN = gql`
mutation updateTurns($uuid: String!, $artwork: JSONString) {
  updateTurn(uuid: $uuid, artwork: $artwork) {
    uuid
    artwork
  }
}`


export default {
  name: 'Canvas',
  props: [
    'turn',
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
        global: {
          x: 0,
          y: 0,
        },
      },
      stroke: {
        brush: {},
        path: [],
      },
      history: [],
      future: [],
      historyRollback: [],
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
    history: async function(newHistory) {
      try {
        await this.$apollo.mutate({
          mutation: UPDATE_TURN,
          variables: {
            uuid: this.turn.uuid,
            artwork: JSON.stringify(newHistory)
          },
        })
        this.historyRollback = deepCopy(newHistory)
      }
      catch (error) {
        this.history = deepCopy(this.historyRollback)
        this.redraw()
        this.draw(this.stroke)
      }
    }
  },
  computed: {
    brushStyle: function() {
      const width = this.brush.lineWidth
      return {
        position: "absolute",
        left: `${this.mouse.global.x - (width/2)}px`,
        top: `${this.mouse.global.y - (width/2)}px`,
        borderRadius: `${width/2}px`,
        width: `${width}px`,
        height: `${width}px`,
        backgroundColor: this.brush.strokeStyle,
        pointerEvents: "none",
      }
    },
    relativePosition: function() {
      return {
        x: this.mouse.position.x/this.size.width,
        y: this.mouse.position.y/this.size.height,
      }
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
    mousedown: function() {
      this.mouse.down = true
      this.future = []
      this.stroke.brush = deepCopy(this.brush)
      this.stroke.path = [deepCopy(this.relativePosition)]
    },
    mousemove: function(event) {
      const newPosition = {
        x: event.offsetX,
        y: event.offsetY,
      }

      this.mouse.position.x = newPosition.x
      this.mouse.position.y = newPosition.y
      this.mouse.global.x = event.pageX
      this.mouse.global.y = event.pageY

      if (this.mouse.down === true) {
        this.stroke.path.push(this.relativePosition)
        this.draw(this.stroke)
      }
    },
    mouseup: function() {
      this.mouse.down = false
      if (this.stroke.path.length > 0) {
        this.history.push(deepCopy(this.stroke))
        this.stroke.brush = {}
        this.stroke.path = []
        this.redraw()
      }
    },
    mouseenter: function(event) {
      // if entering presed down, then we should draw
      // need to move the mouse position otherwise will
      // draw from last exit location
      this.mouse.position.x = event.offsetX
      this.mouse.position.y = event.offsetY
      this.mouse.global.x = event.pageX
      this.mouse.global.y = event.pageY
      this.mouse.down = (event.buttons === 1)
    },
    clearClicked: function() {
      this.history.push(CLEAR)
      this.future = []
      this.clear()
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
