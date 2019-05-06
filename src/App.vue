<template>
  <div id="app">
    <span v-if="!connected && beenASecond">
      Waking up server...
    </span>
    <span v-else>
      <router-view/>
    </span>
  </div>
</template>

<script>
import gql from 'graphql-tag'


const CONNECT = gql`
subscription join {
  connect
}`

export default {
  name: 'app',
  data() {
    return {
      connected: false,
      beenASecond: false,
    }
  },
  mounted: function() {
    setTimeout(() => this.beenASecond = true, 1000)
  },
  apollo: {
    $subscribe: {
      connected: {
        query: CONNECT,
        result({data}) {
          this.connected = data.connect
        },
      },

    },
  }
}
</script>

<style lang="stylus">
@import "palette.styl"


#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

input {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: 0;
    outline-width: 0;
    font-size: 16px;

    border-bottom 1px
    border-style solid
    border-color lightgrey
}

input:focus {
  border-color: primary;
}


button
  font-size 16px
  background-color transparent
  border 0
  color grey

  padding 8px
  min-width 100px

  cursor pointer


button:hover
  background-color off-white


button.primary
  color white
  background-color primary

button.primary:hover
  background-color primary-hover


body {
  margin: 0;
}

h1, h2 {
  margin: 0
}

</style>
