<template>
  <div class="incomeInsert">
    <IncomeInsertFocus :parentReload="modalClosed" />
    <div class="container mb-4">
      <div class="row mb-2">
        <div class="col-auto">
          <a class="collapse-btn" data-bs-toggle="collapse" href="#collapseExpenceInsert">
            <i class="bi bi-chevron-up h3 me-3 chevron"></i>
            <h3 class="d-inline">
              <i class="bi bi-cash-stack"></i><i class="bi bi-pen-fill sub"></i> 収入登録
            </h3>
          </a>
        </div>
        <div class="col d-flex align-items-center">
          <button class="btn btn-outline-dark fw-light" data-bs-toggle="modal" data-bs-target="#incomeInsertFocus">
            <i class="bi bi-headphones"></i> FOCUS
          </button>
        </div>
      </div>
      <div class="collapse show" id="collapseExpenceInsert">
        <div v-if="errMsg" class="alert alert-danger" role="alert">
          {{ errMsg }}
        </div>
        <div class="row mb-2">
          <label for="customerSelect" class="col-form-label col-2"><i class="bi bi-building"></i> 取引先</label>
          <div class="col-10">
            <select id="customerSelect" class="form-select" v-model="customerId">
              <option value="">選択してください</option>
              <option v-for="customer in customers" v-bind:key="customer.customerId" v-bind:value="customer.customerId">
                {{ customer.customerName }}
              </option>
            </select>
            <div class="invalid-feedback">選択してください。</div>
          </div>
        </div>
        <div class="row mb-2">
          <label for="incomeDateInput" class="col-form-label col-2"><i class="bi bi-calendar"></i> 日付</label>
          <div class="col-10">
            <input type="date" id="incomeDateInput" min="1900-01-01" max="9999-12-31" v-model="incomeDate"
              class="form-control" />
            <div class="invalid-feedback">有効な日付を入力してください。</div>
          </div>
        </div>
        <div class="row mb-2">
          <label for="incomeAmountInput" class="col-form-label col-2"><i class="bi bi-cash"></i> 金額</label>
          <div class="col-10">
            <div class="input-group has-validation">
              <span class="input-group-text">¥</span>
              <input type="number" id="incomeAmountInput" v-model.number="incomeAmount" class="form-control" />
              <div class="invalid-feedback">1以上で入力してください。</div>
            </div>
          </div>
        </div>
        <div class="text-end">
          <button @click="insert" class="btn btn-primary">
            <i class="bi bi-pencil-square"></i> 登録
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IncomeInsertFocus from "./IncomeInsertFocus.vue";

export default {
  components: {
    IncomeInsertFocus,
  },
  props: {
    parentReload: {
      type: Function,
      required: true,
    },
  },
  data() {
    const today = new Date();
    return {
      customers: [],
      customerId: "",
      incomeDate: [
        today.getFullYear(),
        "-",
        ("00" + (today.getMonth() + 1)).slice(-2),
        "-",
        ("00" + today.getDate()).slice(-2),
      ].join(""),
      incomeAmount: "",
      errMsg: "",
    };
  },
  async created() {
    this.customers = await window.call.getCustomerList({}, { sortSeq: 1 });
  },
  methods: {
    async insert() {
      this.errMsg = "";
      let errFlg = false;
      const customerSelect = document.getElementById("customerSelect");
      const incomeAmountInput = document.getElementById("incomeAmountInput");
      const incomeDateInput = document.getElementById("incomeDateInput");
      const requiredCheck = function (val, elem) {
        if (!val) {
          elem.classList.remove("is-valid");
          elem.classList.add("is-invalid");
          return false;
        } else {
          elem.classList.remove("is-invalid");
          elem.classList.add("is-valid");
          return true;
        }
      };
      if (!requiredCheck(this.customerId, customerSelect)) {
        errFlg = true;
      }
      if (!requiredCheck(this.incomeDate, incomeDateInput)) {
        errFlg = true;
      }
      if (this.incomeAmount <= 0) {
        incomeAmountInput.classList.add("is-invalid");
        incomeAmountInput.classList.remove("is-valid");
        errFlg = true;
      } else {
        incomeAmountInput.classList.remove("is-invalid");
        incomeAmountInput.classList.add("is-valid");
      }
      if (errFlg) return;

      window.call.insertIncome({
        customerId: this.customerId,
        incomeDate: this.incomeDate,
        incomeAmount: this.incomeAmount,
      });

      await this.parentReload();
    },
    async modalClosed() {
      await this.parentReload();
    },
  },
  name: "IncomeInsert",
};
</script>
