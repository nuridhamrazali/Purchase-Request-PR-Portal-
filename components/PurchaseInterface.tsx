import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, ShoppingCart, Plus, Trash2, AlertCircle, PenTool, ArrowLeft, Info } from 'lucide-react';
import { PurchaseRequisitionData, INITIAL_PURCHASE_DATA, PurchaseItem, PurchaseLog } from '../type';
import { PurchasePdfTemplate } from './PurchasePdfTemplate';
import { FormInput, FormSelect } from './FormControls';
import { LOGO_BASE64 } from '../constants';
import { savePurchaseLog, getPurchaseLogs } from '../services/dbPurchase';

import { ACCOUNT_CODES } from './accountCodes';

const UOM_OPTIONS = ['UNIT', 'PCS', 'ROLL', 'KG', 'G', 'APP', 'LITER'];

const DEPARTMENTS = [
  "Purchasing",
  "Medical Device",
  "HR & Admin",
  "QA/QC",
  "SHE",
  "Warehouse",
  "Engineering",
  "Sales",
  "Softgel",
  "Rocksalt",
  "R&D",
  "Toothpaste",
  "Cosmetics",
  "Admin Manufacturing",
  "Account & Finance",
  "Creative & Design"
];

export const PurchaseInterface = ({ onBack, initialLog }: { onBack: () => void, initialLog?: PurchaseLog | null }) => {
  const [purchaseData, setPurchaseData] = useState<PurchaseRequisitionData>(() => initialLog?.data ? JSON.parse(JSON.stringify(initialLog.data)) : JSON.parse(JSON.stringify(INITIAL_PURCHASE_DATA)));
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseLog[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const templateRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Load History from Firebase
  useEffect(() => {
    const fetchLogs = async () => {
      const logs = await getPurchaseLogs();
      setPurchaseHistory(logs);
    };
    fetchLogs();
  }, []);

  const toUpper = (val: any) => typeof val === 'string' ? val.toUpperCase() : val;
  const toTitleCase = (val: string) => {
    if (!val) return val;
    return val.split(' ').map(word => 
        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
    ).join(' ');
  };

  const handlePurchaseChange = (field: keyof PurchaseRequisitionData, value: any) => {
    setPurchaseData(prev => {
        const newVal = field === 'department' ? value : toUpper(value);
        const newData = { ...prev, [field]: newVal };
        if (field === 'requesterName') {
            newData.requestedBy = { ...newData.requestedBy, name: newVal };
        } else if (field === 'date') {
            newData.requestedBy = { ...newData.requestedBy, date: value };
        }
        return newData;
    });
  };

  const handlePurchaseNestedChange = (section: 'requestedBy' | 'approvedBy' | 'acknowledgedAdmin' | 'acknowledgedPurchasing', field: string, value: any) => {
    let formattedValue = value;
    if (field === 'signature' && typeof value === 'string') {
        formattedValue = toTitleCase(value);
    } else if (field !== 'date' && field !== 'signature') {
        formattedValue = toUpper(value);
    }
    
    setPurchaseData(prev => {
        const newData = {
            ...prev,
            [section]: {
                ...prev[section],
                [field]: formattedValue
            }
        };

        if (section === 'requestedBy' && field === 'name') {
            newData.requesterName = formattedValue as string;
        } else if (section === 'requestedBy' && field === 'date') {
            newData.date = formattedValue as string;
        }

        return newData;
    });
  };

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
        id: Date.now().toString(),
        itemCode: '',
        description: '',
        uom: 'UNIT',
        quantity: 1,
        costPerUnit: 0
    };
    setPurchaseData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (id: string) => {
    if (purchaseData.items.length === 1) return; // Prevent deleting last item
    setPurchaseData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const handleItemChange = (id: string, field: keyof PurchaseItem, value: any) => {
    setPurchaseData(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? { ...item, [field]: toUpper(value) } : item)
    }));
  };

  const isPrNumberUnique = (prNo: string) => {
      if(!prNo) return true;
      return !purchaseHistory.some(log => log.prNo === prNo && log.id !== initialLog?.id);
  };

  const isCurrentPrNumberUsed = !isPrNumberUnique(purchaseData.prNo);

  const saveToHistory = async () => {
      const now = new Date();
      let logToSave: PurchaseLog;
      
      if (initialLog) {
         // Update existing log
         logToSave = {
             ...initialLog,
             prNo: purchaseData.prNo || initialLog.prNo,
             requesterName: purchaseData.requesterName,
             companyName: purchaseData.companyName,
             department: purchaseData.department,
             data: purchaseData // update the data
         };
      } else {
          // Create new
          const pad = (n: number) => n.toString().padStart(2, '0');
          logToSave = {
              id: Date.now().toString(),
              prNo: purchaseData.prNo || 'DRAFT-' + Math.floor(Math.random() * 1000),
              requesterName: purchaseData.requesterName,
              companyName: purchaseData.companyName,
              department: purchaseData.department,
              dateCreated: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
              createdAtTime: now.toLocaleTimeString(),
              status: 'Generated',
              data: purchaseData
          };
      }
      
      await savePurchaseLog(logToSave);
      
      // Update local state for immediate feedback
      setPurchaseHistory(prev => {
          if (initialLog) {
              return prev.map(log => log.id === logToSave.id ? logToSave : log);
          } else {
              return [logToSave, ...prev];
          }
      });
  };

  const generatePdfBlob = async (): Promise<Blob | null> => {
      if (!printRef.current) return null;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 200));

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
        return pdf.output('blob');
      } catch (e) {
          console.error(e);
          return null;
      }
  };

  const generatePdf = async () => {
    if (isCurrentPrNumberUsed) {
        alert(`PR Number ${purchaseData.prNo} has already been used! Please change it before submitting.`);
        return;
    }

    setIsGenerating(true);
    const blob = await generatePdfBlob();
    if (blob) {
        await saveToHistory();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = `Purchase_Req_${purchaseData.prNo.replace(/[^a-z0-9]/gi, '_')}`;
        link.download = `Halagel_${filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        onBack(); // Go back to dashboard after submitting
    } else {
        alert("Failed to submit PR");
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Form Input */}
      <div className="w-full max-w-5xl mx-auto bg-white shadow-2xl overflow-y-auto h-full border-x border-gray-200 z-10 custom-scrollbar flex flex-col relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-20 shadow-sm text-gray-800">
          <div className="px-6 py-4 flex flex-col gap-2">
             <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 text-gray-600 rounded-full transition-colors -ml-2">
                    <ArrowLeft size={20} />
                </button>
                <img src={LOGO_BASE64} className="h-10 w-auto object-contain" alt="Logo" />
                <span className="text-xl font-bold uppercase tracking-wide text-slate-800">HALAGEL GROUP OF COMPANIES</span>
             </div>
             <div className="pl-12">
                <h1 className="text-lg font-bold tracking-tight uppercase text-gray-800">
                    Purchase Request Form
                </h1>
             </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8 pb-24 animate-fadeIn">
            
            {/* Company Selection */}
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block">Company Name</label>
                <div className="relative">
                    <select
                        value={purchaseData.companyName}
                        onChange={(e) => handlePurchaseChange('companyName', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-800 text-sm focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all appearance-none"
                    >
                        <option value="HALAGEL (M) SDN. BHD.">HALAGEL (M) SDN. BHD.</option>
                        <option value="HALAGEL PRODUCTS SDN. BHD.">HALAGEL PRODUCTS SDN. BHD.</option>
                        <option value="HALAGEL PLANT (M) SDN. BHD.">HALAGEL PLANT (M) SDN. BHD.</option>
                        <option value="BIOWISE SDN BHD">BIOWISE SDN BHD</option>
                        <option value="KOHALAGEL">KOHALAGEL</option>
                        <option value="HALAGEL EDAR SDN BHD">HALAGEL EDAR SDN BHD</option>
                        <option value="SEMCODIGINET SDN BHD">SEMCODIGINET SDN BHD</option>
                        <option value="IDAMAN PHARMA SDN BHD">IDAMAN PHARMA SDN BHD</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Unique PR Check */}
            <div className={`p-4 rounded-xl border ${isCurrentPrNumberUsed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">PR Number</label>
                    {isCurrentPrNumberUsed ? 
                        <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle size={12}/> Duplicate</span> :
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Info size={12}/> Available</span>
                    }
                </div>
                <input 
                    className={`w-full bg-white border rounded-lg p-2 font-mono text-sm text-black outline-none focus:ring-2 ${isCurrentPrNumberUsed ? 'border-red-300 focus:ring-red-200' : 'border-green-300 focus:ring-green-200'}`}
                    value={purchaseData.prNo}
                    onChange={(e) => handlePurchaseChange('prNo', e.target.value)}
                    placeholder="ADMIN/2025/XXXX"
                />
                <div className="mt-2 text-[10px] text-gray-500">
                    *Ensure this number is unique for your records.
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Date" type="date" value={purchaseData.date} onChange={(e) => handlePurchaseChange('date', e.target.value)} />
                <FormInput label="Requester Name" value={purchaseData.requesterName} onChange={(e) => handlePurchaseChange('requesterName', e.target.value)} />
                <FormSelect label="Department" options={DEPARTMENTS} value={purchaseData.department} onChange={(e) => handlePurchaseChange('department', e.target.value)} />
                <FormInput label="Delivery Req." value={purchaseData.deliveryRequirement} onChange={(e) => handlePurchaseChange('deliveryRequirement', e.target.value)} />
                <FormSelect label="Account Code" options={ACCOUNT_CODES} value={purchaseData.accountCode} onChange={(e) => handlePurchaseChange('accountCode', e.target.value)} />
            </div>

            <div className="space-y-3">
                <datalist id="purpose-options">
                    <option value="New Order" />
                    <option value="Replacement" />
                    <option value="Repeat Order" />
                    <option value="Product Registration / Notification" />
                    <option value="Audit Findings Requirement" />
                    <option value="QC Testing / Calibration" />
                    <option value="R&D / Sample" />
                    <option value="Breakdown, Service & Maintanance" />
                </datalist>
                <FormInput label="Purpose / Justification" type="text" list="purpose-options" placeholder="Select or type here..." value={purchaseData.purpose} onChange={(e) => handlePurchaseChange('purpose', e.target.value)} />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-gray-700">Items List</h3>
                    <button onClick={handleAddItem} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1 font-semibold">
                        <Plus size={14} /> Add Item
                    </button>
                </div>
                
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-xs text-gray-600 border-b">
                                <th className="p-2 text-left w-8">#</th>
                                <th className="p-2 text-left w-24">Item Code</th>
                                <th className="p-2 text-left">Description</th>
                                <th className="p-2 text-left w-24">UOM</th>
                                <th className="p-2 text-left w-20">Qty</th>
                                <th className="p-2 text-left w-24">Cost/Unit</th>
                                <th className="p-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseData.items.map((item, index) => (
                                <tr key={item.id} className="border-b align-top">
                                    <td className="p-2 text-center text-gray-500 pt-3">{index + 1}</td>
                                    <td className="p-2 align-top">
                                        <input 
                                            type="text" 
                                            className="w-full p-1 border rounded text-sm text-black"
                                            value={item.itemCode}
                                            onChange={(e) => handleItemChange(item.id, 'itemCode', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 align-top">
                                        <textarea 
                                            className="w-full p-1 border rounded text-sm min-h-[40px] resize-y text-black"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 align-top">
                                        <div className="flex flex-col gap-1">
                                            <select
                                                className="w-full p-1 border rounded text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none text-black"
                                                value={UOM_OPTIONS.includes(item.uom) ? item.uom : 'OTHER'}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'OTHER') {
                                                        handleItemChange(item.id, 'uom', '');
                                                    } else {
                                                        handleItemChange(item.id, 'uom', val);
                                                    }
                                                }}
                                            >
                                                {UOM_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                                <option value="OTHER">Other</option>
                                            </select>
                                            {!UOM_OPTIONS.includes(item.uom) && (
                                                <input
                                                    type="text"
                                                    className="w-full p-1 border rounded text-sm uppercase placeholder-gray-400 focus:ring-2 focus:ring-blue-100 outline-none text-black"
                                                    placeholder="Custom UOM"
                                                    value={item.uom}
                                                    onChange={(e) => handleItemChange(item.id, 'uom', e.target.value.toUpperCase())}
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 align-top">
                                        <input 
                                            type="number" 
                                            className="w-full p-1 border rounded text-sm text-black"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 align-top">
                                        <input 
                                            type="number" 
                                            className="w-full p-1 border rounded text-sm text-black"
                                            value={item.costPerUnit}
                                            onChange={(e) => handleItemChange(item.id, 'costPerUnit', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-center align-top pt-3">
                                        {purchaseData.items.length > 1 && (
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold text-gray-700">Recommended Supplier</h3>
                <FormInput label="Supplier Name/Address" textarea value={purchaseData.recommendedSupplier} onChange={(e) => handlePurchaseChange('recommendedSupplier', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Contact Person" value={purchaseData.contactPerson} onChange={(e) => handlePurchaseChange('contactPerson', e.target.value)} />
                    <FormInput label="Tel No" value={purchaseData.telNo} onChange={(e) => handlePurchaseChange('telNo', e.target.value)} />
                    <FormInput label="Email" type="email" value={purchaseData.email} onChange={(e) => handlePurchaseChange('email', e.target.value)} />
                    <FormInput label="Term" value={purchaseData.term} onChange={(e) => handlePurchaseChange('term', e.target.value)} />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold text-gray-700">Signatures</h3>
                
                {/* Requested By - Special UI */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Requested By</label>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mb-3">
                        <div className="flex-1 bg-white border border-gray-300 rounded-lg p-2 flex flex-col min-h-[100px] relative group">
                            <div className="absolute top-2 right-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                                <PenTool size={16} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Sign here..." 
                                className="w-full h-full text-center text-4xl outline-none text-black bg-transparent z-10 placeholder-gray-300"
                                style={{ fontFamily: '"Great Vibes", "Kunstler Script", cursive' }}
                                value={purchaseData.requestedBy.signature}
                                onChange={(e) => handlePurchaseNestedChange('requestedBy', 'signature', e.target.value)}
                            />
                            <div className="text-[10px] text-gray-400 text-center mt-auto select-none pointer-events-none">Type to sign</div>
                        </div>
                        <div className="w-full md:w-48 opacity-75 pointer-events-none">
                            <FormInput label="Date (Auto)" type="date" value={purchaseData.requestedBy.date} onChange={() => {}} />
                        </div>
                    </div>
                    <div className="opacity-75 pointer-events-none">
                        <FormInput label="Name (Auto)" value={purchaseData.requestedBy.name} onChange={() => {}} />
                    </div>
                 </div>


            </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
             <button
                 onClick={generatePdf}
                 disabled={isGenerating}
                 className={`w-full py-4 text-lg rounded-xl shadow-md flex items-center justify-center text-white transition-all transform hover:scale-[1.01] bg-[#0284c7] hover:bg-[#0369a1] font-bold ${isGenerating ? 'opacity-70 cursor-not-allowed text-white/90' : ''}`}
             >
                  {isGenerating ? (
                      <><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-3"></div> Submitting...</>
                  ) : (
                      <>Submit Purchase Request</>
                  )}
             </button>
        </div>
      </div>

      {/* Off-screen but layout-stable container for PDF Generation */}
      <div className="fixed left-0 top-0 pointer-events-none opacity-0 z-[-50]">
         <div ref={printRef} id="print-container-purchase">
            <PurchasePdfTemplate data={purchaseData} />
         </div>
      </div>
    </div>
  );
};
