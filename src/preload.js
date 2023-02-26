const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('call', {
    getCustomerList: async (condition, sort) => await ipcRenderer.invoke('getCustomerList', condition, sort),
    getCustomerDataById: async (customerId) => await ipcRenderer.invoke('getCustomerDataById', customerId),
    insertCustomer: async (content) => await ipcRenderer.invoke('insertCustomer', content),
    updateCustomer: async (customerId, updateContent) => await ipcRenderer.invoke('updateCustomer', customerId, updateContent),
    deleteCustomer: async (condition, multi) => await ipcRenderer.invoke('deleteCustomer', condition, multi),
    getIncomeList: async (condition, sort) => await ipcRenderer.invoke('getIncomeList', condition, sort),
    getIncomeData: async (condition) => await ipcRenderer.invoke('getIncomeData', condition),
    insertIncome: async (content) => await ipcRenderer.invoke('insertIncome', content),
    updateIncome: async (_id, updateContent) => await ipcRenderer.invoke('updateIncome', _id, updateContent),
    deleteIncome: async (condition, multi) => await ipcRenderer.invoke('deleteIncome', condition, multi),
    getExpenceList: async (condition, sort) => await ipcRenderer.invoke('getExpenceList', condition, sort),
    getExpenceDataById: async (_id) => await ipcRenderer.invoke('getExpenceDataById', _id),
    insertExpence: async (content) => await ipcRenderer.invoke('insertExpence', content),
    updateExpence: async (_id, updateContent) => await ipcRenderer.invoke('updateExpence', _id, updateContent),
    deleteExpence: async (condition, multi) => await ipcRenderer.invoke('deleteExpence', condition, multi),
    getExpenceItemList: async (condition, sort) => await ipcRenderer.invoke('getExpenceItemList', condition, sort),
    getExpenceItemDataById: async (expenceItemId) => await ipcRenderer.invoke('getExpenceItemDataById', expenceItemId),
    insertExpenceItem: async (content) => await ipcRenderer.invoke('insertExpenceItem', content),
    updateExpenceItem: async (expenceItemId, updateContent) => await ipcRenderer.invoke('updateExpenceItem', expenceItemId, updateContent),
    deleteExpenceItem: async (condition, multi) => await ipcRenderer.invoke('deleteExpenceItem', condition, multi),
    exportPdf: async (copyPath, year, title) => await ipcRenderer.invoke('exportPdf', copyPath, year, title),
    saveFile: async (args) => await ipcRenderer.invoke('saveFile', args),
    loadFile: () => ipcRenderer.sendSync('loadFile'),
    readSettings: async (names) => await ipcRenderer.invoke('readSettings', names),
    saveSettings: (vals) => ipcRenderer.sendSync('saveSettings', vals)
})