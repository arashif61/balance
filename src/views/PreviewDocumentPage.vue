<template>
  <div class="previewDocument" id="previewDocumentPage">
    <div class="container">
      <div class="print-hide">
        <div class="row">
          <div class="col-9">
            <div class="form-floating">
              <select class="form-select" id="yearSelect" @change="createPreview" v-model="searchYear">
                <option value="">年度を選択してください</option>
                <option v-for="y in years" v-bind:key="y" v-bind:value="y">
                  {{ getJpYear(y) }}年度（{{ y }}）
                </option>
              </select>
              <label for="yearSelect">どの年度の収支内訳表を出力しますか？</label>
            </div>
          </div>
          <div class="col-3 d-flex align-items-center">
            <button class="btn btn-primary" @click="exportPdf" v-if="mergedDataList != ''">
              <i class="bi bi-file-ruled-fill"></i> PDF出力
            </button>
          </div>
        </div>
        <div v-if="exportMsg" class="alert alert-success" role="alert">
          {{ exportMsg }}
        </div>
        <!-- 検索結果テーブル -->
      </div>
      <div v-for="items of mergedDataList" v-bind:key="items[0].seq" class="sheet">
        <table class="table table-sm preview-table">
          <colgroup style="width: 35%"></colgroup>
          <colgroup style="width: 15%"></colgroup>
          <colgroup style="width: 10%"></colgroup>
          <colgroup style="width: 20%"></colgroup>
          <colgroup style="width: 10%"></colgroup>
          <colgroup style="width: 10%"></colgroup>
          <thead>
            <tr>
              <td colspan="6">
                <div class="row pb-3">
                  <div class="col-3"></div>
                  <div class="col-6 d-flex align-items-center justify-content-center h5 preview">
                    {{ copyLiteral }} {{ year }}年度 {{ pdfTitle }}
                  </div>
                  <div class="col-3 peer-info page">
                    <span>〒{{ peerInfoZip }}</span><br />
                    <span>{{ peerInfoAddress }}</span><br />
                    <span>{{ peerInfoCompany }}</span><br />
                    <span>{{ peerInfoName }}</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th colspan="2" class="text-center">収入</th>
              <th colspan="4" class="text-center">支出</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" v-bind:key="item.seq">
              <td v-bind:colspan="item.isCustomerName ? '2' : '1'" v-bind:class="{
                'border-top-double': item.isSumIn,
                'border-top-black': item.isSumPerCustomer,
                'fw-bold': item.isCustomerName,
              }">
                {{ item.col1 }}
              </td>
              <td v-bind:class="{
                'border-top-double': item.isSumIn,
                'border-top-black': item.isSumPerCustomer,
                'text-end': true,
                'pe-5': true,
              }" v-if="!item.isCustomerName">
                {{ item.col2 }}
              </td>
              <td v-bind:colspan="item.isExpenceItemName ? '4' : '1'" v-bind:class="{
                'border-top-double': item.isSumEx,
                'border-top-black': item.isSumPerItem,
                'fw-bold': item.isExpenceItemName,
              }">
                {{ item.col3 }}
              </td>
              <td v-bind:class="{
                'border-top-double': item.isSumEx,
                'border-top-black': item.isSumPerItem,
              }" v-if="!item.isExpenceItemName">
                {{ item.col4 }}
              </td>
              <td v-bind:class="{
                'border-top-double': item.isSumEx,
                'border-top-black': item.isSumPerItem,
                'text-end': true,
                'pe-2': true,
              }" v-if="!item.isExpenceItemName">
                {{ item.col5 }}
              </td>
              <td v-bind:class="{
                'border-top-double': item.isSumEx,
                'border-top-black': item.isSumPerItem,
              }" v-if="!item.isExpenceItemName">
                {{ item.col6 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
const MAX_ROW_COUNT_PER_PAGE = 33;
const BUFFER_COUNT_SUB_TITLE = 2;

export default {
  data() {
    return {
      searchYear: "",
      mergedDataList: "",
      exportMsg: "",
      incomes: "",
      expences: "",
      year: "",
      copyLiteral: "",
      years: "",
      peerInfoZip: "",
      peerInfoAddress: "",
      peerInfoCompany: "",
      peerInfoName: "",
      pdfTitle: "",
    };
  },
  async created() {
    this.years = await this.getYears();
    const settingData = await window.call.readSettings([
      "pdfTitle",
      "peerInfoZip",
      "peerInfoAddress",
      "peerInfoCompany",
      "peerInfoName",
    ]);
    this.pdfTitle = settingData.pdfTitle;
    this.peerInfoZip = settingData.peerInfoZip;
    this.peerInfoAddress = settingData.peerInfoAddress;
    this.peerInfoCompany = settingData.peerInfoCompany;
    this.peerInfoName = settingData.peerInfoName;
  },
  methods: {
    /**
     * 和暦の取得
     * @param {*} year 
     */
    getJpYear(year) {
      const date = new Date(year, 0, 1);
      return new Intl.DateTimeFormat("ja-JP-u-ca-japanese", { era: "long" })
        .format(date)
        .split("年")[0];
    },

    /**
     * プレビューの生成
     */
    async createPreview() {
      this.mergedDataList = "";
      this.year = "";

      if (!this.searchYear) {
        // 年度が選択されていない場合終了
        return;
      }

      this.year = this.getJpYear(this.searchYear);

      // 収入（営業所得）
      const incomeListOrderByCustomerSeq = await this.getIncomeListOrderByCustomerSeq(false);
      // 収入（公的年金）
      const incomeSubListOrderByCustomerSeq = await this.getIncomeListOrderByCustomerSeq(true);
      // PDF用に整形
      const incomeFormattedList = this.formatPreviewIncome(incomeListOrderByCustomerSeq, incomeSubListOrderByCustomerSeq);

      // 支出
      const expenceListOrderByCustomerSeq = await this.getExpenceListOrderByExpenceItemSeq();
      // PDF用に整形
      const expenceFormattedList = this.formatPreviewExpence(expenceListOrderByCustomerSeq);

      // 収入・支出分をマージして設定
      this.mergedDataList = this.mergeFormattedList(incomeFormattedList, expenceFormattedList);
    },

    /**
     * PDF出力
     */
    async exportPdf() {
      this.exportMsg = "";

      let title = "Balance出力データ";
      if (this.pdfTitle) {
        title = this.pdfTitle;
      }

      const path = await window.call.exportPdf(null, this.year, title);
      if (!path) return;

      if (path) {
        this.copyLiteral = "（控）";
        await window.call.exportPdf(path, this.year, title);
        this.exportMsg = "PDFを出力しました。パス: " + path;
        this.copyLiteral = "";
      }
    },

    /**
     * 年度リストの取得
     */
    async getYears() {
      const incomeYears = await window.call.getIncomeList({}, {});
      const expenceYears = await window.call.getExpenceList({}, {});

      const incomeYearsArr = [];
      for (let income of incomeYears) {
        incomeYearsArr.push(income.incomeDate.slice(0, 4));
      }

      const expenceYearsArr = [];
      for (let expence of expenceYears) {
        expenceYearsArr.push(expence.expenceDate.slice(0, 4));
      }

      const yearsArr = incomeYearsArr.concat(expenceYearsArr);
      // 重複を排除して昇順で並び替え
      return Array.from([...new Set(yearsArr)].sort((a, b) => b - a));
    },

    /**
     * 取引先の並び順で収入リストを取得
     * @param {bool} isCustomerSub 
     */
    async getIncomeListOrderByCustomerSeq(isCustomerSub) {
      // 取引先
      const customerList = await window.call.getCustomerList({ customerSub: isCustomerSub }, { sortSeq: 1 });

      let incomeListOrderByCustomerSeq = [];
      // 取引先の並び順で取得するため、取引先取得後に収入を取得
      for (let item of customerList) {
        incomeListOrderByCustomerSeq = incomeListOrderByCustomerSeq.concat(
          await this.getIncomeList(this.searchYear, item.customerId)
        );
      }

      return incomeListOrderByCustomerSeq;
    },

    /**
     * 支出項目の並び順で支出リストを取得
     */
    async getExpenceListOrderByExpenceItemSeq() {
      // 支出項目
      const expenceItems = await window.call.getExpenceItemList({}, { sortSeq: 1 });
      // 支出リスト作成
      let expenceListOrderByCustomerSeq = [];
      // 支出項目の並び順で取得するため、支出項目取得後に支出を取得
      for (let item of expenceItems) {
        expenceListOrderByCustomerSeq = expenceListOrderByCustomerSeq.concat(
          await this.getExpenceList(this.searchYear, item.expenceItemId)
        );
      }

      return expenceListOrderByCustomerSeq;
    },

    /**
     * 収入リストを取得
     * @param {string} year 
     * @param {string} customerId 
     */
    async getIncomeList(year, customerId) {
      const where = { customerId: customerId };
      if (year) {
        where.incomeDate = { $regex: new RegExp("^" + year) };
      }
      const list = await window.call.getIncomeList(where, { customerId: 1, incomeDate: 1 });

      for (let data of list) {
        const customer = await window.call.getCustomerDataById(data.customerId);
        data.customerName = customer.customerName;
      }

      return list;
    },

    /**
     * 支出リストを取得
     * @param {string} year 
     * @param {string} expenceItemId 
     */
    async getExpenceList(year, expenceItemId) {
      const where = { expenceItemId: expenceItemId };
      if (year) {
        where.expenceDate = { $regex: new RegExp("^" + year) };
      }

      const list = await window.call.getExpenceList(where, { expenceItemId: 1, expenceDate: 1 });

      for (let data of list) {
        const expenceItem = await window.call.getExpenceItemDataById(data.expenceItemId);
        data.expenceItemName = expenceItem.expenceItemName;
        data.expenceItemRate = expenceItem.expenceItemRate;
      }
      return list;
    },

    /**
     * 収入をプレビュー用に整形
     * @param {*} incomeList 
     * @param {*} incomeSubList 
     */
    formatPreviewIncome(incomeList, incomeSubList) {
      let result = [];

      // 営業所得分の整形
      this.formatPreviewIncomeSales(result, incomeList);

      // 空行を追加
      result.push({});

      // 公的年金分の整形
      this.formatPreviewIncomeSub(result, incomeSubList);

      return result;
    },

    /**
     * 収入をプレビュー用に整形（営業所得）
     * @param {*} result 
     * @param {*} incomeList 
     */
    formatPreviewIncomeSales(result, incomeList) {
      let sumAmount = 0;
      let sumAmountPerCustomer = 0;
      let preLoopCustomerId = "";

      for (let income of incomeList) {

        if (preLoopCustomerId != income.customerId) {
          // 取引先が前回ループと異なる場合

          if (preLoopCustomerId != "") {
            // 先頭データでない場合
            // 取引先毎の合計行を追加
            result.push({
              col1: "合計",
              col2: sumAmountPerCustomer.toLocaleString(),
              isSumPerCustomer: true,
            });

            // 取引先毎の合計金額を持つ変数のクリア
            sumAmountPerCustomer = 0;

            // 空行を追加
            result.push({});

            //改ページ
            this.pageBreakIncome(result, incomeList, income);
          }
          
          // 取引先のヘッダ行を追加
          result.push({ col1: income.customerName, isCustomerName: true });
        }

        // 文字列から日付型に変換
        const incomeDate = new Date(income.incomeDate.replaceAll("-", "/"));

        result.push({
          col1: `${incomeDate.getMonth() + 1}月${incomeDate.getDate()}日`,
          col2: income.incomeAmount.toLocaleString(),
        });

        // 前回ループの取引先変数を更新
        preLoopCustomerId = income.customerId;
        // 取引先毎の合計金額を加算
        sumAmountPerCustomer += income.incomeAmount;
        // 総計金額を加算
        sumAmount += income.incomeAmount;
      }

      // 取引先毎の合計行を追加
      result.push({
        col1: "合計",
        col2: sumAmountPerCustomer.toLocaleString(),
        isSumPerCustomer: true,
      });

      // 空行を追加
      result.push({});

      // 営業所得分の合計行を追加
      result.push({
        col1: "営業所得合計",
        col2: sumAmount.toLocaleString(),
        isSumIn: true,
      });
    },

    /**
     * 収入をプレビュー用に整形（公的年金）
     * @param {*} result 
     * @param {*} incomeSubList 
     */
    formatPreviewIncomeSub(result, incomeSubList) {
      let sumAmountSub = 0;
      let sumAmountPerCustomerSub = 0;
      let preLoopCustomerIdSub = "";

      for (let incomeSub of incomeSubList) {

        if (preLoopCustomerIdSub != incomeSub.customerId) {
          // 取引先が前回ループと異なる場合

          if (preLoopCustomerIdSub != "") {
            // 先頭データ以外の場合
            // 取引先毎の合計行を追加
            result.push({
              col1: "合計",
              col2: sumAmountPerCustomerSub.toLocaleString(),
              isSumPerCustomer: true,
            });

            // 取引先毎の合計金額を持つ変数のクリア
            sumAmountPerCustomerSub = 0;

            // 空行を追加
            result.push({});
          }

          // 改ページ
          this.pageBreakIncome(result, incomeSubList, incomeSub);
          
          // 取引先のヘッダ行を追加
          result.push({ col1: incomeSub.customerName, isCustomerName: true });
        }

        // 文字列から日付型に変換
        const incomeDate = new Date(incomeSub.incomeDate.replaceAll("-", "/"));

        result.push({
          col1: `${incomeDate.getMonth() + 1}月${incomeDate.getDate()}日`,
          col2: incomeSub.incomeAmount.toLocaleString(),
        });

        // 前回ループの取引先変数を更新
        preLoopCustomerIdSub = incomeSub.customerId;
        // 取引先毎の合計金額を加算
        sumAmountPerCustomerSub += incomeSub.incomeAmount;
        // 総計金額を加算
        sumAmountSub += incomeSub.incomeAmount;
      }

      // 取引先毎の合計行を追加
      result.push({
        col1: "合計",
        col2: sumAmountPerCustomerSub.toLocaleString(),
        isSumPerCustomer: true,
      });

      // 空行を追加
      result.push({});

      // 公的年金分の合計行を追加
      result.push({
        col1: "公的年金合計",
        col2: sumAmountSub.toLocaleString(),
        isSumIn: true,
      });
    },

    /**
     * 改ページ（収入）
     * @param {*} result 
     * @param {*} incomeList 
     * @param {*} income 
     */
    pageBreakIncome(result, incomeList, income) {
      // 改ページまでの残りの行数を算出
      let leftRowCount = MAX_ROW_COUNT_PER_PAGE - result.length;

      // 残りの行数が改ページ対象行数を超える直前まで加算
      while (leftRowCount < MAX_ROW_COUNT_PER_PAGE) {
        leftRowCount += MAX_ROW_COUNT_PER_PAGE;
      }
      leftRowCount -= MAX_ROW_COUNT_PER_PAGE;

      // これから処理する収入の件数を計上し、バッファの行数を加算
      let customerCountContainsBuffer = incomeList.reduce((prev, item) => {
        return prev + (item.customerId == income.customerId ? 1 : 0)
      }, 0);
      customerCountContainsBuffer += BUFFER_COUNT_SUB_TITLE;

      if (customerCountContainsBuffer > leftRowCount) {
        // 収入の件数とバッファが残りの行数を超える場合、改頁する
        for (let i = 0; i <= leftRowCount; i++) {
          result.push({});
        }
      } else if (
        customerCountContainsBuffer == leftRowCount &&
        income.customerId == incomeList[incomeList.length - 1].customerId
      ) {
        // 収入の件数とバッファが残りの行数が一致する かつ 最後の取引先の場合、改頁する
        for (let i = 0; i <= leftRowCount; i++) {
          result.push({});
        }
      }
    },

    /**
     * 支出をプレビュー用に整形
     * @param {*} expenceList 
     */
    formatPreviewExpence(expenceList) {
      let result = [];
      let sumAmount = 0;
      let sumAmountPerItem = 0;
      let preExpenceItemId = "";
      let preExpenceItemRate = 0;

      for (let expence of expenceList) {

        if (preExpenceItemId != expence.expenceItemId) {
          // 支出項目が前回ループと異なる場合

          if (preExpenceItemId != "") {
            // 先頭データ以外の場合

            // 合計行を追加
            sumAmount += this.addSumRowExpence(result, sumAmountPerItem, preExpenceItemRate);

            // 支出項目ごとの合計金額を持つ変数のクリア
            sumAmountPerItem = 0;

            // 空行を追加
            result.push({});

            // 改ページ
            this.pageBreakExpence(result, expenceList, expence);
          }

          // 支出項目のヘッダ行を追加
          result.push({ col3: expence.expenceItemName, isExpenceItemName: true });
        }

        // 文字列から日付型に変換
        const expenceDate = new Date(expence.expenceDate.replaceAll("-", "/"));

        result.push({
          col3: `${expenceDate.getMonth() + 1}月${expenceDate.getDate()}日`,
          col4: expence.expenceNote,
          col5: expence.expenceAmount.toLocaleString(),
        });

        // 前回ループの支出項目変数を更新
        preExpenceItemId = expence.expenceItemId;
        // 前回ループの割合を更新
        preExpenceItemRate = expence.expenceItemRate;
        // 総計金額を加算
        sumAmountPerItem += expence.expenceAmount;
      }

      // 支出項目ごとの合計行を追加
      sumAmount += this.addSumRowExpence(result, sumAmountPerItem, preExpenceItemRate);

      // 空行を追加
      result.push({});

      // 総計金額の行を追加
      result.push({
        col3: "支出合計",
        col5: sumAmount.toLocaleString(),
        isSumEx: true,
      });

      return result;
    },

    /**
     * 改ページ（支出）
     * @param {*} result 
     * @param {*} expenceList 
     * @param {*} expence 
     */
    pageBreakExpence(result, expenceList, expence) {
      // 改ページまでの残りの行数を算出
      let leftRowCount = MAX_ROW_COUNT_PER_PAGE - result.length;

      // 残りの行数が改ページ対象行数を超える直前まで加算
      while (leftRowCount < MAX_ROW_COUNT_PER_PAGE) {
        leftRowCount += MAX_ROW_COUNT_PER_PAGE;
      }
      leftRowCount -= MAX_ROW_COUNT_PER_PAGE;

      // これから処理する支出の件数を計上し、バッファの行数を加算
      let expenceItemCountContainsBuffer = expenceList.reduce((prev, item) => {
        return prev + (item.expenceItemId == expence.expenceItemId ? 1 : 0)
      }, 0);
      // 100%でない場合、バッファ+1とする
      expenceItemCountContainsBuffer +=
        expence.expenceItemRate == 1 ?
          BUFFER_COUNT_SUB_TITLE : BUFFER_COUNT_SUB_TITLE + 1;

      if (expenceItemCountContainsBuffer > leftRowCount) {
        // 支出の件数とバッファが残りの行数を超える場合、改頁する
        for (let i = 0; i <= leftRowCount; i++) {
          result.push({});
        }
      } else if (
        expenceItemCountContainsBuffer == leftRowCount &&
        expence.expenceItemId == expenceList[expenceList.length - 1].expenceItemId
      ) {
        // 支出の件数とバッファが残りの行数が一致する かつ 最後の支出項目の場合、改頁する
        for (let i = 0; i <= leftRowCount; i++) {
          result.push({});
        }
      }
    },

    /**
     * 支出の合計行を追加
     * @param {*} result 
     * @param {*} sumAmountPerItem 
     * @param {*} preExpenceItemRate 
     */
    addSumRowExpence(result, sumAmountPerItem, preExpenceItemRate) {
      const sumPerItem = {
        col3: "合計",
        col5: sumAmountPerItem.toLocaleString(),
        isSumPerItem: true,
      };

      if (preExpenceItemRate < 1) {
        // 100%未満の場合、割合の設定
        sumPerItem.col6 = "× " + preExpenceItemRate * 100 + "%";
      }

      // 支出項目毎の合計行を追加
      result.push(sumPerItem);

      const multipiedAmount = Math.floor(sumAmountPerItem * preExpenceItemRate);

      // 合計金額行の追加
      if (preExpenceItemRate < 1) {
        result.push({
          col5: "= " + multipiedAmount.toLocaleString(),
        });
      }

      // 割合を加味した合計金額を返却
      return multipiedAmount;
    },

    /**
     * 整形したリストをマージ
     * @param {*} incomeFormattedList 
     * @param {*} expenceFormattedList 
     */
    mergeFormattedList(incomeFormattedList, expenceFormattedList) {
      let loopTargetList;

      // 支出・収入のうち行数が多い方を判定
      let isIncome;
      if (incomeFormattedList.length > expenceFormattedList.length) {
        loopTargetList = incomeFormattedList;
        isIncome = true;
      } else {
        loopTargetList = expenceFormattedList;
        isIncome = false;
      }

      const perPageList = [];
      const resultList = [];
      let count = 0;
      let isReachLessListCount = false;

      for (let items of loopTargetList) {
        items.seq = count;

        // 行数が少ない方の最終行に達したか判定
        if (isIncome && expenceFormattedList.length == count) {
          isReachLessListCount = true;
        } else if (!isIncome && incomeFormattedList.length == count) {
          isReachLessListCount = true;
        }

        if (isReachLessListCount) {
          // 片方しか存在しないループの場合、そのまま追加
          perPageList.push(items);
        } else {
          // 支出・収入のどちらも存在するループの場合、マージして追加
          const mergedData = Object.assign(items, isIncome ? expenceFormattedList[count] : incomeFormattedList[count]);
          perPageList.push(mergedData);
        }

        if (count > 0 && count % MAX_ROW_COUNT_PER_PAGE == 0) {
          // 2周目以降 かつ 改ページ対象の場合、返却用リストにコピーし、ページごとのリストをクリアする
          resultList.push(perPageList.slice());
          perPageList.length = 0;
        }

        count++;
      }

      if (perPageList.length > 0) {
        // ページごとのリストに残がある場合、追加
        resultList.push(perPageList.slice());
      }

      return resultList;
    },
  },
  name: "previewDocumentPage",
};
</script>
