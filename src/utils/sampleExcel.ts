/**
 * 零依赖的最小 XLSX 生成器
 *
 * 用 ZIP(store，不压缩) + 最小 OOXML 结构直接拼出一个真正的 .xlsx，
 * Excel / WPS / Numbers 都能正常打开，因此不需要引入 sheetjs 之类的第三方库。
 */

const encoder = new TextEncoder()

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const NS_DOC_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships'

// ===== CRC32（ZIP 需要） =====
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array) {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

interface ZipEntry {
  name: string
  data: Uint8Array
}

/** 组装 ZIP 包（store 模式），返回可直接下载的 Blob */
function zip(entries: ZipEntry[]): Blob {
  const localChunks: Uint8Array[] = []
  const centralChunks: Uint8Array[] = []
  const dosTime = 0
  const dosDate = ((2024 - 1980) << 9) | (1 << 5) | 1 // 2024-01-01
  let offset = 0

  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const crc = crc32(entry.data)
    const size = entry.data.length

    const local = new Uint8Array(30 + name.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true) // local file header
    lv.setUint16(4, 20, true) // version needed
    lv.setUint16(6, 0x0800, true) // 文件名使用 UTF-8
    lv.setUint16(8, 0, true) // 压缩方式：store
    lv.setUint16(10, dosTime, true)
    lv.setUint16(12, dosDate, true)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, size, true) // 压缩后大小
    lv.setUint32(22, size, true) // 原始大小
    lv.setUint16(26, name.length, true)
    lv.setUint16(28, 0, true) // extra length
    local.set(name, 30)

    const dir = new Uint8Array(46 + name.length)
    const dv = new DataView(dir.buffer)
    dv.setUint32(0, 0x02014b50, true) // central directory header
    dv.setUint16(4, 20, true) // version made by
    dv.setUint16(6, 20, true) // version needed
    dv.setUint16(8, 0x0800, true)
    dv.setUint16(10, 0, true)
    dv.setUint16(12, dosTime, true)
    dv.setUint16(14, dosDate, true)
    dv.setUint32(16, crc, true)
    dv.setUint32(20, size, true)
    dv.setUint32(24, size, true)
    dv.setUint16(28, name.length, true)
    dv.setUint32(42, offset, true) // 相对 local header 的偏移
    dir.set(name, 46)

    localChunks.push(local, entry.data)
    centralChunks.push(dir)
    offset += local.length + size
  }

  const centralSize = centralChunks.reduce((sum, c) => sum + c.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true) // end of central directory
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)

  return new Blob([...localChunks, ...centralChunks, end], { type: XLSX_MIME })
}

// ===== XML 辅助 =====
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }

