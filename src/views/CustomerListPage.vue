<template>
  <div class="customerListPage">
    <CustomerInsert :parentReload="reload" />
    <div class="container">
      <h3>
        <i class="bi bi-building"></i><i class="bi bi-ui-checks sub"></i> 取引先一覧
      </h3>
      <div v-if="zeroMsg != ''" class="text-center">
        <i class="bi bi-cloud-drizzle-fill h1 me-2"></i><span class="zero-msg">{{ zeroMsg }}</span>
      </div>
      <!-- 検索結果テーブル -->
      <div v-if="customers.length">
        <table class="table table-sm table-hover mb-2">
          <thead>
            <tr>
              <th></th>
              <th><i class="bi bi-building"></i> 取引先名</th>
              <th><i class="bi bi-clock-history"></i> 公的年金</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="customerListTable">
            <tr class="customer-tr" v-bind:id="customer.customerId" v-for="customer in customers"
              v-bind:key="customer.customerId">
              <td class="handle"><i class="bi bi-grip-vertical"></i></td>
              <td>
                <div class="row">
                  <div class="col">
                    <input @keydown.esc="noEditable('name-' + customer.customerId)"
                      @click="editable('name-' + customer.customerId)" readonly class="form-control-plaintext"
                      v-bind:id="'name-' + customer.customerId" v-bind:value="customer.customerName" />
                    <div class="invalid-feedback">入力してください。</div>
                  </div>
                  <div v-bind:id="'btn-name-' + customer.customerId" class="d-none col-auto">
                    <button @click="
                      update(
                        'customerName',
                        'name-' + customer.customerId,
                        customer.customerId
                      )
                    " class="btn btn-sm btn-outline-success mx-1">
                      <i class="bi bi-check2"></i>
                    </button>
                    <button @click="noEditable('name-' + customer.customerId)" class="btn btn-sm btn-outline-dark">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <input @change="updateSub(customer.customerId, $event)" v-bind:checked="customer.customerSub"
                  :id="'customerSubInput' + customer.customerId" class="cmn-toggle" type="checkbox" />
                <label tabindex="0" :for="'customerSubInput' + customer.customerId"></label>
              </td>
              <td class="text-end">
                <button @click="deleteCustomer(customer)" class="btn btn-sm btn-light trash-each">
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
import CustomerInsert from "@/components/CustomerInsert.vue";
import Sortable from "sortablejs";

export default {
  components: { CustomerInsert },
  data() {
    return {
      customers: [],
      zeroMsg: "",
    };
  },
  created() {
    this.reload();
  },
  methods: {
    async reload() {
      this.customers = await window.call.getCustomerList({}, { sortSeq: 1 });
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
      const modifyBefore = await window.call.getCustomerDataById(Number(idSplit[1]));
      elem.value = modifyBefore["customer" + idSplit[0].substring(0, 1).toUpperCase() + idSplit[0].substring(1)];
      elem.classList.add("form-control-plaintext");
      elem.classList.remove("form-control");
      elem.classList.remove("is-invalid");
      elem.readOnly = true;
      const spanBtn = document.getElementById("btn-" + id);
      spanBtn.classList.add("d-none");
    },
    async update(columnName, elementId, customerId) {
      const elem = document.getElementById(elementId);
      if (!elem.value) {
        elem.classList.add("is-invalid");
        return;
      } else {
        elem.classList.remove("is-invalid");
      }

      const updateContent = {};
      updateContent[columnName] = elem.value;
      await window.call.updateCustomer(customerId, updateContent);

      elem.classList.add("form-control-plaintext");
      elem.classList.remove("form-control");
      elem.readOnly = true;
      const spanBtn = document.getElementById("btn-" + elementId);
      spanBtn.classList.add("d-none");
    },
    async deleteCustomer(customer) {
      const id = customer.customerId;
      const name = customer.customerName;
      if (window.confirm("取引先「" + name + "」を削除してよろしいですか？")) {
        const checkResult = await window.call.getIncomeList({ customerId: id }, {});
        if (checkResult.length) {
          const confirmResult = window.confirm(
            "取引先「" +
            name +
            "」に紐づく収入情報も削除されますが、よろしいですか？"
          )
          if (confirmResult) {
            await window.call.deleteCustomer({ customerId: id }, false);
            await window.call.deleteIncome({ customerId: id }, true);
          } else {
            return;
          }
        } else {
          await window.call.deleteCustomer({ customerId: id }, false);
        }
      }
      this.reload();
    },
    async updateSub(id, event) {
      await window.call.updateCustomer(id, { customerSub: event.target.checked });
    },
  },
  updated: function () {
    if (this.customers.length) {
      const sortElement = document.getElementById("customerListTable");
      Sortable.create(sortElement, {
        animation: 150,
        handle: ".handle",
        onEnd: function () {
          const items = document.querySelectorAll(".customer-tr");
          const array = [];
          for (let item of items) {
            array.push(item.id);
          }
          let cnt = 1;
          for (let id of array) {
            window.call.updateCustomer(Number(id), { sortSeq: cnt });
            cnt++;
          }
        },
      });
    }
  },
  watch: {
    customers: function () {
      if (!this.customers.length) {
        this.zeroMsg = "取引先情報が存在しません。";
      } else {
        this.zeroMsg = "";
      }
    },
  },
  name: "CustomerListPage",
};
</script>
