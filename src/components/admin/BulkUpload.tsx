import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  Upload, Download, FileSpreadsheet, FolderOpen, Files,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Loader2, X, Image as ImageIcon
} from 'lucide-react';

type EntityType = 'hotels' | 'vendors' | 'blogs';

interface RowResult {
  row: number;
  success: boolean;
  error?: string;
  id?: number;
  hotel_name?: string;
  name?: string;
  title?: string;
  imageStatus?: 'pending' | 'uploading' | 'done' | 'skipped' | 'error';
  imageError?: string;
  image_url?: string;
}

interface ImportResult {
  inserted: number;
  total: number;
  results: RowResult[];
}

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

// ── Templates ──────────────────────────────────────────────────────────────

const HOTEL_TEMPLATE = [
  { hotel_name: 'The Grand Oberoi', city: 'Delhi', state: 'Delhi', country: 'India', parent_company: 'Oberoi Group', sub_brand: 'Trident', description: 'Luxury hotel in the heart of Delhi', website_url: 'https://example.com', hero_image_url: '' },
];
const VENDOR_TEMPLATE = [
  { vendorName: 'Royal Events Co', email: 'contact@royalevents.com', phone: '+91 98765 43210', contactPersonName: 'Rahul Sharma', category: 'Event Planners', city: 'Delhi', websiteUrl: '', description: 'Premier event planning company', status: 'active' },
];
const BLOG_TEMPLATE = [
  { title: 'Top 10 Hotels in Delhi', content: 'Discover the finest hotels...', image_url: '', category: 'General', city: 'Delhi', author: 'Admin', tags: 'delhi, hotels, luxury', featured: 'false' },
];

const TEMPLATE_MAP: Record<EntityType, object[]> = {
  hotels: HOTEL_TEMPLATE,
  vendors: VENDOR_TEMPLATE,
  blogs: BLOG_TEMPLATE,
};

const KEY_MAP: Record<EntityType, string> = {
  hotels: 'hotels',
  vendors: 'vendors',
  blogs: 'blogs',
};

const IMPORT_API: Record<EntityType, string> = {
  hotels: 'bulk_import_hotels.php',
  vendors: 'bulk_import_vendors.php',
  blogs: 'bulk_import_blogs.php',
};

const LABEL_MAP: Record<EntityType, { singular: string; nameField: string }> = {
  hotels: { singular: 'Hotel', nameField: 'hotel_name' },
  vendors: { singular: 'Vendor', nameField: 'vendorName' },
  blogs: { singular: 'Blog', nameField: 'title' },
};

