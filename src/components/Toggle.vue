<style lang="stylus" scoped>
@import "../palette.styl"

.toggle
    display: flex
    align-items: center;
    width: 40px
    height: 20px
    border-radius: 20px
    cursor: pointer
    background: background-off
    transition: background 1s

.toggle.checked
  background-color: primary

.toggle-option
    width: 18px
    height: 18px
    background: font-color
    border-radius: 50%
    margin-left: 1px
    transition: margin 0.2s

.toggle-option.checked
    margin-left: 21px
    background: font-color

</style>

<template lang="pug">

div.toggle(
  :class="{checked: checked}"
  @click="click"
)
  div.toggle-option(
    :class="{checked: checked}"
  )

</template>

<script>
export default {
  name: 'Toggle',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: Boolean,
  },
  methods: {
    click() {
      this.$emit('change', !this.checked)
    }
  }
}
</script>
