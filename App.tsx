import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ShoppingCart, Edit3, Download, Settings, FileText, Plus, RefreshCw, Layers, Search, Database } from 'lucide-react';
import { DesignInterface } from './components/DesignInterface';
import { PurchaseInterface } from './components/PurchaseInterface';
import { PurchasePdfTemplate } from './components/PurchasePdfTemplate';
import { LOGO_BASE64 } from './constants';
import { PurchaseLog } from './type';

import { savePurchaseLog, getPurchaseLogs } from './services/dbPurchase';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'purchase' | 'design' | 'database'>('dashboard');
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTarget, setEditTarget] = useState<PurchaseLog | null>(null);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');

  const [downloadTarget, setDownloadTarget] = useState<PurchaseLog | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (downloadTarget && !isDownloading) {
        generatePdfFromLog();
    }
  }, [downloadTarget]);

  const generatePdfFromLog = async () => {
      setIsDownloading(true);
      if (!printRef.current || !downloadTarget) {
          setIsDownloading(false);
          setDownloadTarget(null);
          return;
      }
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(printRef.current, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 210 * 3.7795275591,
            onclone: (clonedDoc) => {
                const element = clonedDoc.getElementById('print-container-purchase');
                if(element) {
                   element.style.display = 'block';
                   element.style.opacity = '1';
                }
            }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        const blob = pdf.output('blob');

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = `Purchase_Req_${downloadTarget.prNo.replace(/[^a-z0-9]/gi, '_')}`;
        link.download = `Halagel_${filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (e) {
          console.error(e);
          alert("Failed to generate PDF");
      }
      setIsDownloading(false);
      setDownloadTarget(null);
  };

  const loadHistory = async () => {
    const logs = await getPurchaseLogs();
    setPurchaseHistory(logs);
  };

  useEffect(() => {
    if (activeView === 'dashboard' || activeView === 'database') {
      loadHistory();
      setSearchQuery(''); // Reset search when switching views
      
      // Auto-refresh data every 5 seconds so other users see new PRs immediately
      const intervalId = setInterval(() => {
        loadHistory();
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [activeView]);

  const handleEdit = (log: PurchaseLog) => {
      setEditTarget(log);
      setActiveView('purchase');
  };

  const handleCreateNew = () => {
      setEditTarget(null);
      setActiveView('purchase');
  };

  if (activeView === 'design') {
    return <DesignInterface onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'purchase') {
    return <PurchaseInterface onBack={() => setActiveView('dashboard')} initialLog={editTarget} />;
  }

  const filteredHistory = purchaseHistory.filter(log => 
     (log.prNo && log.prNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
     (log.requesterName && log.requesterName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedHistory = filteredHistory.reduce((acc, log) => {
    const comp = log.companyName || 'Unknown Company';
    const dept = log.department || 'Unknown Department';
    if (!acc[comp]) acc[comp] = {};
    if (!acc[comp][dept]) acc[comp][dept] = [];
    acc[comp][dept].push(log);
    return acc;
  }, {} as Record<string, Record<string, PurchaseLog[]>>);

  const recentHistory = purchaseHistory.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col font-sans text-slate-800">
      {showBanner && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 shadow-2xl rounded-lg p-4 z-50 w-80 flex flex-col gap-2 border-l-4 border-l-[#0284c7] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-[#0284c7] font-semibold">
              <Layers className="w-4 h-4" />
              <span>System Update</span>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
              &times;
            </button>
          </div>
          <div className="text-sm text-slate-600">
            <strong>Changes deployed:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Fax No replaced with Email in Supplier section</li>
              <li>Item list template expanded to 10 rows</li>
              <li>Company name fixed to HALAGEL PRODUCTS SDN BHD</li>
            </ul>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
         <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
             <img src={LOGO_BASE64} className="h-10 w-auto object-contain" alt="Logo" />
             <span className="text-xl font-bold uppercase tracking-wide text-slate-800 hidden sm:inline-block">HALAGEL GROUP OF COMPANIES</span>
         </div>
         <div className="flex items-center gap-6">
            <button 
               onClick={() => setActiveView('database')}
               className={`flex items-center gap-2 ${activeView === 'database' ? 'text-[#0284c7] font-semibold' : 'text-slate-600 hover:text-slate-900 font-medium'} transition-colors`}
            >
               <Layers size={18} />
               <span>Database</span>
            </button>
            <button 
               onClick={handleCreateNew}
               className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
               <FileText size={18} />
               <span>Create New</span>
            </button>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-12 px-6 max-w-5xl mx-auto w-full pb-20">
          
          {activeView === 'dashboard' && (
             <>
                <div className="text-center mb-10">
                   <h1 className="text-4xl font-bold text-[#1e293b] mb-4 tracking-tight">Purchase Request Portal</h1>
                   <p className="text-slate-500 text-lg">Create and manage purchase requests.</p>
                   <button
                      onClick={handleCreateNew}
                      className="mt-8 bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 rounded-lg font-semibold text-lg flex items-center gap-2 mx-auto transition-colors shadow-sm"
                   >
                      <Plus size={20} strokeWidth={3} />
                      Create New Purchase Request
                   </button>
                </div>

                <div className="w-full">
                   <div className="flex justify-between items-end mb-4">
                       <h2 className="text-2xl font-bold text-[#1e293b]">Recent Requests</h2>
                       <button onClick={loadHistory} className="flex items-center gap-1.5 text-[#0284c7] hover:text-[#0369a1] text-sm font-medium transition-colors">
                          <RefreshCw size={14} /> Refresh
                       </button>
                   </div>

                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      {recentHistory.length === 0 ? (
                         <div className="p-8 text-center text-slate-500">No recent requests.</div>
                      ) : (
                         recentHistory.map((log) => (
                            <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                               <div>
                                  <div className="flex items-center gap-2 mb-2">
                                     <span className="font-bold text-[#0284c7]">{log.prNo || 'DRAFT'}</span>
                                     <span className="text-slate-600 font-medium tracking-tight">({log.companyName || 'No Company Selected'})</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-slate-500">
                                     <span className="flex items-center gap-1.5 text-slate-600">
                                       <FileText size={14} /> {log.requesterName || 'Unnamed'} - {log.department || 'No Department'}
                                     </span>
                                     <span className="flex items-center gap-1.5">
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                       Created: {log.dateCreated} {log.createdAtTime}
                                     </span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3 text-slate-400 self-end sm:self-auto">
                                  <button onClick={() => handleEdit(log)} className="p-2 hover:bg-slate-100 hover:text-[#0284c7] rounded transition-colors" title="Edit">
                                     <Edit3 size={18} />
                                  </button>
                                  <button onClick={() => setDownloadTarget(log)} disabled={isDownloading} className="p-2 hover:bg-slate-100 hover:text-[#0284c7] rounded transition-colors" title="Download">
                                     <Download size={18} />
                                  </button>
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                </div>
             </>
          )}

          {activeView === 'database' && (
             <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-[#1e293b]">Purchase Requests Database</h2>
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <input 
                             type="text" 
                             placeholder="Search by PR Number or Name..." 
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all"
                          />
                          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                       </div>
                       <button onClick={loadHistory} className="flex items-center gap-1.5 text-[#0284c7] hover:text-[#0369a1] text-sm font-medium transition-colors whitespace-nowrap">
                          <RefreshCw size={14} /> Refresh
                       </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
                   {filteredHistory.length === 0 ? (
                      <div className="py-12 text-center text-slate-500">
                         {searchQuery ? 'No matching purchase requests found.' : 'No purchase requests found.'}
                      </div>
                   ) : (
                      Object.entries(groupedHistory).map(([company, departments]) => (
                         <div key={company} className="space-y-4">
                             <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-800 flex items-center gap-2">
                               <Layers className="text-[#0284c7]" size={20} />
                               {company}
                             </h3>
                             <div className="pl-4 md:pl-6 space-y-6">
                                 {Object.entries(departments).map(([dept, logs]) => (
                                    <div key={dept} className="space-y-3">
                                        <h4 className="font-semibold text-slate-600 text-sm uppercase tracking-wider">{dept}</h4>
                                        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-200">
                                            {logs.map(log => (
                                             <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white transition-colors gap-4">
                                                <div>
                                                   <div className="flex items-center gap-2 mb-1">
                                                      <span className="font-bold text-[#0284c7]">{log.prNo || 'DRAFT'}</span>
                                                      {log.status && <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e0f2fe] text-[#0284c7] px-2 py-0.5 rounded-full">{log.status}</span>}
                                                   </div>
                                                   <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-slate-500">
                                                      <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                        <FileText size={14} /> {log.requesterName || 'Unnamed'}
                                                      </span>
                                                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        {log.dateCreated} {log.createdAtTime}
                                                      </span>
                                                   </div>
                                                </div>
                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                   <button onClick={() => handleEdit(log)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 text-slate-600 hover:text-[#0284c7] rounded-md transition-colors" title="Edit">
                                                      <Edit3 size={16} /> <span className="hidden sm:inline">Edit</span>
                                                   </button>
                                                   <button onClick={() => setDownloadTarget(log)} disabled={isDownloading} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 text-slate-600 hover:text-[#0284c7] rounded-md transition-colors" title="Download">
                                                      <Download size={16} /> <span className="hidden sm:inline">Download</span>
                                                   </button>
                                                </div>
                                             </div>
                                            ))}
                                        </div>
                                    </div>
                                 ))}
                             </div>
                         </div>
                      ))
                   )}
                </div>
             </div>
          )}
      </main>

      <footer className="w-full py-6 text-center mt-auto">
         <p className="text-sm text-slate-500">
            Created by Muhammad Nur Idham Bin Razali
         </p>
      </footer>

      {/* Off-screen but layout-stable container for PDF Generation */}
      <div className="fixed left-0 top-0 pointer-events-none opacity-0 z-[-50]">
         <div ref={printRef} id="print-container-purchase">
            {downloadTarget?.data && <PurchasePdfTemplate data={downloadTarget.data} />}
         </div>
      </div>
    </div>
  );
}
