<template>
  <div class="expenceItemListPage">
    <ExpenceItemInsert :parentReload="reload" />
    <div class="container">
      <h3>
        <i class="bi bi-basket"></i><i class="bi bi-ui-checks sub"></i> 支出項目一覧
      </h3>
      <div v-if="zeroMsg != ''" class="text-center">
        <i class="bi bi-cloud-drizzle-fill h1 me-2"></i><span class="zero-msg">{{ zeroMsg }}</span>
      </div>
      <!-- 検索結果テーブル -->
      <div v-if="expenceItems.length">
        <table class="table table-sm table-hover mb-2">
          <thead>
            <tr>
              <th></th>
              <th><i class="bi bi-basket"></i> 支出項目名</th>
              <th><i class="bi bi-percent"></i> 割合</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="expenceItemListTable">
            <tr v-bind:id="expenceItem.expenceItemId" class="expence-item-tr" v-for="expenceItem in expenceItems"
              v-bind:key="expenceItem.expenceItemId">
              <td class="handle"><i class="bi bi-grip-vertical"></i></td>
              <td>
                <div class="row">
                  <div class="col">
                    <input @keydown.esc="
                      noEditable('name-' + expenceItem.expenceItemId)
                    " @click="editable('name-' + expenceItem.expenceItemId)" readonly class="form-control-plaintext"
                      v-bind:id="'name-' + expenceItem.expenceItemId" v-bind:value="expenceItem.expenceItemName" />
                    <div class="invalid-feedback">入力してください。</div>
                  </div>
                  <div v-bind:id="'btn-name-' + expenceItem.expenceItemId" class="d-none col-auto">
                    <button @click="
                      update(
                        'expenceItemName',
                        'name-' + expenceItem.expenceItemId,
                        expenceItem.expenceItemId
                      )
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('name-' + expenceItem.expenceItemId)"
                      class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div class="row">
                  <div class="col-3">
                    <input @keydown.esc="
                      noEditable('rate-' + expenceItem.expenceItemId)
                    " @click="editable('rate-' + expenceItem.expenceItemId)" readonly type="number"
                      class="form-control-plaintext" v-bind:id="'rate-' + expenceItem.expenceItemId"
                      v-bind:value="expenceItem.expenceItemRate * 100" />
                    <div class="invalid-feedback">
                      数値（半角）を1以上で入力してください。
                    </div>
                  </div>
                  <div class="col-2 d-flex align-items-center">
                    <i class="bi bi-percent"></i>
                  </div>
                  <div v-bind:id="'btn-rate-' + expenceItem.expenceItemId" class="d-none col-auto">
                    <button @click="
                      update(
                        'expenceItemRate',
                        'rate-' + expenceItem.expenceItemId,
                        expenceItem.expenceItemId
                      )
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('rate-' + expenceItem.expenceItemId)"
                      class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td class="text-end">
                <button @click="deleteExpenceItem(expenceItem)" class="btn btn-sm btn-light trash-each">
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
import ExpenceItemInsert from "@/components/ExpenceItemInsert.vue";
import Sortable from "sortablejs";

export default {
  components: { ExpenceItemInsert },
  data() {
    return {
      expenceItems: "",
      zeroMsg: "",
    };
  },
  created() {
    this.reload();
  },
  methods: {
    async reload() {
      this.expenceItems = await window.call.getExpenceItemList({}, { sortSeq: 1 });
    },
    async deleteExpenceItem(expenceItem) {
      const id = expenceItem.expenceItemId;
      const name = expenceItem.expenceItemName;
      if (
        window.confirm("支出項目「" + name + "」を削除してよろしいですか？")
      ) {
        const checkResult = await window.call.getExpenceList({ expenceItemId: id }, {});
        if (checkResult.length) {
          if (
            window.confirm(
              "支出項目「" +
              name +
              "」に紐づく支出情報も削除されますが、よろしいですか？"
            )
          ) {
            await window.call.deleteExpenceItem({ expenceItemId: id }, false);
            await window.call.deleteExpence({ expenceItemId: id }, true);
          } else {
            return;
          }
        } else {
          await window.call.deleteExpenceItem({ expenceItemId: id }, false);
        }
      }
      this.reload();
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
      const modifyBefore = await window.call.getExpenceItemList({ expenceItemId: Number(idSplit[1]) }, {});
      elem.value = modifyBefore["expenceItem" + idSplit[0].substring(0, 1).toUpperCase() + idSplit[0].substring(1)];
      elem.classList.add("form-control-plaintext");
      elem.classList.remove("form-control");
      elem.classList.remove("is-invalid");
      elem.readOnly = true;
      const spanBtn = document.getElementById("btn-" + id);
      spanBtn.classList.add("d-none");
    },
    async update(columnName, elementId, expenceItemId) {
      const elem = document.getElementById(elementId);
      if ("expenceItemRate" == columnName) {
        if (isNaN(elem.value) || !elem.value || elem.value == 0) {
          elem.classList.add("is-invalid");
          return;
        } else {
          elem.classList.remove("is-invalid");
        }
      } else {
        if (!elem.value) {
          elem.classList.add("is-invalid");
          return;
        } else {
          elem.classList.remove("is-invalid");
        }
      }

      const updateContent = {};
      updateContent[columnName] = columnName == "expenceItemRate" ? elem.value * 0.01 : elem.value;
      await window.call.updateExpenceItem(expenceItemId, updateContent);

      this.reload();
      elem.classList.add("form-control-plaintext");
      elem.classList.remove("form-control");
      elem.readOnly = true;
      const spanBtn = document.getElementById("btn-" + elementId);
      spanBtn.classList.add("d-none");
    },
  },
  updated: function () {
    if (this.expenceItems.length) {
      const sortElement = document.getElementById("expenceItemListTable");
      Sortable.create(sortElement, {
        animation: 150,
        handle: ".handle",
        onEnd: function () {
          const items = document.querySelectorAll(".expence-item-tr");
          const array = [];
          for (let item of items) {
            array.push(item.id);
          }
          let cnt = 1;
          for (let id of array) {
            window.call.updateExpenceItem(Number(id), { sortSeq: cnt });
            cnt++;
          }
        },
      });
    }
  },
  watch: {
    expenceItems: function () {
      if (!this.expenceItems.length) {
        this.zeroMsg = "支出項目が存在しません。";
      } else {
        this.zeroMsg = "";
      }
    },
  },
  name: "ExpenceItemListPage",
};
</script>
