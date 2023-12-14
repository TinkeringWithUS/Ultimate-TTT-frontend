<template>
  <div class="tile" @click="setOwner">
    {{ displaySymbol }}
  </div>
</template>

<script>
const EMPTY_TILE = "";

export default {
  emits: [
    "place-tile",
  ],
  props: {
    ownerSymbol: { required: true, type: String },
    id: { required: true, type: String },
    // default for game tile's owner is its id. 
    // width: { default: "5", type: Number},
    // height: { default: "5", type: Number}
  },
  methods: {
    setOwner() {
      // if (this.ownerSymbol !== this.id || this.ownerSymbol === EMPTY_TILE) {
      //     return;
      // }
      // if owner is default (hasn't been touched) and 
      const DEFAULT_OWNER = this.id;
      if (this.ownerSymbol === DEFAULT_OWNER) {
        this.$emit("place-tile");
      }
    }
  },
  computed: {
    displaySymbol() {
      return this.ownerSymbol === this.id ? EMPTY_TILE : this.ownerSymbol;
    }
  },
  // computed: {
  //     styleTile() {
  //         return {
  //             '--width': this.width + "rem",
  //             '--height': this.height + "rem",
  //         }
  //     }
  // }
}

</script>


<style scoped>
.tile {
  width: 2rem;
  height: 2rem;
  /* width: var(--height);
    height: var(--width); */
  border: 0.5rem solid;
  display: flex;
  align-content: center;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
  overflow: hidden;
}
</style>