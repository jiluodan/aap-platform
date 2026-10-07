// ============================================================================
// PBC Catalogue — 大类 / 子类 分类目录
// 来源：客户提供的 PBC 清单（表格 A 列）
//   加粗标题行  → 大类（PBC_CATEGORIES）
//   非加粗行    → 该大类下的子类（PBC_ITEM_DEFS，按 c 字段归属大类）
// 注：应收账款及其他应收款 / 其他应收账款和预付款 / 资本及公积 三行在原表中
//     同样是分组边界（B 列重复 A 列、后续条目归属该组），但未加粗，已一并作为大类。
// ============================================================================

export interface PBCCategoryDef {
  key: string
  zh: string
  en: string
  icon: string
  color: string
  bg: string
}

export interface PBCItemDef {
  /** category key */
  c: string
  zh: string
  en: string
  /** data type: s = structured, u = unstructured */
  dt: 's' | 'u'
}

/** 大类 —— 表格 A 列加粗标题行，共 19 个 */
export const PBC_CATEGORIES: PBCCategoryDef[] = [
  { key: 'general',      zh: '一般',                 en: 'General',                    icon: '🗂️', color: '#64748b', bg: '#f8fafc' },
  { key: 'revenue',      zh: '收入',                 en: 'Revenue',                    icon: '💰', color: '#059669', bg: '#ecfdf5' },
  { key: 'ar',           zh: '应收账款及其他应收款',   en: 'AR & Other Receivables',     icon: '🧾', color: '#0891b2', bg: '#ecfeff' },
  { key: 'ap',           zh: '应付账款和其他应付款',   en: 'AP & Other Payables',        icon: '📤', color: '#d97706', bg: '#fffbeb' },
  { key: 'otherincome',  zh: '其他收入和费用',        en: 'Other Income & Expenses',    icon: '📉', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'otherrecv',    zh: '其他应收账款和预付款',   en: 'Other Receivables & Prepayments', icon: '📑', color: '#0d9488', bg: '#f0fdfa' },
  { key: 'inventory',    zh: '存货',                 en: 'Inventory',                  icon: '📦', color: '#2563eb', bg: '#eff6ff' },
  { key: 'payroll',      zh: '薪资',                 en: 'Payroll',                    icon: '👥', color: '#dc2626', bg: '#fef2f2' },
  { key: 'cash',         zh: '库存现金',             en: 'Cash & Bank',                icon: '🏦', color: '#4f46e5', bg: '#eef2ff' },
  { key: 'borrowing',    zh: '借款',                 en: 'Borrowings',                 icon: '🏛️', color: '#b45309', bg: '#fff7ed' },
  { key: 'finance',      zh: '财务收益和费用',        en: 'Finance Income & Costs',     icon: '📈', color: '#c026d3', bg: '#fdf4ff' },
  { key: 'otherliab',    zh: '其他负债',             en: 'Other Liabilities',          icon: '📋', color: '#475569', bg: '#f1f5f9' },
  { key: 'fixedasset',   zh: '固定资产',             en: 'Fixed Assets',               icon: '🏗️', color: '#ea580c', bg: '#fff7ed' },
  { key: 'lease',        zh: '租赁',                 en: 'Leases',                     icon: '🔑', color: '#0369a1', bg: '#f0f9ff' },
  { key: 'intangible',   zh: '无形资产',             en: 'Intangible Assets',          icon: '💡', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'relatedparty', zh: '关联方',               en: 'Related Parties',            icon: '🤝', color: '#be123c', bg: '#fff1f2' },
  { key: 'tax',          zh: '税项',                 en: 'Taxation',                   icon: '🧮', color: '#ca8a04', bg: '#fefce8' },
  { key: 'capital',      zh: '资本及公积',           en: 'Capital & Reserves',         icon: '🏢', color: '#0f766e', bg: '#f0fdfa' },
  { key: 'purchase',     zh: '采购',                 en: 'Purchases',                  icon: '🛒', color: '#4d7c0f', bg: '#f7fee7' },
]

