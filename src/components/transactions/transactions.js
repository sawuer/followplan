import { mapGetters } from 'vuex'
import modal from '../modal/modal.js'
import template from './transactions.html'

export default {
  template,
  components: {
    modal
  },
  mounted () {
  },
  computed: {
    ...mapGetters([
    ])
  },
  data () {
    return {
    }
  },
  methods: {
    addAccount () {
      this.$root.$firebaseRefs.users
        .child(this.user.key).child('data').child('accounts').push({
          name: this.addAccountType
        })
      this.computeAccounts()
    },
    deleteAccount (key) {
      this.$root.$firebaseRefs.users
        .child(this.user.key).child('data').child('accounts').child(key).remove()
      this.computeAccounts()
    },
    putAccounts () {
      this.users.child(this.user.key).once('value').then(i => {
        if (i.val().data.accounts) {
          this.accounts = []
          Object.keys(i.val().data.accounts).forEach(j => {
            this.accounts.push({
              name: i.val().data.accounts[j].name,
              key: j
            })
          })
        }
      })
    },
    computeAccounts () {
      var currency = this.currency
      this.users.child(this.user.key).once('value').then(i => {
        this.accountsTemplate = ''
        if (i.val().data.accounts) {
          Object.keys(i.val().data.accounts).forEach(j => {
            var newAccountCount = 0
            Object.keys(i.val().data.spendings).forEach(k => {
              if (i.val().data.accounts[j].name === i.val().data.spendings[k].type) {
                newAccountCount += +i.val().data.spendings[k].money
              }
            })
            this.accountsTemplate += `
              <div class="flex money-accountItem">
                <span class="text-xs-right">${i.val().data.accounts[j].name}: <b>${newAccountCount} ${currency}</b></span>
              </div>
            `
          })
        }
      })
      this.putAccounts()
    },
    addCategory (coll, catName) {
      const key = this.user.key
      this.$root.$firebaseRefs.users
        .child(key)
        .child('data')
        .child(coll)
        .push({
          catName: this[catName]
        })
        .then(i => {
          this.$root.$firebaseRefs.users
            .child(key)
            .child('data')
            .child(coll)
            .child(i.key)
            .update({
              thisKey: i.key
            })
        })
      this.fullCategoriesFromDB()
      this[catName] = null
    },
    fullCategoriesFromDB () {
      this.spendingsCategory = []
      this.userData.child('spendingsCategories').once('value').then(i => {
        i.forEach(j => {
          this.spendingsCategory.push([j.val().catName, j.val().thisKey])
        })
      })
      this.incomesCategories = []
      this.userData.child('incomesCategories').once('value').then(i => {
        i.forEach(j => {
          this.incomesCategories.push([j.val().catName, j.val().thisKey])
        })
      })
    },
    removeCategory (key, coll) {
      this.userData.child(coll).child(key).remove()
      this.fullCategoriesFromDB()
      this.computeAccounts()
    },
    addSpending () {
      if (this.$refs.form.validate()) {
        var form = this.$refs.form
        var money = +form.$el[0].value
        var name = form.$el[1].value
        var type = form.$el[2].previousSibling.textContent
        var date = form.$el[3].value
        const key = this.user.key
        this.$root.$firebaseRefs.users
          .child(key)
          .child('data')
          .child('spendings').push({
            money, name, type, date
          })
          .then(i => {
            this.$root.$firebaseRefs.users
              .child(key)
              .child('data')
              .child('spendings')
              .child(i.key)
              .update({
                thisKey: i.key
              })
          })
        this.computeCash()
        this.computeAccounts()
        setTimeout(() => this.$refs.form.reset(), 200)
      }
    },
    addIncome () {
      if (this.$refs.form2.validate()) {
        var form = this.$refs.form2
        var money = form.$el[0].value
        var type = form.$el[1].previousSibling.textContent
        var date = form.$el[2].value
        const key = this.user.key
        this.$root.$firebaseRefs.users
          .child(key)
          .child('data')
          .child('incomes').push({
            type, date, money
          })
          .then(i => {
            this.$root.$firebaseRefs.users
              .child(key)
              .child('data')
              .child('incomes')
              .child(i.key)
              .update({
                thisKey: i.key
              })
          })
        this.computeCash()
        setTimeout(() => this.$refs.form2.reset(), 200)
      }
    },
    deleteItem (key, coll) {
      this.userData.child(coll).child(key).remove()
      this.computeCash()
      this.computeAccounts()
    },
    computeCash () {
      this.users.child(this.user.key).once('value').then(i => {
        this.cash = 0
        if (i.val().data.incomes) {
          Object.keys(i.val().data.incomes).forEach(j => {
            this.cash += +i.val().data.incomes[j].money
          })
        }
        if (i.val().data.spendings) {
          Object.keys(i.val().data.spendings).forEach(j => {
            this.cash -= +i.val().data.spendings[j].money
          })
        }
      })
    },

    newSpendingName (e, spending, key) {
      this.userData.child('spendings').child(key).update({
        name: e.target.value
      })
    },
    newType (type, key, coll) {
      this.userData.child(coll).child(key).update({ type })
      this.computeAccounts()
    },
    newMoneyCount (e, key, coll) {
      this.userData.child(coll).child(key).update({
        money: e.target.value
      })
      this.computeCash()
      this.computeAccounts()
    }
  }
}