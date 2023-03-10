<template>
  <v-container class="d-flex justify-center">
    <v-row class="d-flex justify-center align-center">
      <v-col md="12" lg="10">
        <v-card>
          <v-card-title class="d-flex">
            <div>{{ $t('menu.categories') }}</div>
          </v-card-title>

          <v-card-text>
            <v-btn color="green" class="mb-2" @click.prevent="create">{{ $t('add_category') }}</v-btn>

            <v-data-table
              :headers="headers"
              :items="items"
              :loading="isLoading"
              :options.sync="options"
              :items-per-page="-1"
              :server-items-length="total"
              class="flex-grow-1"
            >
              <template #item.action="{ item }">
                <div class="d-flex">
                  <v-btn small color="primary" class="mx-1" @click="edit(item)">{{ $t('edit') }}</v-btn>
                  <v-btn small color="red" class="mx-1" @click="remove(item)">{{ $t('delete') }}</v-btn>
                </div>
              </template>

            </v-data-table>
          </v-card-text>

        </v-card>
      </v-col>
    </v-row>
    <CategoryDialogComponent :model="dialog.model" :dialog.sync="dialog.show" @refresh="refresh" />
    <ConfirmDialog ref="confirm" />
  </v-container>
</template>
<script>
import CategoryDialogComponent from '~/components/category/CategoryDialogComponent'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog'

export default {
  components: {
    CategoryDialogComponent,
    ConfirmDialog
  },
  data() {
    return {
      dialog: {
        show: false,
        model: null
      },
      isLoading: false,
      total: 0,
      options: {},
      items: []
    }
  },
  head() {
    return {
      title: this.$t('menu.categories')
    }
  },
  computed: {
    headers() {
      return [
        { text: this.$t('name'), align: 'left', value: 'name', sortable: false },
        { text: this.$t('actions'), sortable: false, align: 'left', value: 'action', width: 200 }
      ]
    }
  },
  watch: {
    options: {
      async handler() {
        await this.getDataFromApi()
      },
      deep: true
    }
  },
  methods: {
    close() {
      this.dialog = {
        show: false,
        model: null
      }
    },
    create() {
      this.dialog = {
        show: true,
        model: null
      }
    },
    edit(model) {
      this.dialog = {
        show: true,
        model
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
          await this.$axios.$delete(`/api/categories/${item.id}`)

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

        const response = await this.$axios.get('/api/categories', {
          params: {
            skip,
            limit
          }
        })

        if (response) {
          this.items = response.data
          this.total = response.data.length
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>
