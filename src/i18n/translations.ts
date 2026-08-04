export type Lang = 'en' | 'zh'

export const translations = {
  en: {
    // TopNav / Global
    welcome: 'Welcome',
    searchPlaceholder: 'Search clients, engagements, work papers...',
    back: 'Back',
    home: 'Home',
    language: 'Language',

    // Client Summary
    clientOverview: 'Overview',
    clientOverviewCn: '总览',
    all: 'All',
    inProgress: 'In Progress',
    planning: 'Planning',
    activeClients: 'Active Clients',
    activeProjects: 'Active Projects',
    plannedProjects: 'Planned Projects',
    highRiskProjects: 'High Risk Projects',
    armsProfiles: 'ARMS Profiles',
    engagementCodes: 'Engagement',
    projectsCount: '{{count}} Profiles',
    rollForward: 'Roll Forward Opinion Profile',
    rollForwardShort: 'Roll Forward',

    // ARMS Profile Card
    period: 'Period',
    progress: 'Progress',
    riskLevel: 'Risk Level',
    highRisk: 'High',
    mediumRisk: 'Medium',
    lowRisk: 'Low',

    // Second layer preview icons
    lifecyclePhase: 'Lifecycle',
    pbcStatus: 'PBC',
    workPapers: 'Work Papers',
    dataCollection: 'Data',
    auditProcedures: 'Procedures',
    openExceptions: 'Exceptions',
    materiality: 'Materiality',

    // Status
    statusActive: 'Active',
    statusPlanning: 'Planning',
    statusCompleted: 'Completed',

    // Support
    supportCenter: 'Support Center',
    supportCenterCn: '运维支持中心',
    submitEnquiry: 'Submit New',
    trackEnquiries: 'Track Enquiries',

    // Dashboard
    dashboard: 'Dashboard',
    dashboardCn: '数据报表中心',
    engagementReports: 'Engagement Reports',
    managementReports: 'Management Reports',

    // Engagement Hub
    backToOverview: 'Overview',
    financePeriod: 'Finance Period',
    timeCostBudget: 'Time Cost Budget',
    budgetUsed: '{{pct}}% used',
    budgetOver: 'Over budget',
    budgetOnTrack: 'On track',
    opinionAndKCwTitle: 'Opinion and KCw File Dashboard',
    search: 'Search',
    sortBy: 'Sort By',
    lastViewed: 'Last Viewed',
    sortAZ: 'A-Z',
    sortZA: 'Z-A',
    tileView: 'Tile View',
    listView: 'List View',
    byOpinionProfile: 'By Opinion Profile',
    byKCwFile: 'By KCw File',
    opinionProfile: 'Opinion Profile',
    kcwFile: 'KCw File',
    engagementModules: 'Engagement Modules',
    auditProcedures: 'Audit Procedures',
    pbcManager: 'PBC Manager',
    dataProcessing: 'Data Processing Center',
    workPaperStation: 'Work Paper Station',
    opinionProfileModule: 'Opinion Profile',
    collaborationHub: 'Collaboration Hub',
    planningMateriality: 'Planning Materiality',
    alertClosure: 'Alert Closure',
    auditLifecycle: 'Audit Lifecycle',
  },
  zh: {
    // TopNav / Global
    welcome: '欢迎',
    searchPlaceholder: '搜索客户、项目、底稿...',
    back: '返回',
    home: '首页',
    language: '语言',

    // Client Summary
    clientOverview: 'Overview',
    clientOverviewCn: '总览',
    all: '全部',
    inProgress: '进行中',
    planning: '计划中',
    activeClients: '活跃客户',
    activeProjects: '进行中项目',
    plannedProjects: '计划中的项目',
    highRiskProjects: '高风险项目',
    armsProfiles: 'ARMS 档案',
    engagementCodes: '项目',
    projectsCount: '{{count}} 个档案',
    rollForward: '延续 Opinion Profile',
    rollForwardShort: 'Roll Forward',

    // ARMS Profile Card
    period: '审计期间',
    progress: '进度',
    riskLevel: '风险等级',
    highRisk: '高',
    mediumRisk: '中',
    lowRisk: '低',

    // Second layer preview icons
    lifecyclePhase: '生命周期',
    pbcStatus: 'PBC',
    workPapers: '底稿',
    dataCollection: '数据',
    auditProcedures: '程序',
    openExceptions: '例外',
    materiality: '重要性',

    // Status
    statusActive: '进行中',
    statusPlanning: '计划中',
    statusCompleted: '已完成',

    // Support
    supportCenter: 'Support Center',
    supportCenterCn: '运维支持中心',
    submitEnquiry: '提交新请求',
    trackEnquiries: '追踪请求',

    // Dashboard
    dashboard: 'Dashboard',
    dashboardCn: '数据报表中心',
    engagementReports: '项目报表',
    managementReports: '管理报表',

    // Engagement Hub
    backToOverview: '总览',
    financePeriod: '财务期间',
    timeCostBudget: '时间成本预算',
    budgetUsed: '已使用 {{pct}}%',
    budgetOver: '超支',
    budgetOnTrack: '正常',
    opinionAndKCwTitle: 'Opinion and KCw 文件看板',
    search: '搜索',
    sortBy: '排序方式',
    lastViewed: '最近查看',
    sortAZ: 'A-Z',
    sortZA: 'Z-A',
    tileView: '卡片视图',
    listView: '列表视图',
    byOpinionProfile: '按 Opinion Profile',
    byKCwFile: '按 KCw File',
    opinionProfile: 'Opinion Profile',
    kcwFile: 'KCw File',
    engagementModules: '项目模块',
    auditProcedures: '审计程序',
    pbcManager: 'PBC 管理',
    dataProcessing: '数据处理中心',
    workPaperStation: '底稿工作站',
    opinionProfileModule: '意见档案',
    collaborationHub: '协作中心',
    planningMateriality: '计划重要性',
    alertClosure: '警示关闭率',
    auditLifecycle: '审计生命周期',
  },
} as const

export type TranslationKey = keyof (typeof translations)['en']
