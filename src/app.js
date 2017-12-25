import navigation from './components/navigation/navigation'

export default {
  name: 'app',
  template: `
    <div>
      <div v-if="!loaded">
        loading...
      </div>
      <div v-else>
        <navigation></navigation>
        <div class="pages">
          <router-view></router-view>
        </div>
      </div>
    </div>
  `,
  components: {
    navigation
  },
  mounted () {
    var self = this
    setTimeout(() => {
      self.loaded = true
    }, 1500)
  },
  data () {
    return {
      loaded: false
    }
  }
}
