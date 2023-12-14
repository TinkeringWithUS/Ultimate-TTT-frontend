<template>
  <div class="timer" :class="{ counting: isEnabled }">
    {{ displayTime }}
  </div>
</template>

<script>

const MS_IN_SECOND = 1_000;

export default {
  props: {
    startTimeSeconds: { required: true, type: Number },
    resetSignal: { default: false, type: Boolean },
    isEnabled: { required: true, type: Boolean },
    owner: { required: true, type: String }
  },
  data() {
    return {
      timeLeft: this.startTimeSeconds,
      timerInterval: null,
    }
  },
  emits: [
    "time-loss",
  ],
  methods: {
    timerLogic(newEnable) {
      if (newEnable && this.timeLeft > 0 && this.timerInterval === null) {
        let timer = setInterval(() => {
          this.timeLeft--;
          if (this.timeLeft <= 0) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.$emit("time-loss", this.owner);
          }
        }, MS_IN_SECOND);
        this.timerInterval = timer;
      } else if (!newEnable && this.timeLeft > 0 && this.timerInterval != null) {
        // pause the timer. 
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  },
  watch: {
    isEnabled: function (newEnable) {
      console.log("Watching enable stat");
      this.timerLogic(newEnable);
    },
    resetSignal: function (newResetSignal) {
      if (newResetSignal) {
        this.timeLeft = this.startTimeSeconds;
        clearInterval(this.timerInterval);
      }
    }
  },
  computed: {
    displayTime() {
      console.log("seconds: " + this.timeLeft);
      let minutesLeft = Math.floor(this.timeLeft / 60);
      let secondsLeft = this.timeLeft - minutesLeft * 60;
      if (minutesLeft === 0) {
        minutesLeft = String(minutesLeft) + "0";
      }
      if (secondsLeft < 10) {
        secondsLeft = "0" + String(secondsLeft);
      }
      return `${minutesLeft}:${secondsLeft}`;
    }
  },
  // mounted() {
  //     this.timerLogic(true);
  // }
}

</script>

<style scoped>
.counting {
  color: white;
  background-color: darkgrey;
  box-shadow: 0rem 0rem 1rem 0.15rem rgb(153, 153, 255);
}

.timer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 4rem;
  height: 2rem;
  background-color: black;
  color: lightgrey;
  border-radius: 0.25rem;
}
</style>