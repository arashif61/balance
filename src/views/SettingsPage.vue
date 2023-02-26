<template>
  <div class="settingsPage">
    <div class="container">
      <h3><i class="bi bi-gear-fill"></i> 設定</h3>
      <div v-if="settingsMsg" class="alert alert-success" role="alert">
        {{ settingsMsg }}
      </div>
      <div class="mb-5">
        <div class="form-floating mb-3">
          <input @change="saveSettings" type="text" id="pdfTitleInput" class="form-control" v-model="pdfTitleModify" />
          <label for="pdfTitleInput">収支内訳表のタイトル</label>
        </div>
        <h5><i class="bi bi-person-fill"></i> 申告者情報</h5>
        <div class="row">
          <div class="col">
            <div class="form-floating mb-2">
              <input @change="saveSettings" type="text" id="peerInfoZip" class="form-control" v-model="peerInfoZip" />
              <label for="peerInfoZip">郵便番号</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating mb-2">
              <input @change="saveSettings" type="text" id="peerInfoAddress" class="form-control"
                v-model="peerInfoAddress" />
              <label for="peerInfoAddress">住所</label>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="form-floating mb-2">
              <input @change="saveSettings" type="text" id="peerInfoCompany" class="form-control"
                v-model="peerInfoCompany" />
              <label for="peerInfoCompany">事業者名</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating mb-2">
              <input @change="saveSettings" type="text" id="peerInfoName" class="form-control" v-model="peerInfoName" />
              <label for="peerInfoName">氏名</label>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <h5><i class="bi bi-arrow-down-up"></i> エクスポート/インポート</h5>
        <button class="btn btn-success me-2" @click="saveFile">
          <i class="bi bi-file-earmark-arrow-up"></i> エクスポート
        </button>
        <button class="btn btn-success" @click="loadFile">
          <i class="bi bi-file-earmark-arrow-down"></i>
          インポート
        </button>
      </div>
      <div class="mb-4">
        <h5><i class="bi bi-trash"></i> 全件削除</h5>
        <button @click="incomeAllDelete" class="btn btn-danger me-2">
          <i class="bi bi-cash-stack"></i> 収入全件削除
        </button>
        <button @click="expenceAllDelete" class="btn btn-danger me-2">
          <i class="bi bi-credit-card-fill"></i> 支出全件削除
        </button>
        <button @click="expenceItemAllDelete" class="btn btn-danger me-2">
          <i class="bi bi-basket"></i> 支出項目全件削除
        </button>
        <button @click="customerAllDelete" class="btn btn-danger">
          <i class="bi bi-building"></i> 取引先全件削除
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pdfTitleModify: "",
      peerInfoZip: "",
      peerInfoAddress: "",
      peerInfoCompany: "",
      peerInfoName: "",
      settingsMsg: "",
    };
  },
  async created() {
    const settingData = await window.call.readSettings([
      "pdfTitle",
      "peerInfoZip",
      "peerInfoAddress",
      "peerInfoCompany",
      "peerInfoName",
    ]);
    this.pdfTitleModify = settingData.pdfTitle;
    this.peerInfoZip = settingData.peerInfoZip;
    this.peerInfoAddress = settingData.peerInfoAddress;
    this.peerInfoCompany = settingData.peerInfoCompany;
    this.peerInfoName = settingData.peerInfoName;
  },
  methods: {
    saveSettings() {
      window.call.saveSettings({
        pdfTitle: this.pdfTitleModify,
        peerInfoZip: this.peerInfoZip,
        peerInfoAddress: this.peerInfoAddress,
        peerInfoCompany: this.peerInfoCompany,
        peerInfoName: this.peerInfoName,
      });
    },
    async incomeAllDelete() {
      if (this.confirm("収入情報")) {
        await window.call.deleteIncome({}, true);
        this.settingsMsg = "収入情報を削除しました。";
      }
    },
    async expenceAllDelete() {
      if (this.confirm("支出情報")) {
        await window.call.deleteExpence({}, true);
        this.settingsMsg = "支出情報を削除しました。";
      }
    },
    async expenceItemAllDelete() {
      if (this.confirm("支出項目")) {
        await window.call.deleteExpenceItem({}, true);
        this.settingsMsg = "支出項目情報を削除しました。";
      }
    },
    async customerAllDelete() {
      if (this.confirm("取引先")) {
        await window.call.deleteCustomer({}, true);
        this.settingsMsg = "取引先情報を削除しました。";
      }
    },
    confirm(arg) {
      return window.confirm(
        `${arg}が全件削除されます。もとに戻せません。よろしいですか？`
      );
    },
    async getIncome() {
      return await window.call.getIncomeList({}, { customerId: 1, incomeDate: 1 });
    },
    async getCustomer() {
      return await window.call.getCustomerList({}, { customerId: 1 });
    },
    async getExpence() {
      return await window.call.getExpenceList({}, { expenceItemId: 1, expenceDate: 1 });
    },
    async getExpenceItem() {
      return await window.call.getExpenceItemList({}, { expenceItemId: 1 });
    },
    async saveFile() {
      const income = await this.getIncome();
      const customer = await this.getCustomer();
      const expence = await this.getExpence();
      const expenceItem = await this.getExpenceItem();

      window.call.saveFile({
        income: income,
        customer: customer,
        expence: expence,
        expenceItem: expenceItem,
      })
        .then(
          function (path) {
            if (!path) return;
            this.settingsMsg = "データをエクスポートしました。パス: " + path;
          }.bind(this)
        );
    },
    loadFile() {
      const result = window.call.loadFile();
      if (!result) return;
      this.settingsMsg = result;
    },
  },
  name: "SettingsPage",
};
</script>
