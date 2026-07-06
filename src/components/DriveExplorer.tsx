import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileJson, 
  Search, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  Clock,
  HardDrive,
  Eye,
  Download,
  AlertCircle,
  Filter,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { fetchDriveFiles } from '../workspaceApi';
import { DriveFile, Project } from '../types';

interface DriveExplorerProps {
  accessToken: string;
  activeProject: Project | null;
  onModifyAttachments: (files: any[]) => void;
}

export default function DriveExplorer({ accessToken, activeProject, onModifyAttachments }: DriveExplorerProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'visionweaver' | 'n8n'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview & Download States
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Load files when component is active or refreshed
  const loadFiles = async (queryText?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Build search query text based on active filters
      let baseQuery = '';
      if (currentFilter === 'visionweaver') {
        baseQuery = 'VisionWeaver';
      } else if (currentFilter === 'n8n') {
        baseQuery = 'n8n';
      }

      // If user provided a manual query, override or combine
      if (queryText) {
        baseQuery = queryText;
      }

      const items = await fetchDriveFiles(accessToken, baseQuery || undefined);
      setFiles(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch Drive items. Token might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [accessToken, currentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  // Helper to trigger direct client side file preview
  const handleOpenPreview = async (file: DriveFile) => {
    setPreviewFile(file);
    setPreviewError(null);
    setPreviewBlobUrl(null);
    
    // If the file is an image or text/json, we can fetch it live to render inside the app
    const isPreviewable = 
      file.mimeType.includes('image') || 
      file.mimeType.includes('json') || 
      file.mimeType.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.json');

    if (isPreviewable) {
      setIsPreviewLoading(true);
      try {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Google API standard preview returned ${response.status}`);
        }

        const blob = await response.blob();
        
        if (file.mimeType.includes('image')) {
          const url = URL.createObjectURL(blob);
          setPreviewBlobUrl(url);
        } else {
          // Parse text as preview content
          const text = await blob.text();
          setPreviewBlobUrl(text);
        }
      } catch (err: any) {
        console.warn('Live preview fetching disabled or restricted:', err);
        setPreviewError('Cannot retrieve preview data directly. Use Launch button or download to inspect.');
      } finally {
        setIsPreviewLoading(false);
      }
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl && previewFile?.mimeType.includes('image')) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewFile(null);
    setPreviewBlobUrl(null);
    setPreviewError(null);
  };

  // Safe Client-side file downloader via OAuth Auth headers
  const handleDownloadFile = async (file: DriveFile) => {
    setIsDownloading(file.id);
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Google Drive API media call failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('File download failed:', err);
      alert(`Could not download file: ${err.message || err}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const getMimeIcon = (mimeType: string) => {
    if (mimeType.toLowerCase().includes('image')) {
      return <ImageIcon className="w-5 h-5 text-indigo-400" />;
    }
    if (mimeType.toLowerCase().includes('video')) {
      return <VideoIcon className="w-5 h-5 text-cyan-400" />;
    }
    if (mimeType.toLowerCase().includes('json')) {
      return <FileJson className="w-5 h-5 text-amber-400" />;
    }
    if (mimeType.toLowerCase().includes('folder')) {
      return <Folder className="w-5 h-5 text-yellow-500" />;
    }
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return '—';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const isAttached = (fileId: string) => {
    if (!activeProject) return false;
    return activeProject.driveAttachments.some(att => att.id === fileId);
  };

  const toggleAttachment = (file: DriveFile) => {
    if (!activeProject) return;
    let list = [...activeProject.driveAttachments];
    const index = list.findIndex(att => att.id === file.id);

    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        webViewLink: file.webViewLink
      });
    }

    onModifyAttachments(list);
  };

  const attachAllVisible = () => {
    if (!activeProject || files.length === 0) return;
    const currentList = [...activeProject.driveAttachments];
    let addedCount = 0;
    files.forEach(file => {
      const exists = currentList.some(att => att.id === file.id);
      if (!exists) {
        currentList.push({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          webViewLink: file.webViewLink
        });
        addedCount++;
      }
    });
    if (addedCount > 0) {
      onModifyAttachments(currentList);
    }
  };

  const removeAllAttachments = () => {
    if (!activeProject) return;
    if (window.confirm(`Are you sure you want to decouple all ${activeProject.driveAttachments.length} attached files from this project?`)) {
      onModifyAttachments([]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-6 space-y-6 shadow-sm">
      
      {/* Search Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              Google Drive Explorer: Estibancreations
            </h2>
            <span className="text-[10px] bg-slate-900 text-white font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
              Drive API Connected
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Retrieve, preview, and associate assets from your Google Account directly into the system pipeline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 max-w-xl w-full xl:justify-end">
          {/* Quick Filters */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 select-none">
            <button
              onClick={() => { setCurrentFilter('all'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-md text-3xs font-mono font-bold uppercase transition duration-150 cursor-pointer ${
                currentFilter === 'all' ? 'bg-white shadow-2xs text-indigo-650' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => { setCurrentFilter('visionweaver'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-md text-3xs font-mono font-bold uppercase transition duration-150 cursor-pointer ${
                currentFilter === 'visionweaver' ? 'bg-white shadow-2xs text-indigo-650' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Filter by VisionWeaver in filename"
            >
              VisionWeaver Files
            </button>
            <button
              onClick={() => { setCurrentFilter('n8n'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-md text-3xs font-mono font-bold uppercase transition duration-150 cursor-pointer ${
                currentFilter === 'n8n' ? 'bg-white shadow-2xs text-indigo-650' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Filter by n8n in filename"
            >
              n8n Attachments
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Query name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-700 pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-sans transition-colors focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => loadFiles()}
              className="p-2 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Warning Alert if Project is not selected */}
      {!activeProject && (
        <div className="p-3.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-2 font-medium">
          <Clock className="w-4 h-4 shrink-0 text-amber-600" />
          Select a project in the left sidebar to assign files. Assumed account: <span className="font-bold underline text-amber-900">estibancreations@gmail.com</span>
        </div>
      )}

      {/* Interactive Item Preview Panel Overlay */}
      {previewFile && (
        <div className="p-4 bg-slate-50 border border-slate-250 rounded-xl space-y-3.5 font-sans relative">
          <button 
            onClick={handleClosePreview}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 font-bold text-xs cursor-pointer bg-white px-2 py-1 rounded border border-slate-200 shadow-3xs"
          >
            ✕ Close
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-800">VisionWeaver Interactive Asset Previewer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
            <div className="md:col-span-1 space-y-2 text-3xs font-mono text-slate-500 border-r border-slate-150 pr-4">
              <div className="pb-1 border-b border-slate-100">
                <p className="uppercase font-bold text-slate-400 text-[9px]">File Name</p>
                <p className="text-slate-850 font-bold font-sans mt-0.5 max-w-xs break-all">{previewFile.name}</p>
              </div>
              <div>
                <p className="uppercase font-bold text-slate-400 text-[9px]">Google File ID</p>
                <p className="text-slate-800 select-all font-bold truncate mt-0.5">{previewFile.id}</p>
              </div>
              <div>
                <p className="uppercase font-bold text-slate-400 text-[9px]">MIME Type</p>
                <p className="text-slate-800 mt-0.5">{previewFile.mimeType}</p>
              </div>
              <div>
                <p className="uppercase font-bold text-slate-400 text-[9px]">File Size</p>
                <p className="text-slate-800 mt-0.5">{formatSize(previewFile.size)}</p>
              </div>
              
              <div className="pt-2 flex flex-col gap-1.5 font-sans">
                {previewFile.webViewLink && (
                  <a 
                    href={previewFile.webViewLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full text-center py-1.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded font-semibold transition"
                  >
                    Open in Drive ↗
                  </a>
                )}
                <button
                  onClick={() => handleDownloadFile(previewFile)}
                  className="w-full text-center py-1.5 text-[10px] bg-indigo-600 hover:bg-indigo-750 text-white rounded font-semibold transition"
                >
                  Download File
                </button>
              </div>
            </div>

            <div className="md:col-span-3 flex items-center justify-center min-h-[180px] bg-slate-50/50 rounded-lg border border-slate-100 p-2 relative overflow-hidden">
              {isPreviewLoading ? (
                <div className="text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-3xs text-slate-500 font-mono">Fetching item payload...</p>
                </div>
              ) : previewError ? (
                <div className="text-center p-4 space-y-1 rounded bg-rose-50 border border-rose-100 max-w-sm">
                  <AlertCircle className="w-4 h-4 mx-auto text-rose-500" />
                  <p className="text-3xs font-mono font-semibold text-rose-800">{previewError}</p>
                </div>
              ) : previewBlobUrl ? (
                previewFile.mimeType.includes('image') ? (
                  <img 
                    src={previewBlobUrl} 
                    alt={previewFile.name} 
                    className="max-h-[220px] rounded object-contain shadow-xs border border-white"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <pre className="text-[10px] font-mono text-slate-700 w-full overflow-auto max-h-[220px] bg-slate-900 border border-slate-850 p-4 rounded text-left leading-normal whitespace-pre">
                    {previewBlobUrl}
                  </pre>
                )
              ) : (
                <div className="text-center font-sans space-y-1">
                  <CheckCircle className="w-5 h-5 mx-auto text-slate-350" />
                  <p className="text-3xs text-slate-550 font-semibold">Ready metadata preview</p>
                  <p className="text-[9px] text-slate-400">This mime-type is previewed via direct download extraction.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Operations Panel */}
      {activeProject && files.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-indigo-55/40 rounded-xl border border-indigo-100/55 text-xs shrink-0 bg-slate-50/50">
          <div className="flex flex-col text-indigo-900 font-sans">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="p-1 leading-none rounded bg-indigo-100 text-indigo-700 font-mono text-[9px] uppercase tracking-wider font-extrabold">Batch Mode</span>
              <span>Bulk Attachment Manager</span>
            </div>
            <span className="text-slate-500 font-normal text-3xs mt-1">
              Select, queue, or clear all {files.length} queried Drive container assets safely at once.
            </span>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={attachAllVisible}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-3xs uppercase tracking-wider font-mono font-bold transition-colors shadow-2xs hover:shadow-xs cursor-pointer"
            >
              Attach All {files.length} Files
            </button>
            {activeProject.driveAttachments.length > 0 && (
              <button
                onClick={removeAllAttachments}
                className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-lg text-3xs uppercase tracking-wider font-mono font-bold transition-colors shadow-2xs cursor-pointer"
              >
                Clear All ({activeProject.driveAttachments.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Files Table */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 text-xs font-mono">Connecting to Google Drive container...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-150 text-rose-700 rounded-lg p-5 text-center text-xs space-y-2">
          <p className="font-mono font-medium">Warning: {error}</p>
          <p className="text-slate-500 text-2xs">Make sure you are logged into your 'Estibancreations' workspace account with Drive API scopes.</p>
          <button
            onClick={() => loadFiles()}
            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-md font-sans text-xs transition"
          >
            Retry Connection
          </button>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
          <p className="text-slate-550 text-xs font-sans">No files found corresponding to search criteria.</p>
          <p className="text-slate-400 text-2xs">Upload items directly to your Google Drive to see them populated here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-3xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-2xs font-mono bg-slate-50/70 uppercase tracking-wider">
                <th className="py-3 px-4">Name / ID</th>
                <th className="py-3 px-4">Mimetype</th>
                <th className="py-3 px-2 text-center">Filesize</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-600 text-xs">
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  className={`hover:bg-slate-50/50 transition-colors ${
                    isAttached(file.id) ? 'bg-indigo-50/30 border-l-[3px] border-indigo-600' : ''
                  }`}
                >
                  <td className="py-4 px-4 font-sans max-w-[240px] truncate">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-105 shrink-0">
                        {getMimeIcon(file.mimeType)}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-3xs text-slate-455 font-mono select-all truncate">
                          id: {file.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500 text-3xs max-w-[140px] truncate" title={file.mimeType}>
                    {file.mimeType}
                  </td>
                  <td className="py-4 px-2 text-center text-3xs font-mono text-slate-500">
                    {formatSize(file.size)}
                  </td>
                  <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                    {/* Live Preview Button */}
                    <button
                      onClick={() => handleOpenPreview(file)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded border border-slate-200 text-2xs transition hover:bg-slate-50 bg-white shadow-3xs cursor-pointer select-none"
                      title="Preview Container Asset payload"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>

                    {/* Direct Blob Downloader */}
                    <button
                      onClick={() => handleDownloadFile(file)}
                      disabled={isDownloading === file.id}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded border border-slate-200 text-2xs transition hover:bg-slate-50 bg-white shadow-3xs cursor-pointer select-none"
                      title="Download file locally"
                    >
                      {isDownloading === file.id ? (
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      Get
                    </button>

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded border border-slate-205 text-2xs transition hover:bg-slate-50 bg-white shadow-3xs"
                        title="View File inside Google web console"
                      >
                        Launch
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {activeProject && (
                      <button
                        onClick={() => toggleAttachment(file)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-2xs font-bold select-none cursor-pointer transition ${
                          isAttached(file.id)
                            ? 'bg-rose-50 text-rose-600 border border-rose-150 hover:bg-rose-100/50'
                            : 'bg-indigo-50 text-indigo-650 border border-indigo-150 hover:bg-indigo-100/60'
                        }`}
                      >
                        {isAttached(file.id) ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-rose-600" />
                            Remove
                          </>
                        ) : (
                          <>
                            Attach to n8n
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
