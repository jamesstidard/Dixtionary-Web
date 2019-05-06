<style lang="stylus" scoped>
@import "../palette.styl"

.toggle
    display: flex
    align-items: center;
    width: 40px
    height: 20px
    border-radius: 20px
    cursor: pointer
    background off-white
    transition: background 0.2s

.toggle.checked
  background-color: primary-off

.toggle-option
    width: 18px
    height: 18px
    background: primary
    border-radius: 50%
    margin-left: 1px
    transition: margin 0.2s

.toggle-option.checked
    margin-left: 21px
    background: primary


.toggle:hover > .toggle-option
  background: primary-hover

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