/** 子类 —— 表格 A 列非加粗行，共 130 条，按所属大类顺序排列 */
export const PBC_ITEM_DEFS: PBCItemDef[] = [
  // ── 一般 General ──────────────────────────────────────────────────────────
  { c: 'general', zh: '业务约定书',                     en: 'Engagement Letter',                            dt: 'u' },
  { c: 'general', zh: '董事会和委员会会议记录',          en: 'Board and Committee Meeting Minutes',          dt: 'u' },
  { c: 'general', zh: '异常交易',                       en: 'Unusual Transactions',                         dt: 's' },
  { c: 'general', zh: '内部法律函件/诉讼摘要',           en: 'Internal Legal Letters / Litigation Summary',  dt: 'u' },
  { c: 'general', zh: '外部法律顾问名单',                en: 'External Legal Counsel List',                  dt: 'u' },
  { c: 'general', zh: '外包服务清单',                    en: 'Outsourced Services List',                     dt: 'u' },
  { c: 'general', zh: '会计分录',                       en: 'Journal Entries',                              dt: 's' },
  { c: 'general', zh: '会计分录',                       en: 'Journal Entries (Consolidation & Adjustments)', dt: 's' },
  { c: 'general', zh: '期后事项审阅',                    en: 'Subsequent Events Review',                     dt: 'u' },
  { c: 'general', zh: '外币汇率',                       en: 'Foreign Exchange Rates',                       dt: 's' },
  { c: 'general', zh: '流程图',                         en: 'Process Flowcharts',                           dt: 'u' },
  { c: 'general', zh: '信息系统',                       en: 'Information Systems',                          dt: 'u' },
  { c: 'general', zh: '会计政策',                       en: 'Accounting Policies',                          dt: 'u' },
  { c: 'general', zh: '操作流程',                       en: 'Standard Operating Procedures',                dt: 'u' },
  { c: 'general', zh: '银行流水',                       en: 'Bank Transaction Statements',                  dt: 's' },
  { c: 'general', zh: '财务报表和试算平衡表',            en: 'Financial Statements and Trial Balance',       dt: 's' },
  { c: 'general', zh: '财务报表（集团报告）',            en: 'Financial Statements (Group Reporting)',       dt: 's' },
  { c: 'general', zh: '财务报表（法定）',                en: 'Financial Statements (Statutory)',             dt: 'u' },
  { c: 'general', zh: '试算平衡表',                     en: 'Trial Balance',                                dt: 's' },
  { c: 'general', zh: '试算平衡表编制后的调整分录',      en: 'Post-TB Adjusting Entries',                    dt: 's' },
  { c: 'general', zh: '现金流量表',                     en: 'Cash Flow Statement',                          dt: 's' },
  { c: 'general', zh: '年终分析',                       en: 'Year-end Analysis',                            dt: 's' },

  // ── 收入 Revenue ─────────────────────────────────────────────────────────
  { c: 'revenue', zh: '收入明细表',                     en: 'Revenue Detail Schedule',                      dt: 's' },
  { c: 'revenue', zh: '销售对账',                       en: 'Sales Reconciliation',                         dt: 's' },
  { c: 'revenue', zh: '毛利分析',                       en: 'Gross Margin Analysis',                        dt: 's' },
  { c: 'revenue', zh: '销售截止',                       en: 'Sales Cut-off Report',                         dt: 's' },
  { c: 'revenue', zh: '销售订单',                       en: 'Sales Orders',                                 dt: 's' },
  { c: 'revenue', zh: '发货单据',                       en: 'Shipping Documents',                           dt: 's' },

  // ── 应收账款及其他应收款 AR & Other Receivables ────────────────────────────
  { c: 'ar', zh: '应收账款明细账',                      en: 'AR Sub-ledger',                                dt: 's' },
  { c: 'ar', zh: '大额应收款',                          en: 'Large AR Balances',                            dt: 's' },
  { c: 'ar', zh: '大额应收款',                          en: 'Large AR — Collection Assessment',             dt: 's' },
  { c: 'ar', zh: '退货单',                              en: 'Return Notes',                                 dt: 'u' },
  { c: 'ar', zh: '退货分析',                            en: 'Returns Analysis',                             dt: 's' },
  { c: 'ar', zh: '后续收款',                            en: 'Subsequent Collections',                        dt: 's' },
  { c: 'ar', zh: '应收账款账龄明细',                    en: 'AR Aging Detail',                              dt: 's' },
  { c: 'ar', zh: '坏账准备假设条件',                    en: 'Bad Debt Provision Assumptions',               dt: 'u' },
  { c: 'ar', zh: '坏账准备追溯复核',                    en: 'Bad Debt Provision Retrospective Review',      dt: 's' },
  { c: 'ar', zh: '坏账准备变动',                        en: 'Bad Debt Provision Movement',                  dt: 's' },
  { c: 'ar', zh: '其他应收账龄表',                      en: 'Other Receivables Aging Schedule',             dt: 's' },
  { c: 'ar', zh: '合同资产',                            en: 'Contract Assets',                              dt: 's' },

  // ── 应付账款和其他应付款 AP & Other Payables ──────────────────────────────
  { c: 'ap', zh: '应付账款对账',                        en: 'AP Reconciliation',                            dt: 's' },
  { c: 'ap', zh: '应付账款清单',                        en: 'AP Listing',                                   dt: 's' },
  { c: 'ap', zh: '应付账款分类账借方余额',              en: 'AP Ledger Debit Balances',                     dt: 's' },
  { c: 'ap', zh: '应付账款分类账借方余额分析',          en: 'AP Debit Balances Analysis',                   dt: 'u' },
  { c: 'ap', zh: '期后付款明细表',                      en: 'Subsequent Payment Schedule',                  dt: 's' },
  { c: 'ap', zh: '期后付款明细表',                      en: 'Subsequent Payment Schedule (Detail)',          dt: 's' },
  { c: 'ap', zh: '期后收到的发票明细表',                en: 'Subsequent Invoices Received Schedule',        dt: 's' },
  { c: 'ap', zh: '采购截至',                            en: 'Purchases Cut-off Report',                     dt: 'u' },
  { c: 'ap', zh: '合同负债',                            en: 'Contract Liabilities',                         dt: 's' },

  // ── 其他收入和费用 Other Income & Expenses ───────────────────────────────
  { c: 'otherincome', zh: '费用明细',                   en: 'Expense Detail',                               dt: 's' },
  { c: 'otherincome', zh: '其他费用比较',               en: 'Other Expenses Comparison',                    dt: 's' },
  { c: 'otherincome', zh: '费用分析',                   en: 'Expense Analysis',                             dt: 's' },
  { c: 'otherincome', zh: '其他收入明细表',             en: 'Other Income Detail Schedule',                 dt: 's' },
  { c: 'otherincome', zh: '其他收入比较',               en: 'Other Income Comparison',                      dt: 's' },

  // ── 其他应收账款和预付款 Other Receivables & Prepayments ─────────────────
  { c: 'otherrecv', zh: '预付款分析',                   en: 'Prepayments Analysis',                         dt: 's' },

  // ── 存货 Inventory ───────────────────────────────────────────────────────
  { c: 'inventory', zh: '存货核对表',                   en: 'Inventory Reconciliation',                     dt: 's' },
  { c: 'inventory', zh: '存货核销',                     en: 'Inventory Write-offs',                         dt: 's' },
  { c: 'inventory', zh: '过期存货报告',                 en: 'Obsolete Inventory Report',                    dt: 's' },
  { c: 'inventory', zh: '存货跌价准备假设',             en: 'Inventory Provision Assumptions',              dt: 'u' },
  { c: 'inventory', zh: '存货跌价准备数据',             en: 'Inventory Provision Data',                     dt: 's' },
  { c: 'inventory', zh: '存货跌价准备追溯复核',         en: 'Inventory Provision Retrospective Review',     dt: 's' },
  { c: 'inventory', zh: '存货调整',                     en: 'Inventory Adjustments',                        dt: 's' },
  { c: 'inventory', zh: '在产品明细表和核对表',         en: 'WIP Detail and Reconciliation',                dt: 's' },

  // ── 薪资 Payroll ─────────────────────────────────────────────────────────
  { c: 'payroll', zh: '薪资对账',                       en: 'Payroll Reconciliation',                       dt: 's' },
  { c: 'payroll', zh: '员工人数统计',                   en: 'Headcount Statistics',                         dt: 's' },
  { c: 'payroll', zh: '应计薪资',                       en: 'Accrued Payroll',                              dt: 's' },
  { c: 'payroll', zh: '退休金计划',                     en: 'Pension Plans',                                dt: 'u' },
  { c: 'payroll', zh: '退休金义务',                     en: 'Pension Obligations',                          dt: 's' },
  { c: 'payroll', zh: '薪酬明细表',                     en: 'Remuneration Detail Schedule',                 dt: 's' },

  // ── 库存现金 Cash & Bank ─────────────────────────────────────────────────
  { c: 'cash', zh: '银行余额调节表',                    en: 'Bank Reconciliation Statements',               dt: 's' },
  { c: 'cash', zh: '银行余额调节表',                    en: 'Bank Reconciliation Supporting Items',         dt: 's' },
  { c: 'cash', zh: '银行对账单',                        en: 'Bank Statements',                              dt: 'u' },
  { c: 'cash', zh: '银行询证函',                        en: 'Bank Confirmation Letters',                    dt: 'u' },
  { c: 'cash', zh: '理财产品',                          en: 'Wealth Management Products',                   dt: 's' },
  { c: 'cash', zh: '现金盘点表',                        en: 'Cash Count Sheets',                            dt: 's' },

  // ── 借款 Borrowings ──────────────────────────────────────────────────────
  { c: 'borrowing', zh: '贷款询证函',                   en: 'Loan Confirmation Letters',                    dt: 'u' },
  { c: 'borrowing', zh: '借款变动',                     en: 'Borrowings Movement',                          dt: 's' },
  { c: 'borrowing', zh: '贷款对账单',                   en: 'Loan Statements',                              dt: 'u' },
  { c: 'borrowing', zh: '债务契约',                     en: 'Debt Covenants',                               dt: 'u' },
  { c: 'borrowing', zh: '债务协议',                     en: 'Debt Agreements',                              dt: 'u' },

  // ── 财务收益和费用 Finance Income & Costs ────────────────────────────────
  { c: 'finance', zh: '利息费用对账',                   en: 'Interest Expense Reconciliation',              dt: 's' },
  { c: 'finance', zh: '利息收入对账',                   en: 'Interest Income Reconciliation',               dt: 's' },
  { c: 'finance', zh: '租赁负债利息费用',               en: 'Lease Liability Interest Expense',             dt: 's' },
  { c: 'finance', zh: '其他金融资产',                   en: 'Other Financial Assets',                       dt: 's' },
  { c: 'finance', zh: '金融资产明细表',                 en: 'Financial Assets Movement Schedule',           dt: 's' },

  // ── 其他负债 Other Liabilities ───────────────────────────────────────────
  { c: 'otherliab', zh: '其他负债附明细表',             en: 'Other Liabilities Detail Schedule',            dt: 's' },
  { c: 'otherliab', zh: '预计负债',                     en: 'Provisions',                                   dt: 's' },
  { c: 'otherliab', zh: '预计负债变动',                 en: 'Provisions Movement',                          dt: 's' },
  { c: 'otherliab', zh: '预提质保金假设',               en: 'Warranty Provision Assumptions',               dt: 'u' },
  { c: 'otherliab', zh: '预提质保金计算数据',           en: 'Warranty Provision Calculation Data',          dt: 's' },

  // ── 固定资产 Fixed Assets ────────────────────────────────────────────────
  { c: 'fixedasset', zh: '固定资产变动',                en: 'Fixed Asset Movement',                         dt: 's' },
  { c: 'fixedasset', zh: '固定资产对账',                en: 'Fixed Asset Reconciliation',                   dt: 's' },
  { c: 'fixedasset', zh: '资本支出',                    en: 'Capital Expenditure',                          dt: 's' },
  { c: 'fixedasset', zh: '处置清单与审批',              en: 'Disposal Listing and Approvals',               dt: 'u' },
  { c: 'fixedasset', zh: '在建项目明细',                en: 'CIP Project Detail',                           dt: 's' },
  { c: 'fixedasset', zh: '折旧计算表',                  en: 'Depreciation Schedule',                        dt: 's' },
  { c: 'fixedasset', zh: '闲置资产明细表',              en: 'Idle Assets Schedule',                         dt: 's' },
  { c: 'fixedasset', zh: '固定资产减值迹象',            en: 'Fixed Asset Impairment Indicators',            dt: 'u' },
  { c: 'fixedasset', zh: '固定资产减值假设（DCF）',     en: 'Fixed Asset Impairment Assumptions (DCF)',     dt: 'u' },
  { c: 'fixedasset', zh: '固定资产减值假设（FV）',      en: 'Fixed Asset Impairment Assumptions (FV)',      dt: 'u' },

  // ── 租赁 Leases ──────────────────────────────────────────────────────────
  { c: 'lease', zh: '租赁合同',                         en: 'Lease Contracts',                              dt: 'u' },
  { c: 'lease', zh: '租赁计算',                         en: 'Lease Calculations',                           dt: 's' },
  { c: 'lease', zh: '承担',                             en: 'Commitments',                                  dt: 'u' },
  { c: 'lease', zh: '承担明细表',                       en: 'Commitments Detail Schedule',                  dt: 's' },

  // ── 无形资产 Intangible Assets ──────────────────────────────────────────
  { c: 'intangible', zh: '无形资产对账',                en: 'Intangible Asset Reconciliation',              dt: 's' },
  { c: 'intangible', zh: '摊销计算',                    en: 'Amortisation Calculation',                     dt: 's' },
  { c: 'intangible', zh: '无形资产减值假设（DCF）',     en: 'Intangible Impairment Assumptions (DCF)',      dt: 'u' },
  { c: 'intangible', zh: '无形资产减值假设（FV）',      en: 'Intangible Impairment Assumptions (FV)',       dt: 'u' },
  { c: 'intangible', zh: '无形资产减值迹象',            en: 'Intangible Impairment Indicators',             dt: 'u' },

  // ── 关联方 Related Parties ───────────────────────────────────────────────
  { c: 'relatedparty', zh: '关联公司间应收应付明细表',  en: 'Intercompany AR/AP Schedule',                  dt: 's' },
  { c: 'relatedparty', zh: '关联公司间协议',            en: 'Intercompany Agreements',                      dt: 'u' },

  // ── 税项 Taxation ────────────────────────────────────────────────────────
  { c: 'tax', zh: '应交所得税费用变动表',               en: 'Current Tax Expense Movement',                 dt: 's' },
  { c: 'tax', zh: '本期所得税费用计算表',               en: 'Current Tax Computation',                      dt: 's' },
  { c: 'tax', zh: '纳税申报表和应纳税所得额的核对',      en: 'Tax Return and Taxable Income Reconciliation', dt: 's' },
  { c: 'tax', zh: '所得税纳税申报表',                   en: 'Income Tax Returns',                           dt: 'u' },
  { c: 'tax', zh: '递延所得税变动',                     en: 'Deferred Tax Movement',                        dt: 's' },
  { c: 'tax', zh: '递延所得税的可收回性',               en: 'Deferred Tax Recoverability',                  dt: 's' },
  { c: 'tax', zh: '暂时性差异变动明细表',               en: 'Temporary Differences Movement Schedule',      dt: 's' },
  { c: 'tax', zh: '增值税变动表',                       en: 'VAT Movement Schedule',                        dt: 's' },
  { c: 'tax', zh: '增值税纳税申报表',                   en: 'VAT Returns',                                  dt: 'u' },
  { c: 'tax', zh: '税金及附加',                         en: 'Taxes and Surcharges',                         dt: 's' },
  { c: 'tax', zh: '税务咨询机构出具报告（如有）',        en: 'Tax Advisor Reports (if any)',                 dt: 'u' },
  { c: 'tax', zh: '与税务机关的往来函件',               en: 'Correspondence with Tax Authorities',          dt: 'u' },

  // ── 资本及公积 Capital & Reserves ────────────────────────────────────────
  { c: 'capital', zh: '权益变动',                       en: 'Equity Movement',                              dt: 's' },
  { c: 'capital', zh: '期权活动',                       en: 'Share Option Activity',                        dt: 's' },
  { c: 'capital', zh: '加权平均股数和每股收益的计算',    en: 'Weighted Average Shares and EPS Computation',  dt: 's' },
  { c: 'capital', zh: '每股收益的计算',                 en: 'Earnings Per Share Computation',               dt: 's' },

  // ── 采购 Purchases ───────────────────────────────────────────────────────
  { c: 'purchase', zh: '采购明细表',                    en: 'Purchase Detail Schedule',                     dt: 's' },
  { c: 'purchase', zh: '采购订单',                      en: 'Purchase Orders',                              dt: 's' },
  { c: 'purchase', zh: '收货单据',                      en: 'Goods Receipt Notes',                          dt: 's' },
]
