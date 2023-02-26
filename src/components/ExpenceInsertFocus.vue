<template>
  <div class="expenceInsertFocus">
    <div id="expenceInsertFocus" class="modal fade">
      <div class="modal-dialog modal-dialog-scrollable modal-fullscreen">
        <div class="modal-content">
          <div class="container mb-4">
            <div class="modal-header">
              <div class="row">
                <div class="col-auto me-5">
                  <h3 class="fw-light">
                    <i class="bi bi-credit-card-fill"></i><i class="bi bi-headphones sub"></i>
                    <span class="pe-3 me-3 border-right">支出登録</span>FOCUS
                  </h3>
                </div>
                <div class="col-auto">
                  <div class="row">
                    <div class="col-auto">
                      <div class="row">
                        <div class="col-auto">
                          <label for="colNum" class="align-middle"><i class="bi bi-table"></i> 表の数</label>
                        </div>
                        <div class="col">
                          <input min="1" max="10" @change="reCreate" type="number" style="width: 70px" id="colNum"
                            class="form-control form-control-sm" :value="colNum.length" />
                        </div>
                      </div>
                    </div>
                    <div class="col-auto">
                      <div class="row">
                        <div class="col-auto">
                          <label for="rowNum" class="align-middle"><i class="bi bi-list"></i> 表の行数</label>
                        </div>
                        <div class="col-auto">
                          <input min="1" max="30" @change="reCreate" type="number" style="width: 70px" id="rowNum"
                            class="form-control form-control-sm" :value="rowNum.length" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-auto cursor-def">
                      <i class="bi bi-exclamation-triangle-fill text-warning pe-1 h5 mb-0"></i><small>
                        表の数／行数を減らすと入力済みの内容は消去されます。</small>
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="errMsgs.length" class="alert alert-danger" role="alert">
                <div v-for="errMsg of errMsgs" v-bind:key="errMsg">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ errMsg }}
                </div>
              </div>
              <div class="row gx-5" v-if="show">
                <div class="col-6 mb-5" v-for="n of colNum" v-bind:key="n">
                  <div class="row">
                    <div class="col-6">
                      <label v-bind:for="'focusExpenceItem' + n"><i class="bi bi-basket"></i> 支出項目</label>
                      <select v-bind:id="'focusExpenceItem' + n" class="form-select form-select-sm">
                        <option value="">選択...</option>
                        <option v-bind:value="item.expenceItemId" v-for="item of expenceItems"
                          v-bind:key="item.expenceItemId">
                          {{ item.expenceItemName }}
                        </option>
                      </select>
                      <div class="invalid-feedback">
                        支出項目を選択してください。
                      </div>
                    </div>
                    <div class="col-3">
                      <label v-bind:for="'focusExpenceYear' + n"><i class="bi bi-calendar"></i> 年</label>
                      <input maxlength="4" v-bind:id="'focusExpenceYear' + n" class="form-control form-control-sm"
                        placeholder="数字4桁" />
                      <div class="invalid-feedback">年を入力してください。</div>
                    </div>
                    <div class="col mb-2">
                      <div class="row">
                        <div class="col">
                          <label><i class="bi bi-sticky"></i> 備考</label>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col">
                          <input @change="toggleNote" :id="'noteToggle' + n" class="cmn-toggle" type="checkbox" />
                          <label tabindex="0" :for="'noteToggle' + n"></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <table :id="'table' + n" class="table table-dark table-sm table-hover">
                    <colgroup style="width: 3%"></colgroup>
                    <colgroup style="width: 30%"></colgroup>
                    <colgroup style="width: 37%"></colgroup>
                    <colgroup style="width: 30%"></colgroup>
                    <thead>
                      <tr>
                        <th class="fw-normal"><i class="bi bi-hash"></i></th>
                        <th class="fw-normal">
                          <i class="bi bi-calendar"></i> 日付
                        </th>
                        <th class="fw-normal">
                          <i class="bi bi-cash"></i> 金額
                        </th>
                        <th :id="'thNote' + n" class="d-none fw-normal">
                          <i class="bi bi-sticky"></i> 備考
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="k of rowNum" v-bind:key="k">
                        <td class="cursor-def">
                          <small>{{ k }}</small>
                        </td>
                        <td>
                          <input type="text" v-bind:name="'date-' + n + '-' + k" v-bind:id="'date-' + n + '-' + k"
                            maxlength="4" class="form-control form-control-sm focus-input" placeholder="ex. 1231" />
                          <div class="invalid-feedback">
                            有効な日付を入力してください。
                          </div>
                        </td>
                        <td>
                          <input type="number" v-bind:name="'amount-' + n + '-' + k" v-bind:id="'amount-' + n + '-' + k"
                            class="form-control form-control-sm focus-input" />
                          <div class="invalid-feedback">入力してください。</div>
                        </td>
                        <td :id="'tdNote' + n + '-' + k" class="d-none">
                          <input type="text" v-bind:name="'note-' + n + '-' + k" v-bind:id="'note-' + n + '-' + k"
                            class="form-control form-control-sm focus-input" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline-light me-4" @click="insert">
                <i class="bi bi-pencil-square"></i> 登録
              </button>
              <button class="btn btn-outline-warning" @click="clear">
                <i class="bi bi-eraser-fill"></i> クリア
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="position-fixed bottom-0 start-0 p-4" style="z-index: 3000">
      <div id="registeredToast" class="toast align-items-center hide bg-light" data-bs-delay="2000">
        <div class="d-flex">
          <div class="toast-body">{{ registeredNum }}件登録しました。</div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="閉じる"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
