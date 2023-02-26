<template>
  <div class="incomeListPage">
    <IncomeInsert :parentReload="dbQuery" />
    <div class="container mb-3">
      <div class="row">
        <div class="col-auto">
          <h3>
            <i class="bi bi-cash-stack"></i><i class="bi bi-ui-checks sub"></i> 収入一覧
          </h3>
        </div>
        <div class="col d-flex align-items-center">
          <button @click="deleteMultiple" :disabled="!checkDeleteEnableFlg" class="btn btn-outline-danger">
            <i class="bi bi-trash"></i> 選択データを削除
          </button>
        </div>
        <div class="col-3 pe-1">
          <div class="form-floating">
            <select id="searchCustomerSelect" @change="dbQuery" v-model="searchCustomer" class="form-select">
              <option value="">すべて</option>
              <option v-for="customer in customers" v-bind:key="customer.customerId" v-bind:value="customer.customerId">
                {{ customer.customerName }}
              </option>
            </select>
            <label for="searchCustomerSelect"><i class="bi bi-building"></i> 取引先</label>
          </div>
        </div>
        <div class="col-2 ps-0">
          <div class="form-floating">
            <select id="searchYearSelect" class="form-select" @change="dbQuery" v-model="searchYear">
              <option value="">すべて</option>
              <option v-for="y in years" v-bind:key="y" v-bind:value="y">
                {{ y }}年
              </option>
            </select>
            <label for="searchYearSelect"><i class="bi bi-calendar"></i> 年</label>
          </div>
        </div>
      </div>
      <div v-if="zeroMsg != ''" class="text-center">
        <i class="bi bi-cloud-drizzle-fill h1 me-2"></i><span class="zero-msg">{{ zeroMsg }}</span>
      </div>
      <!-- 検索結果 -->
      <div v-if="incomes != ''">
        <table class="table table-sm table-hover mb-2">
          <thead>
            <tr>
              <th>
                <input type="checkbox" @change="checkAll" id="checkAll" class="form-check-input" />
              </th>
              <th><i class="bi bi-building"></i> 取引先</th>
              <th><i class="bi bi-calendar"></i> 日付</th>
              <th><i class="bi bi-cash"></i> 金額</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="income in incomes" v-bind:key="income._id">
              <td class="align-middle">
                <input type="checkbox" :id="income._id" @change="handleCheckAll" class="form-check-input check" />
              </td>
              <td class="align-middle cursor-def">
                {{ income.customerName }}
              </td>
              <td>
                <div class="row">
                  <div class="col-auto">
                    <input @keydown.esc="noEditable('date-' + income._id)" @click="editable('date-' + income._id)"
                      readonly type="date" class="form-control-plaintext" v-bind:id="'date-' + income._id"
                      v-bind:value="income.incomeDate" />
                    <div class="invalid-feedback">有効な日付を入力してください。</div>
                  </div>
                  <div v-bind:id="'btn-date-' + income._id" class="d-none col-auto">
                    <button @click="
                      update('incomeDate', 'date-' + income._id, income._id)
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('date-' + income._id)" class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <div class="col-auto d-flex align-items-center">¥</div>
                  <div class="col-auto">
                    <input @keydown.esc="noEditable('amount-' + income._id)" @click="editable('amount-' + income._id)"
                      readonly type="number" class="form-control-plaintext" v-bind:id="'amount-' + income._id"
                      v-bind:value="income.incomeAmount" />
                    <div class="invalid-feedback">入力してください。</div>
                  </div>
                  <div v-bind:id="'btn-amount-' + income._id" class="d-none col-auto">
                    <button @click="
                      update(
                        'incomeAmount',
                        'amount-' + income._id,
                        income._id
                      )
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('amount-' + income._id)" class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td class="text-end">
                <button @click="deleteIncome(income)" class="btn btn-sm btn-light trash-each">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import IncomeInsert from "@/components/IncomeInsert.vue";

