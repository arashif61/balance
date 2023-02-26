<template>
  <div class="expenceInsert">
    <ExpenceInsertFocus :parentReload="modalClosed" />
    <div class="container mb-4">
      <div class="row mb-2">
        <div class="col-auto">
          <a class="collapse-btn" data-bs-toggle="collapse" href="#collapseExpenceInsert">
            <i class="bi bi-chevron-up h3 me-3 chevron"></i>
            <h3 class="d-inline">
              <i class="bi bi-credit-card-fill"></i><i class="bi bi-pen-fill sub"></i> 支出登録
            </h3>
          </a>
        </div>
        <div class="col d-flex align-items-center">
          <button class="btn btn-outline-dark fw-light" data-bs-toggle="modal" data-bs-target="#expenceInsertFocus">
            <i class="bi bi-headphones"></i> FOCUS
          </button>
        </div>
      </div>
      <div class="collapse show" id="collapseExpenceInsert">
        <div v-if="errMsg" class="alert alert-danger" role="alert">
          {{ errMsg }}
        </div>
        <div class="row mb-2">
          <label for="expenceItemSelect" class="col-form-label col-2"><i class="bi bi-basket"></i> 支出項目</label>
          <div class="col-10">
            <select class="form-select" id="expenceItemSelect" v-model="expenceItemId">
              <option value="">選択してください</option>
              <option v-for="expenceItem in expenceItems" v-bind:key="expenceItem.expenceItemId"
                v-bind:value="expenceItem.expenceItemId">
                {{ expenceItem.expenceItemName }}
              </option>
            </select>
            <div class="invalid-feedback">選択してください。</div>
          </div>
        </div>
        <div class="row mb-2">
          <label for="expenceDateInput" class="col-form-label col-2"><i class="bi bi-calendar"></i> 日付</label>
          <div class="col-10">
            <input type="date" min="1900-01-01" max="9999-12-31" id="expenceDateInput" v-model="expenceDate"
              class="form-control" />
            <div class="invalid-feedback">有効な日付を入力してください。</div>
          </div>
        </div>
        <div class="row mb-2">
          <label for="expenceAmountInput" class="col-form-label col-2"><i class="bi bi-cash"></i> 金額</label>
          <div class="col-10">
            <div class="input-group has-validation">
              <span class="input-group-text">¥</span>
              <input type="number" id="expenceAmountInput" v-model.number="expenceAmount" class="form-control" />
              <div class="invalid-feedback">1以上で入力してください。</div>
            </div>
          </div>
        </div>
        <div class="row mb-2">
          <label for="expenceNoteInput" class="col-form-label col-2"><i class="bi bi-sticky"></i> 備考</label>
          <div class="col-10">
            <input type="text" v-model="expenceNote" class="form-control" id="expenceNoteInput" />
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
import ExpenceInsertFocus from "./ExpenceInsertFocus.vue";

export default {
  components: {
    ExpenceInsertFocus,
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
      expenceItems: [],
      expenceItemId: "",
      expenceDate: [
        today.getFullYear(),
        "-",
        ("00" + (today.getMonth() + 1)).slice(-2),
        "-",
        ("00" + today.getDate()).slice(-2),
      ].join(""),
      expenceAmount: "",
      expenceNote: "",
      errMsg: "",
    };
  },
  created() {
    this.getPulldown();
  },
  methods: {
    async getPulldown() {
      const list = await window.call.getExpenceItemList({}, { sortSeq: 1 });
      this.expenceItems = list;
    },
    async insert() {
      this.errMsg = "";
      let errFlg = false;
      const expenceItemSelect = document.getElementById("expenceItemSelect");
      const expenceAmountInput = document.getElementById("expenceAmountInput");
      const expenceDateInput = document.getElementById("expenceDateInput");
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
      if (!requiredCheck(this.expenceItemId, expenceItemSelect)) {
        errFlg = true;
      }
      if (!requiredCheck(this.expenceDate, expenceDateInput)) {
        errFlg = true;
      }

      if (this.expenceAmount <= 0) {
        expenceAmountInput.classList.add("is-invalid");
        expenceAmountInput.classList.remove("is-valid");
        errFlg = true;
      } else {
        expenceAmountInput.classList.remove("is-invalid");
        expenceAmountInput.classList.add("is-valid");
      }
      if (errFlg) return;

      window.call.insertExpence({
        expenceItemId: this.expenceItemId,
        expenceDate: this.expenceDate,
        expenceAmount: this.expenceAmount,
        expenceNote: this.expenceNote,
      });

      expenceItemSelect.classList.remove("is-valid");
      expenceAmountInput.classList.remove("is-valid");
      expenceDateInput.classList.remove("is-valid");
      await this.parentReload();
    },
    async modalClosed() {
      await this.parentReload();
    },
  },
  name: "ExpenceInsert",
};
</script>
