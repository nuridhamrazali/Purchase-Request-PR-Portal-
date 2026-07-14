import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileText, ArrowLeft, Paintbrush } from 'lucide-react';
import { DesignRequestData, INITIAL_DATA } from '../type';
import { PdfTemplate } from './PdfTemplate';
import { FormInput, CheckboxGroup, SectionTitle, FormSelect } from './FormControls';
import { LOGO_BASE64 } from '../constants';

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

export const DesignInterface = ({ onBack }: { onBack: () => void }) => {
  const [designData, setDesignData] = useState<DesignRequestData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const templateRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDesignChange = (field: keyof DesignRequestData, value: any) => {
    setDesignData(prev => ({ ...prev, [field]: value }));
  };

  const handleDesignNestedChange = (section: keyof DesignRequestData, field: string, value: any) => {
    setDesignData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
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
                const element = clonedDoc.getElementById('print-container-design');
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
    setIsGenerating(true);
    const blob = await generatePdfBlob();
    if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = `Design_Request_${designData.productName ? designData.productName.replace(/[^a-z0-9]/gi, '_') : 'Draft'}`;
        link.download = `Halagel_${filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } else {
        alert("Failed to generate PDF");
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
                    Artwork Request Form
                </h1>
             </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8 pb-24 animate-fadeIn">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Date" type="date" value={designData.date} onChange={(e) => handleDesignChange('date', e.target.value)} />
                <FormInput label="Deadline" type="date" value={designData.deadline} onChange={(e) => handleDesignChange('deadline', e.target.value)} />
                <FormInput label="ADR No (Optional)" placeholder="e.g. 123/2023" value={designData.adrNo} onChange={(e) => handleDesignChange('adrNo', e.target.value)} />
            </div>

            {/* Section A */}
            <section>
                <SectionTitle title="A) Requestor Details" color="text-blue-800" borderColor="border-blue-500" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormInput label="From (Name)" value={designData.requestorFrom} onChange={(e) => handleDesignChange('requestorFrom', e.target.value)} />
                    <FormSelect label="Department" options={DEPARTMENTS} value={designData.department} onChange={(e) => handleDesignChange('department', e.target.value)} />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Category</span>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="category" checked={designData.category === 'Halagel'} onChange={() => handleDesignChange('category', 'Halagel')} className="text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">Halagel</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="category" checked={designData.category === 'OEM'} onChange={() => handleDesignChange('category', 'OEM')} className="text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">OEM</span>
                        </label>
                    </div>
                    {designData.category === 'OEM' && (
                        <FormInput label="Specify OEM" className="mt-3" value={designData.oemSpecify} onChange={(e) => handleDesignChange('oemSpecify', e.target.value)} />
                    )}
                </div>
            </section>

            {/* Section B */}
            <section>
                <SectionTitle title="B) Details Requisition" color="text-blue-800" borderColor="border-blue-500" />
                <FormInput label="Product Name" className="mb-4" value={designData.productName} onChange={(e) => handleDesignChange('productName', e.target.value)} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <CheckboxGroup label="Job Request">
                        <label className="flex items-center space-x-2 py-1"><input type="checkbox" checked={designData.jobRequest.newDesign} onChange={(e) => handleDesignNestedChange('jobRequest', 'newDesign', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">New Design</span></label>
                        <label className="flex items-center space-x-2 py-1"><input type="checkbox" checked={designData.jobRequest.amendment} onChange={(e) => handleDesignNestedChange('jobRequest', 'amendment', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Amendment</span></label>
                    </CheckboxGroup>

                    <CheckboxGroup label="Type">
                        <label className="flex items-center space-x-2 py-1"><input type="checkbox" checked={designData.type.designArtwork} onChange={(e) => handleDesignNestedChange('type', 'designArtwork', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Design / Artwork</span></label>
                        <label className="flex items-center space-x-2 py-1"><input type="checkbox" checked={designData.type.sampleLabel} onChange={(e) => handleDesignNestedChange('type', 'sampleLabel', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Sample Label</span></label>
                        <label className="flex items-center space-x-2 py-1"><input type="checkbox" checked={designData.type.mockup} onChange={(e) => handleDesignNestedChange('type', 'mockup', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Mockup</span></label>
                    </CheckboxGroup>
                </div>

                <CheckboxGroup label="Intended For">
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={designData.intendedFor.softgel} onChange={(e) => handleDesignNestedChange('intendedFor', 'softgel', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Softgel</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={designData.intendedFor.toothpaste} onChange={(e) => handleDesignNestedChange('intendedFor', 'toothpaste', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Toothpaste</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={designData.intendedFor.cosmetics} onChange={(e) => handleDesignNestedChange('intendedFor', 'cosmetics', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Cosmetics</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={designData.intendedFor.fnb} onChange={(e) => handleDesignNestedChange('intendedFor', 'fnb', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">F&B</span></label>
                        <div className="col-span-2 mt-1">
                            <label className="flex items-center space-x-2 mb-1"><input type="checkbox" checked={designData.intendedFor.others} onChange={(e) => handleDesignNestedChange('intendedFor', 'others', e.target.checked)} className="rounded text-blue-600" /><span className="text-sm">Others</span></label>
                            {designData.intendedFor.others && <FormInput label="" placeholder="Specify..." value={designData.intendedFor.othersSpecify} onChange={(e) => handleDesignNestedChange('intendedFor', 'othersSpecify', e.target.value)} />}
                        </div>
                    </div>
                </CheckboxGroup>

                <div className="space-y-4 mt-6">
                    <FormInput label="Colour Scheme" textarea value={designData.colourScheme} onChange={(e) => handleDesignChange('colourScheme', e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Type of Material" value={designData.typeOfMaterial} onChange={(e) => handleDesignChange('typeOfMaterial', e.target.value)} />
                        <FormInput label="Dimension" value={designData.dimension} onChange={(e) => handleDesignChange('dimension', e.target.value)} />
                    </div>
                    <FormInput label="Product Concept" textarea value={designData.productConcept} onChange={(e) => handleDesignChange('productConcept', e.target.value)} />
                    <FormInput label="Type of Design" value={designData.typeOfDesign} onChange={(e) => handleDesignChange('typeOfDesign', e.target.value)} />
                    <FormInput label="End User Target" value={designData.endUserTarget} onChange={(e) => handleDesignChange('endUserTarget', e.target.value)} />
                </div>

                <div className="mt-6 space-y-4">
                    <span className="text-sm font-bold text-gray-800 border-b border-gray-200 block pb-2 mb-3">Information Required</span>
                    
                    {/* Barcode */}
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                        <label className="flex items-center space-x-2 mb-2">
                            <input type="checkbox" checked={designData.infoRequired.barcode} onChange={(e) => handleDesignNestedChange('infoRequired', 'barcode', e.target.checked)} className="rounded text-blue-600" />
                            <span className="font-bold text-sm">Barcode</span>
                        </label>
                        {designData.infoRequired.barcode && (
                            <div className="ml-6 space-y-2">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2"><input type="radio" name="barcodeProv" checked={designData.infoRequired.barcodeProvider === 'Halagel'} onChange={() => handleDesignNestedChange('infoRequired', 'barcodeProvider', 'Halagel')} /><span className="text-xs">Halagel</span></label>
                                    <label className="flex items-center gap-2"><input type="radio" name="barcodeProv" checked={designData.infoRequired.barcodeProvider === 'Customer'} onChange={() => handleDesignNestedChange('infoRequired', 'barcodeProvider', 'Customer')} /><span className="text-xs">Customer</span></label>
                                </div>
                                <FormInput label="Name/Code" value={designData.infoRequired.barcodeProviderName} onChange={(e) => handleDesignNestedChange('infoRequired', 'barcodeProviderName', e.target.value)} />
                            </div>
                        )}
                    </div>

                    {/* QR Code */}
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                        <label className="flex items-center space-x-2 mb-2">
                            <input type="checkbox" checked={designData.infoRequired.qrCode} onChange={(e) => handleDesignNestedChange('infoRequired', 'qrCode', e.target.checked)} className="rounded text-blue-600" />
                            <span className="font-bold text-sm">QR Code</span>
                        </label>
                        {designData.infoRequired.qrCode && (
                            <div className="ml-6 space-y-2">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2"><input type="radio" name="qrCodeProv" checked={designData.infoRequired.qrCodeProvider === 'Halagel'} onChange={() => handleDesignNestedChange('infoRequired', 'qrCodeProvider', 'Halagel')} /><span className="text-xs">Halagel</span></label>
                                    <label className="flex items-center gap-2"><input type="radio" name="qrCodeProv" checked={designData.infoRequired.qrCodeProvider === 'Customer'} onChange={() => handleDesignNestedChange('infoRequired', 'qrCodeProvider', 'Customer')} /><span className="text-xs">Customer</span></label>
                                </div>
                                <FormInput label="Name/URL" value={designData.infoRequired.qrCodeProviderName} onChange={(e) => handleDesignNestedChange('infoRequired', 'qrCodeProviderName', e.target.value)} />
                            </div>
                        )}
                    </div>

                    {/* Info Others */}
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                        <label className="flex items-center space-x-2 mb-2">
                            <input type="checkbox" checked={designData.infoRequired.others} onChange={(e) => handleDesignNestedChange('infoRequired', 'others', e.target.checked)} className="rounded text-blue-600" />
                            <span className="font-bold text-sm">Others</span>
                        </label>
                        {designData.infoRequired.others && (
                            <FormInput label="Specify" className="ml-6" value={designData.infoRequired.othersSpecify} onChange={(e) => handleDesignNestedChange('infoRequired', 'othersSpecify', e.target.value)} />
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <span className="text-sm font-bold text-gray-800 border-b border-gray-200 block pb-2 mb-3">Certification Logo</span>
                    <div className="grid grid-cols-2 gap-3">
                        {['jakim', 'mesti', 'malaysiaBrand', 'sahabatZakat', 'goGreen'].map((key) => (
                            <label key={key} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={(designData.certificationLogo as any)[key]} onChange={(e) => handleDesignNestedChange('certificationLogo', key, e.target.checked)} className="rounded text-blue-600" />
                                <span className="text-xs uppercase font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </label>
                        ))}
                        <div className="col-span-2">
                            <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer mb-2">
                                <input type="checkbox" checked={designData.certificationLogo.others} onChange={(e) => handleDesignNestedChange('certificationLogo', 'others', e.target.checked)} className="rounded text-blue-600" />
                                <span className="text-xs uppercase font-semibold">Others</span>
                            </label>
                            {designData.certificationLogo.others && (
                                <FormInput label="Specify Logo" value={designData.certificationLogo.othersSpecify} onChange={(e) => handleDesignNestedChange('certificationLogo', 'othersSpecify', e.target.value)} />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section C */}
            <section>
                <SectionTitle title="C) Declaration (Requested By)" color="text-blue-800" borderColor="border-blue-500" />
                <div className="grid grid-cols-1 gap-4">
                    <FormInput label="Name" value={designData.requestedByName} onChange={(e) => handleDesignChange('requestedByName', e.target.value)} />
                    <FormInput label="Position" value={designData.requestedByPosition} onChange={(e) => handleDesignChange('requestedByPosition', e.target.value)} />
                </div>
            </section>
        </div>
      </div>

         {/* Download Fab */}
         <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
            <button 
              onClick={generatePdf}
              disabled={isGenerating}
              className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
              title="Download PDF"
            >
               {isGenerating ? (
                   <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                   <Download size={28} />
               )}
            </button>
         </div>

         {/* Off-screen but layout-stable container for PDF Generation */}
         <div className="fixed left-0 top-0 pointer-events-none opacity-0 z-[-50]">
            <div ref={printRef} id="print-container-design">
               <PdfTemplate data={designData} />
            </div>
         </div>
    </div>
  );
};
