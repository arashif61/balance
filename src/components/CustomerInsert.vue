<template>
  <div class="customerInsert">
    <div class="container mb-4">
      <h3>
        <i class="bi bi-building"></i><i class="bi bi-pen-fill sub"></i> 取引先登録
      </h3>
      <div class="row g-2 mb-2">
        <div class="col-10">
          <label for="customerNameInput"><i class="bi bi-building"></i> 取引先名</label>
          <input type="text" id="customerNameInput" v-model="customerName" class="form-control" />
          <div class="invalid-feedback">{{ invalidMsgName }}</div>
        </div>
        <div class="col-2 mb-2">
          <div class="row">
            <div class="col">
              <label><i class="bi bi-clock-history"></i> 公的年金</label>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <input v-model="customerSub" id="customerSubInput" class="cmn-toggle" type="checkbox" />
              <label tabindex="0" for="customerSubInput"></label>
            </div>
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
</template>

<script>
export default {
  data() {
    return {
      customerName: "",
      customerSub: false,
      invalidMsgName: "",
    };
  },
  props: {
    parentReload: {
      type: Function,
      required: true,
    },
  },
  methods: {
    async insert() {
      this.errMsg = "";
      this.msg = "";
      let errFlg = false;
      const customerNameInput = document.getElementById("customerNameInput");
      const requiredCheck = function (val, elem) {
        if (!val) {
          elem.classList.add("is-invalid");
          return false;
        } else {
          elem.classList.remove("is-invalid");
          return true;
        }
      };
      if (!requiredCheck(this.customerName, customerNameInput)) {
        this.invalidMsgName = "入力してください。";
        errFlg = true;
      } else {
        const err = await this.checkDuplicate(this.customerName);
        if (err) {
          this.invalidMsgName = "同じ名前の取引先が既に登録されています。";
          errFlg = true;
        }
      }
      if (errFlg) return;

      const newId = await this.getNewCustomerId();
      await this.insertCustomer(newId, this.customerName, this.customerSub);
      this.customerName = "";
      this.parentReload();
    },
    async checkDuplicate(customerName) {
      const result = await window.call.getCustomerList({ customerName: customerName }, {});
      return result.length;
    },
    async getNewCustomerId() {
      const result = await window.call.getCustomerList({}, { customerId: -1 });
      return result.length ? result[0].customerId + 1 : 1
    },
    async insertCustomer(newId, customerName, customerSub) {
      await window.call.insertCustomer({
        customerId: newId,
        customerName: customerName,
        customerSub: customerSub,
        sortSeq: newId,
      });
    },
  },
  name: "CustomerInsert",
};
</script>