function downloadTemplate(type: EntityType) {
  const data = TEMPLATE_MAP[type];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type);
  XLSX.writeFile(wb, `ght_${type}_template.xlsx`);
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function BulkUpload({ type, onDone }: { type: EntityType; onDone?: () => void }) {
  // Step 1 — Spreadsheet
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const xlsxRef = useRef<HTMLInputElement>(null);

  // Step 2 — Images
  const [imageMap, setImageMap] = useState<Map<number, File>>(new Map()); // row (1-based) → File
  const [folderFiles, setFolderFiles] = useState<FileList | null>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);

  // Step 3 — Import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [rowResults, setRowResults] = useState<RowResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const { singular, nameField } = LABEL_MAP[type];

  // ── Parse spreadsheet ──────────────────────────────────────────────────

  const handleFile = (file: File) => {
    setParseError('');
    setRows([]);
    setFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: result => {
          if (result.errors.length) { setParseError('CSV parse error: ' + result.errors[0].message); return; }
          setRows(result.data as any[]);
        },
        error: e => setParseError(e.message),
      });
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
          setRows(data as any[]);
        } catch (err: any) {
          setParseError('Failed to parse file: ' + err.message);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // ── Map images from folder ─────────────────────────────────────────────

  const handleFolder = (files: FileList) => {
    setFolderFiles(files);
    const map = new Map<number, File>();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // path like: my_products/1/photo.jpg or my_products/2/anything.jpg
      const parts = f.webkitRelativePath?.split('/') || [];
      // folder name is the row number
      const rowNum = parts.length >= 2 ? parseInt(parts[parts.length - 2]) : NaN;
      if (!isNaN(rowNum) && rowNum > 0) {
        if (!map.has(rowNum)) map.set(rowNum, f); // take first file per subfolder
      }
    }
    setImageMap(map);
  };

  // ── Map images from individually-named files ───────────────────────────

  const handleIndividualFiles = (files: FileList) => {
    const map = new Map<number, File>(imageMap);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // match prefix like 1_photo.jpg, 2_banner.jpg, 1.jpg, 2.jpg
      const match = f.name.match(/^(\d+)[_.\-]/);
      if (match) {
        const rowNum = parseInt(match[1]);
        if (!map.has(rowNum)) map.set(rowNum, f);
      }
    }
    setImageMap(new Map(map));
  };

  // ── Run import ─────────────────────────────────────────────────────────

  const runImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    setImportResult(null);
    setRowResults([]);
    setProgress(0);
    setProgressLabel('Importing data...');

    // Step A: bulk insert
    const payload = { [KEY_MAP[type]]: rows };
    const res = await fetch(API(IMPORT_API[type]), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result: ImportResult = await res.json();
    setImportResult(result);

    const enriched: RowResult[] = result.results.map(r => ({
      ...r,
      imageStatus: imageMap.has(r.row) && r.success ? 'pending' : 'skipped',
    }));
    setRowResults(enriched);
    setProgress(50);

    // Step B: upload images for successful rows
    const toUpload = enriched.filter(r => r.success && r.id && imageMap.has(r.row));
    if (toUpload.length === 0) {
      setProgress(100);
      setProgressLabel('Done!');
      setImporting(false);
      return;
    }

    setProgressLabel(`Uploading images (0 / ${toUpload.length})...`);
    let done = 0;

    for (const row of toUpload) {
      const file = imageMap.get(row.row)!;
      setRowResults(prev => prev.map(r => r.row === row.row ? { ...r, imageStatus: 'uploading' } : r));

      const fd = new FormData();
      fd.append('image', file);
      fd.append('type', type);
      fd.append('record_id', String(row.id));
      fd.append('row_num', String(row.row));

      try {
        const upRes = await fetch(API('bulk_upload_images.php'), { method: 'POST', body: fd });
        const upData = await upRes.json();
        done++;
        setRowResults(prev => prev.map(r =>
          r.row === row.row
            ? { ...r, imageStatus: upData.success ? 'done' : 'error', imageError: upData.error, image_url: upData.image_url }
            : r
        ));
      } catch {
        done++;
        setRowResults(prev => prev.map(r => r.row === row.row ? { ...r, imageStatus: 'error', imageError: 'Network error' } : r));
      }

      setProgress(50 + Math.round((done / toUpload.length) * 50));
      setProgressLabel(`Uploading images (${done} / ${toUpload.length})...`);
    }

    setProgress(100);
    setProgressLabel('Complete!');
    setImporting(false);
    onDone?.();
  };

  const reset = () => {
    setRows([]); setFileName(''); setParseError('');
    setImageMap(new Map()); setFolderFiles(null);
    setImportResult(null); setRowResults([]);
    setProgress(0); setProgressLabel('');
    setShowDetails(false);
    if (xlsxRef.current) xlsxRef.current.value = '';
    if (folderRef.current) folderRef.current.value = '';
    if (filesRef.current) filesRef.current.value = '';
  };

  const successCount = rowResults.filter(r => r.success).length;
  const failCount = rowResults.filter(r => !r.success).length;
  const imgDoneCount = rowResults.filter(r => r.imageStatus === 'done').length;

  return (
    <div className="space-y-5">

      {/* ── Step 1: Download Template ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-[#101c34] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</div>
          <div>
            <p className="font-semibold text-[#101c34] text-sm">Download Template</p>
            <p className="text-xs text-gray-500">Fill in one {singular.toLowerCase()} per row. Save as .xlsx or .csv</p>
          </div>
        </div>
        <div className="p-5">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600 mb-4 font-mono">
            {type === 'hotels' && 'Columns: hotel_name* | city* | state | country | parent_company | sub_brand | description | website_url | hero_image_url'}
            {type === 'vendors' && 'Columns: vendorName* | email* | phone | contactPersonName | category | city | websiteUrl | description | status'}
            {type === 'blogs' && 'Columns: title* | content* | image_url | category | city | author | tags | featured (true/false)'}
            <span className="ml-2 text-red-500">* required</span>
          </div>
          <button
            onClick={() => downloadTemplate(type)}
            className="flex items-center gap-2 border-2 border-[#101c34] text-[#101c34] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#101c34] hover:text-white transition"
          >
            <Download size={15} /> Download Template (.xlsx)
          </button>
        </div>
      </div>

      {/* ── Step 2: Upload Spreadsheet ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-[#101c34] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</div>
          <div>
            <p className="font-semibold text-[#101c34] text-sm">Upload Filled Spreadsheet</p>
            <p className="text-xs text-gray-500">Accepts .xlsx or .csv</p>
          </div>
        </div>
        <div className="p-5">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#101c34] hover:bg-gray-50 transition"
            onClick={() => xlsxRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <FileSpreadsheet size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Drag & drop or <span className="text-[#101c34] font-medium underline">browse</span></p>
            <p className="text-xs text-gray-400 mt-1">.xlsx or .csv</p>
          </div>
          <input ref={xlsxRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {parseError && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{parseError}</div>}

          {rows.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-700">{rows.length} {singular.toLowerCase()}{rows.length > 1 ? 's' : ''} loaded from <span className="font-mono">{fileName}</span></span>
                <button onClick={() => { setRows([]); setFileName(''); if (xlsxRef.current) xlsxRef.current.value = ''; }} className="ml-auto text-gray-400 hover:text-red-500"><X size={15} /></button>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-52">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500 font-semibold">#</th>
                      {Object.keys(rows[0]).slice(0, 6).map(k => (
                        <th key={k} className="px-3 py-2 text-left text-gray-500 font-semibold">{k}</th>
                      ))}
                      {Object.keys(rows[0]).length > 6 && <th className="px-3 py-2 text-gray-400">+{Object.keys(rows[0]).length - 6} more</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        {Object.keys(rows[0]).slice(0, 6).map(k => (
                          <td key={k} className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{String(row[k] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                    {rows.length > 5 && (
                      <tr><td colSpan={8} className="px-3 py-2 text-center text-gray-400">...and {rows.length - 5} more rows</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 3: Upload Images ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gray-300 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</div>
          <div>
            <p className="font-semibold text-[#101c34] text-sm">Upload Images <span className="text-gray-400 font-normal">(optional)</span></p>
            <p className="text-xs text-gray-500">Match images to rows by folder number or file name prefix</p>
          </div>
        </div>
        <div className="p-5 space-y-4">

          {/* Folder method */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500 text-base">★</span>
              <p className="text-sm font-semibold text-yellow-800">Easiest — Select a Folder</p>
            </div>
            <p className="text-xs text-gray-600 mb-3">Create a folder on your computer. Inside it, make subfolders named <b>1, 2, 3...</b> (matching row numbers). Put photos inside each subfolder — any filename is fine.</p>
            <div className="bg-white border border-yellow-200 rounded-lg px-4 py-3 font-mono text-xs text-gray-600 mb-3 space-y-1">
              <div className="text-yellow-700">📁 my_{type}/</div>
              <div className="pl-4 text-yellow-600">📁 1/ → row 1 photos (any names)</div>
              <div className="pl-4 text-yellow-600">📁 2/ → row 2 photos</div>
              <div className="pl-4 text-yellow-600">📁 3/ → row 3 photos</div>
            </div>
            <button
              onClick={() => folderRef.current?.click()}
              className="flex items-center gap-2 bg-[#101c34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition"
            >
              <FolderOpen size={15} /> Select Folder
            </button>
            <input
              ref={folderRef} type="file" className="hidden" multiple
              // @ts-ignore
              webkitdirectory=""
              onChange={e => { if (e.target.files) handleFolder(e.target.files); }}
            />
            {folderFiles && (
              <p className="mt-2 text-xs text-green-700 font-medium">
                <CheckCircle size={12} className="inline mr-1" />
                {folderFiles.length} files detected — {imageMap.size} rows matched
              </p>
            )}
          </div>

          {/* Individual files method */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Or — Select Individual Files</p>
            <p className="text-xs text-gray-500 mb-3">Name each photo with its row number prefix: <span className="font-mono bg-gray-100 px-1 rounded">1_1.jpg</span> <span className="font-mono bg-gray-100 px-1 rounded">1_2.jpg</span> <span className="font-mono bg-gray-100 px-1 rounded">2_1.jpg</span> ... then select all at once.</p>
            <button
              onClick={() => filesRef.current?.click()}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <Files size={15} /> Select Files
            </button>
            <input ref={filesRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { if (e.target.files) handleIndividualFiles(e.target.files); }}
            />
          </div>

          {imageMap.size > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700">
              <ImageIcon size={15} />
              <span><b>{imageMap.size}</b> image{imageMap.size > 1 ? 's' : ''} ready for rows: {[...imageMap.keys()].sort((a,b)=>a-b).slice(0,8).join(', ')}{imageMap.size > 8 ? '...' : ''}</span>
              <button onClick={() => { setImageMap(new Map()); setFolderFiles(null); if(folderRef.current) folderRef.current.value=''; if(filesRef.current) filesRef.current.value=''; }} className="ml-auto text-green-500 hover:text-red-500"><X size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {/* ── Import Button + Progress ── */}
      {rows.length > 0 && !importResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {importing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-[#101c34]" />
                <span className="text-sm font-medium text-[#101c34]">{progressLabel}</span>
                <span className="ml-auto text-sm font-bold text-[#101c34]">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#101c34] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#101c34]">Ready to import {rows.length} {type}</p>
                {imageMap.size > 0 && <p className="text-xs text-gray-500 mt-0.5">{imageMap.size} images will be uploaded after data import</p>}
              </div>
              <button
                onClick={runImport}
                className="flex items-center gap-2 bg-[#101c34] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition"
              >
                <Upload size={15} /> Start Import
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {importResult && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <div className="text-2xl font-bold text-green-700">{successCount}</div>
                <div className="text-xs text-green-600 mt-0.5">Imported</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                <div className="text-2xl font-bold text-red-600">{failCount}</div>
                <div className="text-xs text-red-500 mt-0.5">Failed</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">{imgDoneCount}</div>
                <div className="text-xs text-blue-600 mt-0.5">Images uploaded</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <div className="text-2xl font-bold text-gray-700">{importResult.total}</div>
                <div className="text-xs text-gray-500 mt-0.5">Total rows</div>
              </div>
            </div>

            {/* Progress bar */}
            {progress < 100 && importing && (
              <div className="mb-4 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{progressLabel}</span><span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-[#101c34] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Toggle row details */}
            <button
              onClick={() => setShowDetails(v => !v)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#101c34] transition"
            >
              {showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {showDetails ? 'Hide' : 'Show'} row details
            </button>

            {showDetails && (
              <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 max-h-72">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500">Row</th>
                      <th className="px-3 py-2 text-left text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left text-gray-500">Data</th>
                      <th className="px-3 py-2 text-left text-gray-500">Image</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rowResults.map(r => (
                      <tr key={r.row} className={r.success ? '' : 'bg-red-50'}>
                        <td className="px-3 py-2 text-gray-500">{r.row}</td>
                        <td className="px-3 py-2 text-gray-800 max-w-[150px] truncate">{r.hotel_name || r.name || r.title || '—'}</td>
                        <td className="px-3 py-2">
                          {r.success
                            ? <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} /> OK (ID {r.id})</span>
                            : <span className="flex items-center gap-1 text-red-600"><XCircle size={12} /> {r.error}</span>
                          }
                        </td>
                        <td className="px-3 py-2">
                          {r.imageStatus === 'done'      && <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} /> Uploaded</span>}
                          {r.imageStatus === 'uploading' && <span className="flex items-center gap-1 text-blue-500"><Loader2 size={12} className="animate-spin" /> Uploading</span>}
                          {r.imageStatus === 'error'     && <span className="flex items-center gap-1 text-red-500"><XCircle size={12} /> {r.imageError}</span>}
                          {r.imageStatus === 'pending'   && <span className="text-gray-400">Pending</span>}
                          {r.imageStatus === 'skipped'   && <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {failCount > 0 && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{failCount} row{failCount > 1 ? 's' : ''} failed. Fix the errors in the spreadsheet and re-upload only the failed rows.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100">
            <button onClick={reset} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">Upload Another</button>
            {onDone && <button onClick={onDone} className="px-4 py-2 rounded-lg bg-[#101c34] text-white text-sm hover:bg-[#1a2d52] transition">Done</button>}
          </div>
        </div>
      )}
    </div>
  );
}