export default {
  components: { IncomeInsert },
  data() {
    return {
      searchCustomer: "",
      searchYear: "",
      incomes: [],
      customers: [],
      years: "",
      zeroMsg: "",
      checkDeleteEnableFlg: false,
    };
  },
  async created() {
    await this.dbQuery();
  },
  methods: {
    async dbQuery() {
      this.customers = await window.call.getCustomerList({}, { sortSeq: 1 });
      this.years = await this.getYears();
      if (!this.years.includes(this.searchYear)) {
        this.searchYear = "";
      }
      this.incomes = await this.getData();
    },
    getJpDate(dateStr) {
      const date = new Date(dateStr.replaceAll("-", "/"));
      const options = { year: "numeric", month: "narrow", day: "numeric" };
      return new Intl.DateTimeFormat("ja-JP", options).format(date);
    },
    async getYears() {
      const incomeYears = await window.call.getIncomeList({}, {});
      const incomeYearsArr = [];
      for (let income of incomeYears) {
        incomeYearsArr.push(income.incomeDate.slice(0, 4));
      }
      return Array.from([...new Set(incomeYearsArr)].sort((a, b) => b - a));
    },
    async deleteIncome(income) {
      if (
        window.confirm(
          "下記のデータを削除してよろしいですか？\n取引先：" +
          income.customerName +
          "\n日付：" +
          this.getJpDate(income.incomeDate) +
          "\n金額：" +
          income.incomeAmount.toLocaleString() +
          "円"
        )
      ) {
        await window.call.deleteIncome({ _id: income._id }, false);
        this.dbQuery();
      }
    },
    async deleteMultiple() {
      const elems = document.querySelectorAll(".check");
      const ids = [];
      for (let elem of elems) {
        if (elem.checked) ids.push(elem.id);
      }
      if (ids.length) {
        if (
          window.confirm(
            ids.length + "件のデータを削除します。よろしいですか？"
          )
        ) {
          await window.call.deleteIncome({ _id: { $in: ids } }, true);
          this.dbQuery();
        }
      }
    },
    editable(id) {
      const elem = document.getElementById(id);
      elem.classList.add("form-control");
      elem.classList.remove("form-control-plaintext");
      elem.readOnly = false;
      const spanBtn = document.getElementById("btn-" + id);
      spanBtn.classList.remove("d-none");
    },
    async noEditable(id) {
      const elem = document.getElementById(id);
      const idSplit = elem.id.split("-");
      const modifyBefore = await window.call.getIncomeData({ _id: idSplit[1] });

      elem.value = modifyBefore["income" + idSplit[0].substring(0, 1).toUpperCase() + idSplit[0].substring(1)];
      elem.classList.add("form-control-plaintext");
      elem.classList.remove("form-control");
      elem.classList.remove("is-invalid");
      elem.readOnly = true;
      const spanBtn = document.getElementById("btn-" + id);
      spanBtn.classList.add("d-none");
    },
    checkAll() {
      const all = document.getElementById("checkAll");
      const checks = document.getElementsByClassName("check");
      const bool = all.checked;
      for (const check of checks) {
        check.checked = bool;
      }
      this.checkDeleteEnableFlg = bool;
    },
    handleCheckAll() {
      const all = document.getElementById("checkAll");
      const checks = document.getElementsByClassName("check");
      let bool = true;
      let boolBtnEnable = false;
      for (const check of checks) {
        if (check.checked == false) {
          bool = false;
        } else {
          boolBtnEnable = true;
        }
      }
      this.checkDeleteEnableFlg = boolBtnEnable;
      all.checked = bool;
    },
    async update(columnName, elementId, id) {
      const elem = document.getElementById(elementId);

      if (!elem.value) {
        elem.classList.add("is-invalid");
        return;
      } else {
        elem.classList.remove("is-invalid");
      }
      const updateContent = {};
      updateContent[columnName] =
        columnName == "customerId" || columnName == "incomeAmount"
          ? parseInt(elem.value)
          : elem.value;
      await window.call.updateIncome({ _id: id }, updateContent);

      this.dbQuery();
      elem.classList.add("form-control-plaintext");
      elem.classList.remove("form-control");
      elem.readOnly = true;
      const spanBtn = document.getElementById("btn-" + elementId);
      spanBtn.classList.add("d-none");
    },
    async getData() {
      const where = {};
      if (this.searchCustomer) {
        where.customerId = this.searchCustomer;
      }

      if (this.searchYear) {
        where.incomeDate = { $regex: new RegExp("^" + this.searchYear) };
      }

      const condition = {};
      if (where.customerId) {
        condition.customerId = where.customerId;
      }
      const customerData = await window.call.getCustomerList(condition, { sortSeq: 1 });

      let arr = [];
      for (let item of customerData) {
        arr = arr.concat(await this.getDataEachId(item, where));
      }
      return arr;
    },
    async getDataEachId(item, where) {
      where.customerId = item.customerId;
      const list = await window.call.getIncomeList(where, { incomeDate: 1 });
      for (let data of list) {
        data.customerName = item.customerName;
      }

      return list;
    },
  },

  watch: {
    incomes: function () {
      if (!this.incomes.length) {
        this.zeroMsg = "収入情報が存在しません。";
      } else {
        this.zeroMsg = "";
      }
    },
  },
  name: "IncomeListPage",
};
</script>
