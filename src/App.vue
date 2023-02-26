<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-auto print-hide ps-0">
          <nav id="nav" class="navbar navbar-light bg-light p-4">
            <nav class="nav nav-pills flex-column">
              <router-link to="/" class="d-flex align-items-center"
                ><i class="bi bi-house"></i
                ><span class="ms-2">ホーム</span></router-link
              >
              <router-link to="/income" class="d-flex align-items-center"
                ><i class="bi bi-cash-stack"></i
                ><span class="ms-2">収入</span></router-link
              >
              <router-link to="/expence" class="d-flex align-items-center"
                ><i class="bi bi-credit-card-fill"></i
                ><span class="ms-2">支出</span></router-link
              >
              <router-link to="/customer" class="d-flex align-items-center"
                ><i class="bi bi-building"></i
                ><span class="ms-2">取引先</span></router-link
              >
              <router-link
                to="/expenceItem"
                class="d-flex align-items-center"
                ><i class="bi bi-basket"></i
                ><span class="ms-2">支出項目</span></router-link
              >
              <router-link
                to="/previewDocument"
                class="d-flex align-items-center"
                ><i class="bi bi-file-ruled-fill"></i
                ><span class="ms-2">出力</span></router-link
              >
              <router-link to="/settings" class="d-flex align-items-center"
                ><i class="bi bi-gear-fill"></i
                ><span class="ms-2">設定</span></router-link
              >
            </nav>
          </nav>
        </div>
        <div id="main" class="col p-0 mt-3">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
