<template>
  <v-container class="d-flex justify-center">
    <v-row class="d-flex justify-center align-center">
      <v-col md="12" lg="10">
        <v-card>
          <v-card-title class="d-flex">
            <div>{{ $t('menu.budget') }}</div>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="items"
              :loading="isLoading"
              :options.sync="options"
              :items-per-page="-1"
              :server-items-length="total"
              class="flex-grow-1"
            >
              <template #item.category="{ item }">
                <v-btn
                  text
                  small
                  plain
                  color="secondary"
                  class="text-decoration-underline"
                  @click="showInsight(item)">
                  {{ item.category.name }}
                </v-btn>
              </template>

              <template #item.category.spendings="{ item }">
                {{ item.category.spendings | money }} pln
              </template>

              <template #item.budget="{ item }">
                <span v-if="item.budget <= 0" class="pink--text">
                  {{ $t('no_budget') }}
                </span>
                <template v-else>
                  {{ item.budget | money }} pln
                </template>
              </template>

              <template #item.result="{ item }">
                <div v-if="item.budget <= 0" class="font-italic">
                  {{ $t('no_budget_set') }}
                </div>
                <div v-else-if="(item.budget) >= item.category.spendings" class="green--text">
                  {{ $t('budget_in_control') }}!
                </div>
                <div v-else class="pink--text">
                  {{ $t('budget_exceeded') }}!
                </div>
              </template>

              <template #item.action="{ item }">
                <div class="d-flex">
                  <template v-if="item.budget === 0">
                    <v-btn small color="green" class="mx-1" @click="create(item)">{{ $t('set') }}</v-btn>
                  </template>
                  <template v-else>
                    <v-btn small color="primary" class="mx-1" @click="edit(item)">{{ $t('edit') }}</v-btn>
                    <v-btn small color="red" class="mx-1" @click="remove(item)">{{ $t('delete') }}</v-btn>
                  </template>
                </div>
              </template>

            </v-data-table>
          </v-card-text>

        </v-card>
      </v-col>
    </v-row>
    <BudgetDialogComponent
      :model="dialog.model"
      :category="dialog.category"
      :dialog.sync="dialog.show"
      :spending="dialog.spending"
      @refresh="refresh" />

    <CategoryInsightDialogComponent
      :category="insight.category"
      :date="date"
      :dialog.sync="insight.show" />

    <ConfirmDialog ref="confirm" />
  </v-container>
</template>
<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import BudgetDialogComponent from '~/components/budget/BudgetDialogComponent'
import CategoryInsightDialogComponent from '~/components/budget/CategoryInsightDialogComponent'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog'

export default {
  components: {
    BudgetDialogComponent,
    CategoryInsightDialogComponent,
    ConfirmDialog
  },
  data() {
    return {
      dialog: {
        show: false,
        model: null,
        category: null,
        spending: 0
      },
      insight: {
        show: false,
        category: null
      },
      isLoading: false,
      total: 0,
      options: {},
      items: [],
    }
  },
  computed: {
    headers(){
      return [
        { text: this.$t('category'), align: 'left', value: 'category', sortable: false },
        { text: this.$t('spendings'), align: 'left', value: 'category.spendings', sortable: false },
        { text: this.$t('budget'), align: 'left', value: 'budget', sortable: false },
        { text: this.$t('result'), align: 'left', value: 'result', sortable: false },
        { text: this.$t('actions'), sortable: false, align: 'left', value: 'action', width: 200 }
      ]
    },
    ...mapGetters('app', {
      date: 'getDate'
    })
  },
  head() {
    return {
      title: this.$t('menu.budget')
    }
  },
  watch: {
    options: {
      async handler() {
        await this.getDataFromApi()
      },
      deep: true
    },
    async date() {
      await this.getDataFromApi()
    }
  },
  methods: {
    showInsight(item) {
      this.insight = {
        show: true,
        category: item.category
      }
    },
    create(item) {
      this.dialog = {
        show: true,
        model: null,
        category: item.category,
        spending: item.category.spendings
      }
    },
    edit(model) {
      this.dialog = {
        show: true,
        model,
        category: model.category,
        spending: model.category.spendings
      }
    },
    async refresh() {
      await this.getDataFromApi()
    },
    resetTable() {
      this.items = []
      this.total = 0
    },
    async remove(item) {
      if (
        await this.$refs.confirm.open(
          this.$t('confirmation'),
          this.$t('are_you_sure'),
          {
            btnCancel: this.$t('cancel'),
            btnOk: this.$t('yes')
          }
        )
      ) {
        try {
          this.isLoading = true
          await this.$axios.$delete(`/api/budget/${item.id}`)

          this.$notifier.showMessage({ content: this.$t('deleted'), color: 'green' })

          await this.refresh()
        } finally {
          this.isLoading = false
        }
      }
    },
    async getDataFromApi() {
      this.isLoading = true

      try {
        this.resetTable()

        const skip = 0
        const limit = 1000

        const response = await this.$axios.get('/api/budget-dashboard', {
          params: {
            skip,
            limit,
            start_date: moment(`${this.date}-1`).format('YYYY-MM-DD')
          }
        })

        if (response) {
          this.items = response.data.budget
          this.total = response.data.budget.length
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>