const escapeXml = (v: string) => v.replace(/[&<>"']/g, ch => ESCAPES[ch])

/** 0 → A, 25 → Z, 26 → AA */
function colName(index: number) {
  let n = index + 1
  let s = ''
  while (n > 0) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

/** 样式索引，对应下方 styles.xml 中的 cellXfs 顺序 */
const STYLE = { default: 0, title: 1, header: 2, body: 3, label: 4 } as const
type StyleKey = keyof typeof STYLE

interface Cell {
  v: string | number
  style?: StyleKey
}

interface Row {
  cells: Cell[]
  height?: number
}

function cellXml(ref: string, cell: Cell) {
  const style = cell.style && cell.style !== 'default' ? ` s="${STYLE[cell.style]}"` : ''
  const value = cell.v
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"${style}><v>${value}</v></c>`
  if (value === '') return `<c r="${ref}"${style}/>`
  return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`
}

function worksheetXml(rows: Row[], widths: number[]) {
  const cols = widths.length
    ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : ''
  const body = rows
    .map((row, r) => {
      const idx = r + 1
      const ht = row.height ? ` ht="${row.height}" customHeight="1"` : ''
      const cells = row.cells.map((c, i) => cellXml(`${colName(i)}${idx}`, c)).join('')
      return `<row r="${idx}"${ht}>${cells}</row>`
    })
    .join('')
  return `${XML_HEAD}<worksheet xmlns="${NS_MAIN}"><sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${body}</sheetData></worksheet>`
}

const STYLES_XML = `${XML_HEAD}<styleSheet xmlns="${NS_MAIN}">
<fonts count="4">
<font><sz val="10"/><color rgb="FF1F2937"/><name val="Calibri"/></font>
<font><b/><sz val="14"/><color rgb="FF00338D"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF334155"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF00338D"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

const CONTENT_TYPES = `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

const ROOT_RELS = `${XML_HEAD}<Relationships xmlns="${NS_PKG_REL}">
<Relationship Id="rId1" Type="${NS_DOC_REL}/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

function workbookXml(sheetName: string) {
  return `${XML_HEAD}<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_DOC_REL}"><sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
}

const WORKBOOK_RELS = `${XML_HEAD}<Relationships xmlns="${NS_PKG_REL}">
<Relationship Id="rId1" Type="${NS_DOC_REL}/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="${NS_DOC_REL}/styles" Target="styles.xml"/>
</Relationships>`

/** 把内容打包成 xlsx Blob */
function buildXlsx(sheetName: string, rows: Row[], widths: number[]): Blob {
  return zip([
    { name: '[Content_Types].xml', data: encoder.encode(CONTENT_TYPES) },
    { name: '_rels/.rels', data: encoder.encode(ROOT_RELS) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml(sheetName)) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(WORKBOOK_RELS) },
    { name: 'xl/styles.xml', data: encoder.encode(STYLES_XML) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(worksheetXml(rows, widths)) },
  ])
}

/** 触发浏览器下载 */
function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 移除文件名里的非法字符 */
export function safeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim() || 'WorkPaper'
}

// ===== 对外的「样例底稿模版」 =====
export interface WorkPaperTemplateInfo {
  /** 底稿模版名称，如 Wp Temp */
  templateName: string
  /** 程序描述 */
  procedureName: string
  /** RMM ID */
  rmId: string
  /** 关联 KCw Activity */
  kcwActivity: string
  /** 程序类型 WT / TOE / SAP */
  procedureType: string
  /** 业务流程 */
  businessProcess: string
}

const TEMPLATE_HEADERS = ['序号', '凭证号', '记账日期', '摘要', '科目代码 / 名称', '借方金额', '贷方金额', '抽样结论']

const EXAMPLE_ROWS: (string | number)[][] = [
  [1, 'JV-2025-00001', '2025-01-15', '示例：确认销售收入', '6001 / 主营业务收入', 75000, '', '已核对，无异常'],
  [2, 'JV-2025-00002', '2025-02-08', '示例：冲销暂估入库', '1401 / 库存商品', '', 58200, '已核对，无异常'],
]

/** 空行数：留给编制人填写的行 */
const BLANK_ROWS = 8

/** 列宽（A–H） */
const COLUMN_WIDTHS = [16, 30, 4, 16, 30, 16, 16, 16]

/**
 * 生成并下载一份「样例底稿模版」Excel（.xlsx）。
 * 表格结构：模版抬头（程序信息 / 编制复核 ）+ 明细表头 + 示例行 + 待填空白行。
 */
export function downloadSampleWorkPaperTemplate(info: WorkPaperTemplateInfo) {
  const meta = (leftLabel: string, leftValue: string, rightLabel: string, rightValue: string): Row => ({
    cells: [
      { v: leftLabel, style: 'label' },
      { v: leftValue, style: 'body' },
      { v: '' },
      { v: rightLabel, style: 'label' },
      { v: rightValue, style: 'body' },
    ],
  })

  const rows: Row[] = [
    { cells: [{ v: `Work Paper Template — ${info.templateName}`, style: 'title' }], height: 30 },
    { cells: [] },
    meta('业务流程', info.businessProcess, '程序类型', info.procedureType),
    meta('RMM ID', info.rmId, 'KCw Activity', info.kcwActivity),
    meta('程序描述', info.procedureName, '模版名称', info.templateName),
    meta('编制人', '', '编制日期', ''),
    meta('复核人', '', '复核日期', ''),
    { cells: [] },
    { cells: TEMPLATE_HEADERS.map(h => ({ v: h, style: 'header' as StyleKey })), height: 22 },
  ]

  EXAMPLE_ROWS.forEach(sample => {
    rows.push({ cells: sample.map(v => ({ v, style: 'body' as StyleKey })) })
  })

  for (let i = 0; i < BLANK_ROWS; i += 1) {
    rows.push({
      cells: Array.from({ length: TEMPLATE_HEADERS.length }, (_, col) => ({
        v: col === 0 ? EXAMPLE_ROWS.length + i + 1 : '',
        style: 'body' as StyleKey,
      })),
    })
  }

  const sheetName = `${safeFileName(info.templateName)}`.slice(0, 31)
  const fileName = `${safeFileName(info.templateName)}_${safeFileName(info.procedureName).slice(0, 40)}.xlsx`
  saveBlob(buildXlsx(sheetName, rows, COLUMN_WIDTHS), fileName)
}
