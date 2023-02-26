<template>
  <div class="expenceListPage">
    <ExpenceInsert :parentReload="dbQuery" />
    <div class="container mb-3">
      <div class="row">
        <div class="col-auto">
          <h3>
            <i class="bi bi-credit-card-fill"></i><i class="bi bi-ui-checks sub"></i> 支出一覧
          </h3>
        </div>
        <div class="col d-flex align-items-center">
          <button v-bind:disabled="!checkDeleteEnableFlg" @click="deleteMultiple" class="btn btn-outline-danger">
            <i class="bi bi-trash"></i> 選択データを削除
          </button>
        </div>
        <div class="col-3 pe-1">
          <div class="form-floating">
            <select id="searchExpenceItemSelect" @change="getData" v-model="searchExpenceItem" class="form-select">
              <option value="">すべて</option>
              <option v-for="expenceItem in expenceItems" v-bind:key="expenceItem.expenceItemId"
                v-bind:value="expenceItem.expenceItemId">
                {{ expenceItem.expenceItemName }}
              </option>
            </select>
            <label for="searchExpenceItemSelect"><i class="bi bi-basket"></i> 支出項目</label>
          </div>
        </div>
        <div class="col-2 ps-0">
          <div class="form-floating">
            <select id="searchYearSelect" class="form-select" @change="getData" v-model="searchYear">
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
      <div v-if="expences != ''">
        <table class="table table-sm table-hover mb-2">
          <colgroup style="width: 5%"></colgroup>
          <colgroup style="width: 30%"></colgroup>
          <colgroup style="width: 20%"></colgroup>
          <colgroup style="width: 20%"></colgroup>
          <colgroup style="width: 20%"></colgroup>
          <colgroup style="width: 5%"></colgroup>
          <thead>
            <tr>
              <th>
                <input @change="checkAll" id="checkAll" type="checkbox" class="form-check-input" />
              </th>
              <th><i class="bi bi-basket"></i> 支出項目</th>
              <th><i class="bi bi-calendar"></i> 日付</th>
              <th><i class="bi bi-cash"></i> 金額</th>
              <th><i class="bi bi-sticky"></i> 備考</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expence in expences" v-bind:key="expence._id">
              <td class="align-middle">
                <input type="checkbox" @change="handleCheckAll" v-bind:id="expence._id"
                  class="form-check-input check" />
              </td>
              <td class="align-middle cursor-def">
                {{ expence.expenceItemName }}
              </td>
              <td>
                <div class="row">
                  <div class="col-auto">
                    <input @keydown.esc="noEditable('date-' + expence._id)" @click="editable" readonly type="date"
                      class="form-control-plaintext" v-bind:id="'date-' + expence._id"
                      v-bind:value="expence.expenceDate" />
                    <div class="invalid-feedback">有効な日付を入力してください。</div>
                  </div>
                  <div v-bind:id="'btn-date-' + expence._id" class="d-none col-auto">
                    <button @click="
                      update(
                        'expenceDate',
                        'date-' + expence._id,
                        expence._id
                      )
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('date-' + expence._id)" class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <div class="col-auto d-flex align-items-center">¥</div>
                  <div class="col-8">
                    <input @keydown.esc="noEditable('amount-' + expence._id)" @click="editable" readonly type="number"
                      class="form-control-plaintext" v-bind:id="'amount-' + expence._id"
                      v-bind:value="expence.expenceAmount" />
                    <div class="invalid-feedback">入力してください。</div>
                  </div>
                  <div v-bind:id="'btn-amount-' + expence._id" class="d-none col-auto">
                    <button @click="
                      update(
                        'expenceAmount',
                        'amount-' + expence._id,
                        expence._id
                      )
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('amount-' + expence._id)" class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <div class="col-auto">
                    <input @keydown.esc="noEditable('note-' + expence._id)" @click="editable" readonly type="text"
                      class="form-control-plaintext" v-bind:id="'note-' + expence._id"
                      v-bind:value="expence.expenceNote" />
                    <div class="invalid-feedback">入力してください。</div>
                  </div>
                  <div v-bind:id="'btn-note-' + expence._id" class="d-none col-auto">
                    <button @click="
                      update(
                        'expenceNote',
                        'note-' + expence._id,
                        expence._id
                      )
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('note-' + expence._id)" class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td class="text-end">
                <button @click="deleteExpence(expence)" class="btn btn-sm btn-light trash-each">
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
import ExpenceInsert from "@/components/ExpenceInsert.vue";

