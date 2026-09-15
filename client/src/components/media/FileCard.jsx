import React from 'react';
import { FileText, FileSpreadsheet, FileArchive, File, Download } from 'lucide-react';

export default function FileCard({ url, filename, filesize, mimeType, isOutgoing = false }) {
  const getFileIcon = () => {
    const fn = (filename || '').toLowerCase();
    if (fn.endsWith('.pdf')) return <FileText className="w-6 h-6 text-rose-400" />;
    if (fn.endsWith('.doc') || fn.endsWith('.docx') || fn.endsWith('.txt')) return <FileText className="w-6 h-6 text-blue-400" />;
    if (fn.endsWith('.xls') || fn.endsWith('.xlsx') || fn.endsWith('.csv')) return <FileSpreadsheet className="w-6 h-6 text-emerald-400" />;
    if (fn.endsWith('.zip') || fn.endsWith('.rar') || fn.endsWith('.tar') || fn.endsWith('.7z')) return <FileArchive className="w-6 h-6 text-amber-400" />;
    return <File className="w-6 h-6 text-zinc-400" />;
  };

  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-2xl min-w-[220px] sm:min-w-[280px] max-w-sm border select-none transition-colors ${
      isOutgoing
        ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-100 hover:bg-zinc-800'
    }`}>
      <div className="flex items-center gap-3 truncate">
        <div className={`p-2.5 rounded-xl ${isOutgoing ? 'bg-white/20' : 'bg-zinc-900'}`}>
          {getFileIcon()}
        </div>
        <div className="truncate">
          <div className="text-xs font-semibold truncate leading-tight">{filename || 'Shared File'}</div>
          <div className="text-[11px] opacity-70 mt-0.5">{filesize || 'Download file'}</div>
        </div>
      </div>

      <a
        href={url}
        download={filename || 'file'}
        target="_blank"
        rel="noreferrer"
        className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
          isOutgoing
            ? 'bg-white text-brand hover:bg-zinc-100'
            : 'bg-brand text-white hover:bg-brand-hover shadow-subtle'
        }`}
        title="Download file"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
}