@import "../focus.scss";
</style>

<script>
export default {
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
      errMsgs: [],
      rowNum: [...Array(13)].map((_, i) => i + 1),
      colNum: [...Array(2)].map((_, i) => i + 1),
      show: true,
      registeredNum: 0,
    };
  },
  props: {
    parentReload: {
      type: Function,
      required: true,
    },
  },
  async created() {
    const list = await window.call.getExpenceItemList({}, { sortSeq: 1 });
    this.expenceItems = list;
  },
  methods: {
    reCreate() {
      const rowNum = document.getElementById("rowNum");
      const colNum = document.getElementById("colNum");

      if (Number(rowNum.value) > rowNum.max) {
        rowNum.value = rowNum.max;
      } else if (Number(rowNum.value) < rowNum.min) {
        rowNum.value = rowNum.min;
      }
      if (Number(colNum.value) > colNum.max) {
        colNum.value = colNum.max;
      } else if (Number(colNum.value) < rowNum.min) {
        colNum.value = colNum.min;
      }
      this.rowNum = [...Array(Number(rowNum.value))].map((_, i) => i + 1);
      this.colNum = [...Array(Number(colNum.value))].map((_, i) => i + 1);
    },
    async insert() {
      this.errMsgs = "";
      const isInvalid = function () {
        // eventで拾ったチェックエラー検証
        let bool = false;
        const focus = document.querySelector("#expenceInsertFocus");
        const es = focus.querySelectorAll(".focus-input");
        es.forEach((e) => {
          if (e.classList.contains("is-invalid")) bool = true;
        });
        const expenceItems = focus.querySelectorAll("[id^='focusExpenceItem']");
        expenceItems.forEach((e) => {
          if (e.classList.contains("is-invalid")) bool = true;
        });
        const years = focus.querySelectorAll("[id^='focusExpenceYear']");
        years.forEach((e) => {
          if (e.classList.contains("is-invalid")) bool = true;
        });
        return bool;
      };
      if (isInvalid()) {
        // エラーがあった場合処理終了
        return false;
      }

      const focus = document.querySelector("#expenceInsertFocus");
      const amounts = focus.querySelectorAll("[id^='amount-']");
      const dates = focus.querySelectorAll("[id^='date-']");
      const notes = focus.querySelectorAll("[id^='note-']");
      const amountValues = this.getValues(amounts);
      const dateValues = this.getValues(dates);
      const noteValues = this.getValues(notes);
      const merged = [];
      amountValues.forEach((amount, index) => {
        const year = document.getElementById("focusExpenceYear" + (index + 1));
        const expenceItem = document.getElementById(
          "focusExpenceItem" + (index + 1)
        );
        const note = document.getElementById("noteToggle" + (index + 1));
        const arrEach = [];
        const dictEach = {
          expenceItem: expenceItem.value,
          expenceItemElem: expenceItem,
          year: year.value,
          yearElem: year,
          noteFlg: note.checked,
        };
        amount.forEach((am, index2) => {
          arrEach.push({
            date: dateValues[index][index2],
            dateElem: dates[this.rowNum.length * index + index2],
            amount: am,
            amountElem: amounts[this.rowNum.length * index + index2],
            note: noteValues[index][index2],
          });
        });
        dictEach.content = arrEach.slice();
        merged.push(dictEach);
        arrEach.length = 0;
      });
      // 項目チェック
      if (await this.checkValues(merged)) {
        // エラーがあった場合処理終了
        return false;
      }

      const arrReduced = this.reduceEmptyObj(merged);
      const registeredNum = await this.insertLogic(arrReduced);
      if (registeredNum > 0) {
        this.registeredNum = registeredNum;
        const bootstrap = new require("bootstrap");
        const registeredToast = document.getElementById("registeredToast");
        const toast = new bootstrap.Toast(registeredToast);
        toast.show();
      }
    },
    getValues(elems) {
      const result = [];
      let preNum = 1;
      const resultEach = [];
      elems.forEach((elem) => {
        if (preNum != elem.id.split("-")[1]) {
          result.push(resultEach.slice());
          resultEach.length = 0;
        }
        resultEach.push(elem.value);
        preNum = elem.id.split("-")[1];
      });
      result.push(resultEach.slice());
      return result;
    },
    async checkValues(arr) {
      let result = false;
      const errMsgs = [];
      for (let docs of arr) {
        // 支出項目と年がどちらかしか入っていない
        if (!docs.year && docs.expenceItem) {
          docs.yearElem.classList.add("is-invalid");
          result = true;
          continue;
        } else if (docs.year && !docs.expenceItem) {
          docs.expenceItemElem.classList.add("is-invalid");
          result = true;
          continue;
        }
        let cnt = this.rowNum.length;
        for (let doc of docs.content) {
          if (docs.year && docs.expenceItem && !doc.date && !doc.amount) {
            cnt--;
          } else if (docs.year && docs.expenceItem) {
            if (!doc.date && doc.amount) {
              doc.dateElem.classList.add("is-invalid");
              result = true;
            } else if (doc.date && !doc.amount) {
              doc.amountElem.classList.add("is-invalid");
              result = true;
            }
          }
        }
        if (cnt == 0) {
          const expenceItem = await window.call.getExpenceItemDataById(Number(docs.expenceItem));

          errMsgs.push(
            `支出項目:${expenceItem.expenceItemName}(${docs.year}年)の表について、日付と金額を入力してください。`
          );
          result = true;
        }
      }
      if (errMsgs.length) this.errMsgs = errMsgs;
      return result;
    },
    reduceEmptyObj(arr) {
      const arrResult = [];
      arr.forEach((docs) => {
        const arrEach = [];
        for (let doc of docs.content) {
          if (doc.date.length && doc.amount.length) {
            arrEach.push({
              date: doc.date,
              amount: doc.amount,
              note: doc.note,
            });
          }
        }
        arrResult.push({
          year: docs.year,
          expenceItem: docs.expenceItem,
          content: arrEach.slice(),
          noteFlg: docs.noteFlg,
        });
      });
      return arrResult;
    },
    async insertLogic(arr) {
      const arrIns = [];
      let expenceItemId = "";
      let year = "";
      arr.forEach((elem) => {
        expenceItemId = elem.expenceItem;
        year = elem.year;
        elem.content.forEach((e) => {
          const item = {
            expenceItemId: Number(expenceItemId),
            expenceDate:
              year + "-" + e.date.substring(0, 2) + "-" + e.date.substring(2),
            expenceAmount: Number(e.amount),
          };
          if (elem.noteFlg) item.expenceNote = e.note;
          arrIns.push(item);
        });
      });


      return await window.call.insertExpence(arrIns);
    },
    toggleNote(event) {
      const num = event.target.id.replace("noteToggle", "");
      const th = document.getElementById("thNote" + num);
      const focus = document.querySelector("#expenceInsertFocus");
      const tds = focus.querySelectorAll("[id^='tdNote" + num + "-']");
      if (event.target.checked) {
        th.classList.remove("d-none");
        tds.forEach((td) => {
          td.classList.remove("d-none");
        });
      } else {
        th.classList.add("d-none");
        tds.forEach((td) => {
          td.classList.add("d-none");
        });
      }
    },
    clear() {
      if (window.confirm("入力内容をすべてクリアします。よろしいですか？")) {
        this.errMsgs = "";
        const focus = document.querySelector("#expenceInsertFocus");
        const es = focus.querySelectorAll(".focus-input");
        es.forEach((e) => {
          e.value = "";
          e.classList.remove("is-invalid");
        });
        const expenceItems = focus.querySelectorAll("[id^='focusExpenceItem']");
        expenceItems.forEach((e) => {
          e.value = "";
          e.classList.remove("is-invalid");
        });
        const years = focus.querySelectorAll("[id^='focusExpenceYear']");
        years.forEach((e) => {
          e.value = "";
          e.classList.remove("is-invalid");
        });
      }
    },
  },
  mounted() {
    // モーダル閉じたときの一覧部再読み込み呼び出し
    const modal = document.getElementById("expenceInsertFocus");
    modal.addEventListener("hidden.bs.modal", this.parentReload);
  },
  updated() {
    // 一覧入力部のバリデーション
    const listElemsCheck = function (target) {
      const number = parseInt(target.value);
      if (/amount-./.test(target.id)) {
        target.value = number;
        if (target.value) {
          target.classList.remove("is-invalid");
        }
      } else if (/date-./.test(target.id)) {
        const yElem = document.getElementById(
          `focusExpenceYear${target.id.split("-")[1]}`
        );
        if (target.value && (!yElem.value || isNaN(yElem.value))) {
          target.classList.remove("is-invalid");
          yElem.classList.add("is-invalid");
          return;
        }
        const y = yElem.value;
        const m = target.value.substring(0, 2) - 1;
        const d = target.value.substring(2, 4);
        const date = new Date(y, m, d);
        if (
          target.value &&
          (isNaN(number) ||
            date.getFullYear() != y ||
            date.getMonth() != m ||
            date.getDate() != d ||
            target.value.length != 4)
        ) {
          target.classList.add("is-invalid");
        } else {
          target.classList.remove("is-invalid");
        }
      }
    };

    const focus = document.querySelector("#expenceInsertFocus");
    const listElems = focus.querySelectorAll(".focus-input");
    listElems.forEach((elem) => {
      elem.addEventListener("focusout", (event) => {
        listElemsCheck(event.target, elem);
      });
    });

    // ヘッダ部のバリデーション
    const years = focus.querySelectorAll("[id^='focusExpenceYear']");
    years.forEach((elem) => {
      elem.addEventListener("focusout", (event) => {
        const date = new Date(event.target.value, 0, 1);
        if (
          event.target.value &&
          (isNaN(event.target.value) ||
            date.getFullYear() != event.target.value ||
            date.getMonth() != 0 ||
            date.getDate() != 1)
        ) {
          event.target.classList.add("is-invalid");
        } else {
          event.target.classList.remove("is-invalid");
          listElems.forEach((elem) => {
            listElemsCheck(elem);
          });
        }
        const num = event.target.id.replace("focusExpenceYear", "");
        const exItem = document.getElementById("focusExpenceItem" + num);
        if (!exItem.value && event.target.value) {
          exItem.classList.add("is-invalid");
        } else {
          exItem.classList.remove("is-invalid");
        }
      });
    });

    const exItems = focus.querySelectorAll("[id^='focusExpenceItem']");
    exItems.forEach((elem) => {
      elem.addEventListener("change", (event) => {
        const num = event.target.id.replace("focusExpenceItem", "");
        const exYear = document.getElementById("focusExpenceYear" + num);

        if (!event.target.value && exYear.value) {
          event.target.classList.add("is-invalid");
        } else {
          event.target.classList.remove("is-invalid");
        }
      });
    });
  },
  name: "ExpenceInsertFocus",
};
</script>
