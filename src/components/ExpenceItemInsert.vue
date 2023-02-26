<template>
  <div class="expenceItemInsert">
    <div class="container mb-4">
      <h3>
        <i class="bi bi-basket"></i><i class="bi bi-pen-fill sub"></i> 支出項目登録
      </h3>
      <div class="row g-2 mb-2">
        <div class="col-9">
          <label for="expenceItemNameInput"><i class="bi bi-basket"></i> 支出項目名</label>
          <input type="text" id="expenceItemNameInput" v-model="expenceItemName" class="form-control" />
          <div class="invalid-feedback">
            {{ invalidMsgName }}
          </div>
        </div>
        <div class="col">
          <label for="expenceItemRateInput"><i class="bi bi-percent"></i> 割合</label>
          <div class="input-group has-validation">
            <input type="number" id="expenceItemRateInput" v-model="expenceItemRate" class="form-control" />
            <span class="input-group-text"><i class="bi bi-percent"></i></span>
            <div class="invalid-feedback">入力してください。</div>
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
      expenceItemName: "",
      expenceItemRate: 100,
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
      this.msg = "";
      this.invalidMsgName = "";
      let errFlg = false;
      const expenceItemNameInput = document.getElementById(
        "expenceItemNameInput"
      );
      const expenceItemRateInput = document.getElementById(
        "expenceItemRateInput"
      );
      const requiredCheck = function (val, elem) {
        if (!val) {
          elem.classList.add("is-invalid");
          return false;
        } else {
          elem.classList.remove("is-invalid");
          return true;
        }
      };

      if (!requiredCheck(this.expenceItemName, expenceItemNameInput)) {
        errFlg = true;
        this.invalidMsgName = "入力してください。";
      } else {
        const err = await window.call.getExpenceItemList({ expenceItemName: this.expenceItemName }, {});

        if (err.length) {
          errFlg = true;
          this.invalidMsgName = "同じ名前の支出項目が既に登録されています。";
          expenceItemNameInput.classList.add("is-invalid");
        }
      }
      if (!requiredCheck(this.expenceItemRate, expenceItemRateInput)) {
        errFlg = true;
      }
      if (errFlg) return;

      const newId = await this.getNewExpenceItemId();
      window.call.insertExpenceItem({
        expenceItemId: newId,
        expenceItemName: this.expenceItemName,
        expenceItemRate: this.expenceItemRate * 0.01,
        sortSeq: newId,
      });

      this.expenceItemName = "";
      this.parentReload();
    },
    async getNewExpenceItemId() {
      const list = await window.call.getExpenceItemList({}, { expenceItemId: -1 });
      return list.length ? list[0].expenceItemId + 1 : 1;
    },
  },
  name: "ExpenceItemInsert",
};
</script>