export default {
  components: { ExpenceInsert },

  data() {
    return {
      searchExpenceItem: "",
      searchYear: "",
      expences: "",
      expenceItems: "",
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
      const expenceItemList = await window.call.getExpenceItemList({}, { sortSeq: 1 });
      this.expenceItems = expenceItemList;

      this.years = await this.getYears();
      if (!this.years.includes(this.searchYear)) {
        this.searchYear = "";
      }
      await this.getData();
    },
    async getYears() {
      const expenceYears = await window.call.getExpenceList({}, {});
      const expenceYearsArr = [];
      for (let expence of expenceYears) {
        expenceYearsArr.push(expence.expenceDate.slice(0, 4));
      }
      return Array.from([...new Set(expenceYearsArr)].sort((a, b) => b - a));
    },
    getJpDate(dateStr) {
      const date = new Date(dateStr.replaceAll("-", "/"));
      const options = { year: "numeric", month: "narrow", day: "numeric" };
      return new Intl.DateTimeFormat("ja-JP", options).format(date);
    },
    async deleteExpence(expence) {
      if (
        window.confirm(
          "下記のデータを削除してよろしいですか？\n支出項目：" +
          expence.expenceItemName +
          "\n日付：" +
          this.getJpDate(expence.expenceDate) +
          "\n金額：" +
          expence.expenceAmount.toLocaleString() +
          "円"
        )
      ) {
        await window.call.deleteExpence({ _id: expence._id }, false);
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
          await window.call.deleteExpence({ _id: { $in: ids } }, true);
          this.dbQuery();
        }
      }
    },
    editable(event) {
      const elem = event.target;
      elem.classList.add("form-control");
      elem.classList.remove("form-control-plaintext");
      elem.readOnly = false;
      const spanBtn = document.getElementById("btn-" + elem.id);
      spanBtn.classList.remove("d-none");
    },
    async noEditable(id) {
      const elem = document.getElementById(id);
      const idSplit = elem.id.split("-");
      const modifyBefore = await window.call.getExpenceDataById(idSplit[1]);
      const valModifyBefore = modifyBefore["expence" + idSplit[0].substring(0, 1).toUpperCase() + idSplit[0].substring(1)];
      elem.value = valModifyBefore != undefined ? valModifyBefore : "";
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
      let boolCheckDelete = false;
      for (const check of checks) {
        if (check.checked == false) {
          bool = false;
        } else {
          boolCheckDelete = true;
        }
      }
      this.checkDeleteEnableFlg = boolCheckDelete;
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
        columnName == "expenceItemId" || columnName == "expenceAmount"
          ? parseInt(elem.value)
          : elem.value;
      await window.call.updateExpence(id, updateContent);

      this.dbQuery();
      elem.classList.add("form-control-plaintext");
      elem.classList.remove("form-control");
      elem.readOnly = true;
      const spanBtn = document.getElementById("btn-" + elementId);
      spanBtn.classList.add("d-none");
    },
    async getData() {
      const where = {};
      if (this.searchExpenceItem) {
        where.expenceItemId = this.searchExpenceItem;
      }

      if (this.searchYear) {
        where.expenceDate = { $regex: new RegExp("^" + this.searchYear) };
      }

      const condition = {};
      if (where.expenceItemId) {
        condition.expenceItemId = where.expenceItemId;
      }
      const expenceItemData = await window.call.getExpenceItemList(condition, { sortSeq: 1 });
      let arr = [];
      for (let item of expenceItemData) {
        arr = arr.concat(await this.getDataEachId(item, where));
      }
      this.expences = arr;
    },
    async getDataEachId(item, where) {
      const whereCond = where;
      whereCond.expenceItemId = item.expenceItemId;
      const list = await window.call.getExpenceList(whereCond, { expenceDate: 1 });
      for (let data of list) {
        data.expenceItemName = item.expenceItemName;
      }

      return list;
    },
  },
  watch: {
    expences: function () {
      if (!this.expences.length) {
        this.zeroMsg = "支出情報が存在しません。";
      } else {
        this.zeroMsg = "";
      }
    },
  },
  name: "ExpenceListPage",
};
</script>
