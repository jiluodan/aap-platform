import { useMemo, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './KdrWorkbench.css'

// ===== Types =====
export type KdrFileStatus = 'pending' | 'parsing' | 'parsed' | 'failed'

export interface KdrField {
  id: string
  name: string
  nameCn: string
  value: string
  confidence: number
  /** 用户通过「新增抽取字段」自定义的字段 */
  custom?: boolean
}

export interface KdrFile {
  id: string
  name: string
  /** 文件类型（按扩展名，如 PDF / XLSX） */
  fileType: string
  status: KdrFileStatus
  size: string
  /** 所属数据源 */
  source: string
  uploader: string
  uploadedAt: string
  pages: number
  fields: KdrField[]
}

interface KdrWorkbenchProps {
  files: KdrFile[]
  /** 「上传」按钮：交由上层打开上传弹窗 */
  onUpload?: () => void
}

// ===== Constants =====
const PAGE_SIZE = 10
const uid = () => Math.random().toString(36).slice(2, 9)

const STATUS_META: Record<KdrFileStatus, { zh: string; en: string }> = {
  pending: { zh: '待解析', en: 'Pending' },
  parsing: { zh: '解析中', en: 'Parsing' },
  parsed: { zh: '已解析', en: 'Parsed' },
  failed: { zh: '解析失败', en: 'Failed' },
}

type SortKey = 'name' | 'fileType' | 'status'

/** 自动抽取的演示返回（真实场景由 KDR 引擎的 OCR + 抽取模型给出） */
export function buildExtractedFields(fileName: string): KdrField[] {
  const title = fileName.replace(/\.[^.]+$/, '')
  return [
    { id: uid(), name: 'Document title', nameCn: '文件标题', value: title, confidence: 0.98 },
    { id: uid(), name: 'Period', nameCn: '所属期间', value: '2025-12', confidence: 0.95 },
    { id: uid(), name: 'Counterparty', nameCn: '相关方', value: 'Aurora Technology Group', confidence: 0.88 },
    { id: uid(), name: 'Amount', nameCn: '金额', value: '1,248,300.00', confidence: 0.93 },
    { id: uid(), name: 'Currency', nameCn: '币种', value: 'CNY', confidence: 0.99 },
  ]
}

/** 累加 「320KB」「1.8MB」 这类体积字符串 */
function sumSize(sizes: string[]): string {
  const totalKb = sizes.reduce((sum, s) => {
    const n = parseFloat(s) || 0
    return sum + (/mb/i.test(s) ? n * 1024 : n)
  }, 0)
  return totalKb >= 1024 ? `${(totalKb / 1024).toFixed(1)}MB` : `${Math.round(totalKb)}KB`
}

/** 稳定的伪随机：让预览页的文字行宽度在同一次会话内保持一致 */
function seededWidths(seed: string, count: number): number[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000
  return Array.from({ length: count }, (_, i) => {
    h = (h * 1103515245 + 12345) % 2147483648
    return 62 + ((h >> (i % 7)) % 36)
  })
}

// ===== Component =====
export default function KdrWorkbench({ files, onUpload }: KdrWorkbenchProps) {
  const { lang } = useLanguage()
  const isZh = lang === 'zh'
  const t = (zh: string, en: string) => (isZh ? zh : en)

  const [list, setList] = useState<KdrFile[]>(files)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showMarks, setShowMarks] = useState(true)
  const [page, setPage] = useState(1)
  const [extracting, setExtracting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [highlightFieldId, setHighlightFieldId] = useState<string | null>(null)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const notify = (msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  // --- 派生数据 ---
  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      const av = sortKey === 'status' ? STATUS_META[a.status].en : a[sortKey]
      const bv = sortKey === 'status' ? STATUS_META[b.status].en : b[sortKey]
      return av.localeCompare(bv) * dir
    })
  }, [list, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const selected = list.find(f => f.id === selectedId) || null
  const selectedIndex = selected ? sorted.findIndex(f => f.id === selected.id) : -1
  const checkedFiles = list.filter(f => checkedIds.has(f.id))

  // --- 排序 ---
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortIcon = (key: SortKey) => {
    const active = sortKey === key
    return (
      <svg className="kdrw-sort" data-active={active} width="9" height="9" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {active
          ? (sortDir === 'asc' ? <polyline points="6 15 12 9 18 15" /> : <polyline points="6 9 12 15 18 9" />)
          : (<><polyline points="7 10 12 5 17 10" /><polyline points="7 14 12 19 17 14" /></>)}
      </svg>
    )
  }

  // --- 文件选择 / 导航 ---
  const selectFile = (id: string) => {
    setSelectedId(id)
    setHighlightFieldId(null)
  }
  const step = (delta: number) => {
    if (sorted.length === 0) return
    const next = selectedIndex < 0 ? 0 : Math.min(sorted.length - 1, Math.max(0, selectedIndex + delta))
    selectFile(sorted[next].id)
  }

  // --- 勾选 ---
  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleCheckAll = () => {
    setCheckedIds(prev => {
      const allPagedChecked = paged.every(f => prev.has(f.id))
      const next = new Set(prev)
      paged.forEach(f => (allPagedChecked ? next.delete(f.id) : next.add(f.id)))
      return next
    })
  }

  // --- 左栏动作 ---
  const handleUpload = () => {
    if (onUpload) onUpload()
    else notify(t('请在上方「Upload File」中上传文件', 'Use "Upload File" above to add files'))
  }

  const handleMerge = () => {
    if (checkedFiles.length < 2) {
      notify(t('请至少勾选 2 个文件后再合并', 'Select at least 2 files to merge'))
      return
    }
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const merged: KdrFile = {
      id: `kdr-merged-${uid()}`,
      name: `Merged_${checkedFiles.length}files_${stamp}.pdf`,
      fileType: 'PDF',
      status: 'pending',
      size: sumSize(checkedFiles.map(f => f.size)),
      source: checkedFiles[0].source,
      uploader: checkedFiles[0].uploader,
      uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      pages: checkedFiles.reduce((s, f) => s + f.pages, 0),
      fields: [],
    }
    const mergedIds = new Set(checkedFiles.map(f => f.id))
    setList(prev => [merged, ...prev.filter(f => !mergedIds.has(f.id))])
    if (selectedId && mergedIds.has(selectedId)) setSelectedId(merged.id)
    setCheckedIds(new Set())
    notify(t(`已合并 ${checkedFiles.length} 个文件`, `Merged ${checkedFiles.length} files`))
  }

  const handleExport = () => {
    if (sorted.length === 0) { notify(t('文件列表为空，无可导出内容', 'Nothing to export')); return }
    const header = ['File Name', 'File Type', 'Data Source', 'Status', 'Size', 'Uploader', 'Uploaded At']
    const rows = sorted.map(f => [
      f.name, f.fileType, f.source,
      isZh ? STATUS_META[f.status].zh : STATUS_META[f.status].en,
      f.size, f.uploader, f.uploadedAt,
    ])
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `KDR_file_list_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notify(t(`已导出 ${sorted.length} 条记录`, `Exported ${sorted.length} rows`))
  }

  const handleRefresh = () => {
    setList(files)
    setCheckedIds(new Set())
    setPage(1)
    if (selectedId && !files.some(f => f.id === selectedId)) setSelectedId(null)
    notify(t('文件列表已刷新', 'File list refreshed'))
  }

  const handleDelete = (id: string) => {
    setList(prev => prev.filter(f => f.id !== id))
    setCheckedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    if (selectedId === id) setSelectedId(null)
    notify(t('文件已移除', 'File removed'))
  }

  // --- 抽取 ---
  const handleExtract = () => {
    if (!selected || extracting) return
    const targetId = selected.id
    setExtracting(true)
    setList(prev => prev.map(f => (f.id === targetId ? { ...f, status: 'parsing' } : f)))
    setTimeout(() => {
      setList(prev => prev.map(f => (
        f.id === targetId
          ? { ...f, status: 'parsed', fields: buildExtractedFields(f.name) }
          : f
      )))
      setExtracting(false)
      notify(t('自动抽取完成', 'Auto extraction finished'))
    }, 900)
  }

  const handleAddField = () => {
    if (!selected) { notify(t('请先选择一个文件', 'Select a file first')); return }
    const field: KdrField = { id: uid(), name: `Custom field ${selected.fields.filter(f => f.custom).length + 1}`, nameCn: `自定义字段 ${selected.fields.filter(f => f.custom).length + 1}`, value: '—', confidence: 0, custom: true }
    setList(prev => prev.map(f => (f.id === selected.id ? { ...f, fields: [...f.fields, field] } : f)))
    setHighlightFieldId(field.id)
  }

  const handleRemoveField = (fieldId: string) => {
    if (!selected) return
    setList(prev => prev.map(f => (f.id === selected.id ? { ...f, fields: f.fields.filter(x => x.id !== fieldId) } : f)))
    if (highlightFieldId === fieldId) setHighlightFieldId(null)
  }

  const handleSaveTemplate = (mode: 'current' | 'new') => {
    if (!selected || selected.fields.length === 0) {
      notify(t('暂无可保存的抽取字段', 'No extracted field to save'))
      return
    }
    notify(mode === 'current'
      ? t('已保存至当前模板', 'Saved to current template')
      : t('已另存为新模板', 'Saved as a new template'))
  }

  const lineWidths = useMemo(
    () => seededWidths(selected?.name || 'kdr', 16),
    [selected?.name],
  )

  return (
    <div className="kdrw">
      {/* ---------- 顶部：返回 / 文件导航 ---------- */}
      <div className="kdrw-topbar">
        <button className="kdrw-back" onClick={() => { setSelectedId(null); setHighlightFieldId(null) }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          {t('返回结果列表', 'Back to result list')}
        </button>
        <div className="kdrw-nav">
          <button onClick={() => step(-1)} disabled={selectedIndex <= 0}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            {t('上一个文件', 'Previous file')}
          </button>
          <button onClick={() => step(1)} disabled={selectedIndex < 0 || selectedIndex >= sorted.length - 1}>
            {t('下一个文件', 'Next file')}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      {/* ---------- 三栏工作区 ---------- */}
      <div className="kdrw-cols">
        {/* 左栏：文件列表 */}
        <section className="kdrw-col kdrw-col-files">
          <div className="kdrw-col-bar">
            <span className="kdrw-col-title">{t('文件列表', 'File list')}</span>
            <div className="kdrw-file-actions">
              <button className="kdrw-btn kdrw-btn-primary" onClick={handleUpload}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                {t('上传', 'Upload')}
              </button>
              <button className="kdrw-btn kdrw-btn-dark" onClick={handleMerge} disabled={checkedFiles.length < 2}
                title={t('勾选两个及以上文件后合并为一个文件', 'Merge two or more selected files into one')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></svg>
                {t('合并', 'Merge')}
              </button>
              <button className="kdrw-btn kdrw-btn-outline" onClick={handleExport}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                {t('导出', 'Export')}
              </button>
              <button className="kdrw-btn kdrw-btn-soft" onClick={handleRefresh}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                {t('刷新', 'Refresh')}
              </button>
            </div>
          </div>

          <div className="kdrw-table-head">
            <span className="kdrw-th kdrw-th-check">
              <input type="checkbox" checked={paged.length > 0 && paged.every(f => checkedIds.has(f.id))} onChange={toggleCheckAll} />
            </span>
            <span className="kdrw-th kdrw-th-sortable" onClick={() => toggleSort('name')}>
              {t('文件名称', 'File name')}{sortIcon('name')}
            </span>
            <span className="kdrw-th kdrw-th-sortable" onClick={() => toggleSort('fileType')}>
              {t('文件类型', 'File type')}{sortIcon('fileType')}
            </span>
            <span className="kdrw-th kdrw-th-sortable" onClick={() => toggleSort('status')}>
              {t('文件状态', 'Status')}{sortIcon('status')}
            </span>
            <span className="kdrw-th kdrw-th-ops">{t('操作', 'Action')}</span>
          </div>

          <div className="kdrw-table-body">
            {paged.map(f => (
              <div key={f.id} className="kdrw-row" data-selected={f.id === selectedId}
                onClick={() => selectFile(f.id)}>
                <span className="kdrw-td kdrw-th-check" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={checkedIds.has(f.id)} onChange={() => toggleCheck(f.id)} />
                </span>
                <span className="kdrw-td kdrw-td-name" title={f.name}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  {f.name}
                </span>
                <span className="kdrw-td kdrw-td-type">{f.fileType}</span>
                <span className="kdrw-td">
                  <span className={`kdrw-status ${f.status}`}>
                    {f.status === 'parsing' && <i className="kdrw-spin" />}
                    {isZh ? STATUS_META[f.status].zh : STATUS_META[f.status].en}
                  </span>
                </span>
                <span className="kdrw-td kdrw-td-ops">
                  <button className="kdrw-link" onClick={e => { e.stopPropagation(); selectFile(f.id) }}>{t('查看', 'View')}</button>
                  <button className="kdrw-link danger" onClick={e => { e.stopPropagation(); handleDelete(f.id) }}>{t('删除', 'Delete')}</button>
                </span>
              </div>
            ))}
            {paged.length === 0 && <div className="kdrw-empty">{t('暂无数据', 'No data')}</div>}
          </div>

          <div className="kdrw-pager">
            <span>{t(`共 ${sorted.length} 条`, `${sorted.length} in total`)}</span>
            <select value={PAGE_SIZE} disabled>
              <option value={PAGE_SIZE}>{t(`${PAGE_SIZE}条/页`, `${PAGE_SIZE} / page`)}</option>
            </select>
            <div className="kdrw-pager-nav">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span className="kdrw-page-num">{safePage}</span>
              <button disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            <span className="kdrw-pager-goto">
              {t('前往', 'Go to')}
              <input type="text" inputMode="numeric" value={safePage}
                onChange={e => {
                  const n = parseInt(e.target.value.replace(/\D/g, ''), 10)
                  if (!Number.isNaN(n)) setPage(Math.min(pageCount, Math.max(1, n)))
                }} />
              {t('页', 'page')}
            </span>
          </div>
        </section>

        {/* 中栏：原始文件预览 */}
        <section className="kdrw-col kdrw-col-preview">
          <div className="kdrw-col-bar">
            <div className="kdrw-meta">
              <span className="kdrw-meta-item">{t('文件类型', 'File type')}<b>{selected?.fileType || ''}</b></span>
              <span className="kdrw-meta-item">{t('上传人', 'Uploaded by')}<b>{selected?.uploader || ''}</b></span>
              <span className="kdrw-meta-item">{t('上传时间', 'Uploaded at')}<b>{selected?.uploadedAt || ''}</b></span>
            </div>
          </div>
          <div className="kdrw-col-sub">
            <span className="kdrw-col-subtitle">{t('原始文件预览', 'Original file preview')}</span>
            <label className="kdrw-switch">
              <input type="checkbox" checked={showMarks} onChange={e => setShowMarks(e.target.checked)} />
              <span className="kdrw-switch-track"><i /></span>
              {t('显示标记', 'Show marks')}
            </label>
          </div>
          <div className="kdrw-preview-body">
            {selected ? (
              <div className="kdrw-page">
                <div className="kdrw-page-name">{selected.name}</div>
                <div className="kdrw-page-lines">
                  {lineWidths.map((w, i) => (
                    <span key={i} className="kdrw-page-line" style={{ width: `${w}%` }} />
                  ))}
                </div>
                {showMarks && selected.fields.length > 0 && (
                  <div className="kdrw-marks">
                    {selected.fields.slice(0, 6).map((f, i) => (
                      <span key={f.id}
                        className="kdrw-mark"
                        data-hot={f.id === highlightFieldId}
                        title={`${isZh ? f.nameCn : f.name}: ${f.value}`}
                        style={{ top: `${12 + i * 13}%`, width: `${38 + (i % 3) * 12}%`, left: `${6 + (i % 2) * 8}%` }}>
                        {isZh ? f.nameCn : f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="kdrw-placeholder">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <p>{t('请从左侧文件列表中选择一个文件', 'Select a file from the list on the left')}</p>
              </div>
            )}
          </div>
        </section>

        {/* 右栏：抽取结果 */}
        <section className="kdrw-col kdrw-col-result">
          <div className="kdrw-col-bar">
            <span className="kdrw-col-title">{t('抽取结果', 'Extraction result')}</span>
          </div>
          <div className="kdrw-col-sub">
            <span className="kdrw-col-subtitle">{t('自定义抽取字段', 'Custom extraction fields')}</span>
            <button className="kdrw-btn kdrw-btn-outline" onClick={handleAddField}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              {t('新增抽取字段', 'Add field')}
            </button>
          </div>
          <div className="kdrw-result-body">
            {selected && selected.fields.length > 0 ? (
              <table className="kdrw-field-table">
                <thead>
                  <tr>
                    <th>{t('字段名称', 'Field')}</th>
                    <th>{t('抽取值', 'Value')}</th>
                    <th className="kdrw-th-conf">{t('置信度', 'Confidence')}</th>
                    <th className="kdrw-th-del"></th>
                  </tr>
                </thead>
                <tbody>
                  {selected.fields.map(f => (
                    <tr key={f.id} data-hot={f.id === highlightFieldId}
                      onMouseEnter={() => setHighlightFieldId(f.id)}
                      onMouseLeave={() => setHighlightFieldId(null)}>
                      <td>
                        {isZh ? f.nameCn : f.name}
                        {f.custom && <span className="kdrw-custom-tag">{t('自定义', 'Custom')}</span>}
                      </td>
                      <td className="kdrw-value" title={f.value}>{f.value}</td>
                      <td className="kdrw-th-conf">
                        {f.confidence > 0
                          ? <span className={`kdrw-conf ${f.confidence >= 0.9 ? 'high' : f.confidence >= 0.8 ? 'mid' : 'low'}`}>{(f.confidence * 100).toFixed(0)}%</span>
                          : <span className="kdrw-conf-none">—</span>}
                      </td>
                      <td className="kdrw-th-del">
                        <button className="kdrw-link danger" title={t('删除该字段', 'Remove field')} onClick={() => handleRemoveField(f.id)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="kdrw-placeholder">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h5" /></svg>
                <p>{t('选择文件后点击「自动抽取」获取关键字段', 'Select a file and click "Auto extract" to get key fields')}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ---------- 底部动作 ---------- */}
      <div className="kdrw-footer">
        <button className="kdrw-btn kdrw-btn-auto" onClick={handleExtract}
          disabled={!selected || extracting || selected.status === 'parsing'}>
          {extracting && <i className="kdrw-spin light" />}
          {extracting ? t('抽取中...', 'Extracting...') : t('自动抽取', 'Auto extract')}
        </button>
        <button className="kdrw-btn kdrw-btn-outline" onClick={() => handleSaveTemplate('current')}
          disabled={!selected || selected.fields.length === 0}>
          {t('保存至当前模板', 'Save to current template')}
        </button>
        <button className="kdrw-btn kdrw-btn-outline" onClick={() => handleSaveTemplate('new')}
          disabled={!selected || selected.fields.length === 0}>
          {t('另存为新模板', 'Save as new template')}
        </button>
      </div>

      {toast && <div className="kdrw-toast">{toast}</div>}
    </div>
  )
}
