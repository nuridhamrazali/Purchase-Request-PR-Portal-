import React, { forwardRef } from 'react';
import { PurchaseRequisitionData } from '../type';
import { LOGO_BASE64 } from '../constants';

interface PurchasePdfTemplateProps {
  data: PurchaseRequisitionData;
}

const formatCurrency = (val: number | undefined | null | string) => {
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const PurchasePdfTemplate = forwardRef<HTMLDivElement, PurchasePdfTemplateProps>(({ data }, ref) => {
  
  const totalCost = data.items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const c = Number(item.costPerUnit) || 0;
      return sum + (q * c);
  }, 0);

  const formatPdfDate = (dateString: string) => {
      if (!dateString) return '';
      const parts = dateString.split('-');
      if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateString.replace(/-/g, '/');
  };

  const SignatureField = ({ label, value }: { label: string, value: string }) => (
    <div className="grid grid-cols-[45px_10px_1fr] mt-2 items-start">
        <span className="font-bold">{label}</span>
        <span className="font-bold text-center">:</span>
        <div className="uppercase font-normal break-words leading-tight whitespace-pre-wrap">{value}</div>
    </div>
  );

  return (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-black box-border relative p-[10mm] select-none text-[11px]" style={{ fontFamily: 'Arial, sans-serif' }}>
       
       {/* Header */}
       <div className="relative flex flex-col items-center mb-6 text-black mt-2">
            <div className="flex items-center justify-center mb-2">
                <img src={LOGO_BASE64} className="h-[60px] w-auto object-contain mr-6" alt="Logo" />
                <h1 className="text-[28px] font-bold uppercase tracking-wide">HALAGEL GROUP OF COMPANIES</h1>
            </div>
            <div className="flex flex-col items-center mb-2">
                <h2 className="text-[20px] font-bold uppercase leading-tight mt-1">PAYMENT/PURCHASE REQUISITION</h2>
                <h3 className="text-[20px] font-bold uppercase leading-tight mt-1">{data.companyName}</h3>
            </div>
       </div>

       {/* Top Row: Date & PR No */}
       <div className="flex justify-between items-end mb-4 px-12 text-black">
            <div className="flex gap-4 items-end">
                <span className="font-bold text-[11px]">DATE</span>
                <span className="font-bold text-[11px]">:</span>
                <span className="font-bold text-[11px] pb-[1px]">{formatPdfDate(data.date)}</span>
            </div>
            <div className="flex gap-4 items-end pr-4">
                <span className="font-bold text-[11px]">PURCHASE REQUISITION NO</span>
                <span className="font-bold text-[11px]">:</span>
                <div className="font-bold text-[11px] pb-[1px] text-center">{data.prNo}</div>
            </div>
       </div>

       {/* Two Boxes Row */}
       <div className="flex gap-4 mb-3 text-black">
            {/* Box 1: Requester Info */}
            <div className="w-[55%] border border-black rounded-[24px] p-4 shadow-none min-h-[140px]">
                <div className="grid grid-cols-[130px_10px_1fr] gap-y-3 pt-1 px-1">
                    <span className="text-[11px]">Requester Name</span>
                    <span className="text-[11px]">:</span>
                    <span className="uppercase text-[11px] break-words">{data.requesterName}</span>

                    <span className="text-[11px]">Department</span>
                    <span className="text-[11px]">:</span>
                    <span className="uppercase text-[11px] break-words">{data.department}</span>

                    <span className="text-[11px] leading-snug">Delivery<br/>Requirement</span>
                    <span className="text-[11px] mt-2">:</span>
                    <span className="uppercase text-[11px] mt-2 break-words">{data.deliveryRequirement}</span>

                    <span className="text-[11px]">Account code</span>
                    <span className="text-[11px]">:</span>
                    <span className="uppercase text-[11px] break-all">{data.accountCode}</span>
                </div>
            </div>

            {/* Box 2: Purpose */}
            <div className="w-[45%] border border-black rounded-[24px] p-4 shadow-none min-h-[140px] flex flex-col">
                <div className="text-[11px] mb-2 px-1">Purpose/Justification for Purchasing :</div>
                <div className="text-[11px] leading-relaxed flex-1 px-1 mt-1 break-words">{data.purpose}</div>
            </div>
       </div>

       {/* Items Table */}
       <div className="mb-4">
            <table className="w-full border-t border-l border-black border-separate border-spacing-0 table-fixed text-black text-[11px]">
                <thead>
                    <tr className="bg-transparent text-black">
                        <th className="border-b border-r border-black p-2 w-10 text-center font-normal">NO</th>
                        <th className="border-b border-r border-black p-2 w-24 text-center font-normal leading-tight">ITEM<br/>CODE</th>
                        <th className="border-b border-r border-black p-2 text-center font-normal">DESCRIPTION</th>
                        <th className="border-b border-r border-black p-2 w-16 text-center font-normal">OUM</th>
                        <th className="border-b border-r border-black p-2 w-[70px] text-center font-normal">QUANTITY</th>
                        <th className="border-b border-r border-black p-2 w-[80px] text-center font-normal leading-tight">COST<br/>PER UNIT</th>
                        <th className="border-b border-r border-black p-2 w-24 text-center font-normal leading-tight">TOTAL COST</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.slice(0, 10).map((item, index) => (
                        <tr key={item.id || index} className="h-[28px]">
                            <td className="border-b border-r border-black p-2 text-center align-top">{index + 1}.</td>
                            <td className="border-b border-r border-black p-2 text-center align-top break-all">{item.itemCode || '-'}</td>
                            <td className="border-b border-r border-black p-2 align-top break-words whitespace-pre-wrap leading-tight">{item.description}</td>
                            <td className="border-b border-r border-black p-2 text-center uppercase align-top break-words">{item.uom}</td>
                            <td className="border-b border-r border-black p-2 text-center align-top">{item.quantity}</td>
                            <td className="border-b border-r border-black p-2 text-center align-top">{item.costPerUnit ? formatCurrency(item.costPerUnit) : ''}</td>
                            <td className="border-b border-r border-black p-2 text-center align-top">{formatCurrency(Number(item.quantity || 0) * Number(item.costPerUnit || 0))}</td>
                        </tr>
                    ))}
                    {/* Fill empty rows up to 10 */}
                    {Array.from({ length: Math.max(0, 10 - data.items.length) }).map((_, i) => (
                         <tr key={`empty-${i}`} className="h-[28px]">
                            <td className="border-b border-r border-black p-2 text-center">{data.items.length + i + 1}.</td>
                            <td className="border-b border-r border-black p-2 text-center"></td>
                            <td className="border-b border-r border-black p-2"></td>
                            <td className="border-b border-r border-black p-2"></td>
                            <td className="border-b border-r border-black p-2"></td>
                            <td className="border-b border-r border-black p-2"></td>
                            <td className="border-b border-r border-black p-2"></td>
                         </tr>
                    ))}
                    <tr className="bg-transparent">
                        <td colSpan={6} className="border-b border-r border-black p-2 pr-4 text-right font-normal text-[11px]">TOTAL (RM)</td>
                        <td className="border-b border-r border-black p-2 text-center text-[11px] font-normal">{formatCurrency(totalCost)}</td>
                    </tr>
                </tbody>
            </table>
       </div>

       {/* Supplier Info */}
       <div className="flex gap-4 mb-4 mt-8 px-10 text-black text-[11px]">
            <div className="w-1/2 flex flex-col pr-4">
                <div className="font-bold mb-3">RECOMMENDED SUPPLIER</div>
                <div className="uppercase text-[11px] break-words whitespace-pre-wrap leading-relaxed">{data.recommendedSupplier}</div>
            </div>
            <div className="w-1/2 pl-6">
                <div className="grid grid-cols-[110px_10px_1fr] gap-y-4">
                    <span className="font-bold">Contact Person</span>
                    <span className="font-bold">:</span>
                    <span className="text-[11px] break-words">{data.contactPerson || '-'}</span>

                    <span className="font-bold">Tel No</span>
                    <span className="font-bold">:</span>
                    <span className="text-[11px] break-words">{data.telNo || '-'}</span>

                    <span className="font-bold">Email</span>
                    <span className="font-bold">:</span>
                    <span className="text-[11px] break-words">{data.email || '-'}</span>

                    <span className="font-bold">Term</span>
                    <span className="font-bold">:</span>
                    <span className="text-[11px] break-words">{data.term || '-'}</span>
                </div>
            </div>
       </div>

       {/* Signatures Footer */}
       <div className="border border-black flex min-h-[140px] text-black text-[11px] mt-6">
            {/* Requested by */}
            <div className="flex-1 border-r border-black p-3 flex flex-col relative w-1/4">
                <div className="font-bold mb-2">Requested by:</div>
                <div className="flex-1 flex items-center justify-center">
                    {data.requestedBy.signature && (
                        <div className="text-[28px] text-black font-bold" style={{ fontFamily: '"Great Vibes", "Kunstler Script", cursive' }}>
                            {data.requestedBy.signature}
                        </div>
                    )}
                </div>
                <div className="flex flex-col mt-auto pt-2 pb-2">
                    <SignatureField label="NAME" value={data.requestedBy.name} />
                    <SignatureField label="DATE" value={formatPdfDate(data.requestedBy.date)} />
                </div>
            </div>

            {/* Approved by */}
            <div className="flex-1 border-r border-black p-3 flex flex-col relative w-1/4">
                <div className="font-bold mb-2">Approve by :</div>
                <div className="flex-1 flex items-center justify-center"></div>
                <div className="flex flex-col mt-auto pt-2 pb-2">
                    <SignatureField label="NAME" value={data.approvedBy.name} />
                    <SignatureField label="DATE" value={formatPdfDate(data.approvedBy.date)} />
                </div>
            </div>

            {/* Acknowledged Admin */}
            <div className="flex-1 border-r border-black p-3 flex flex-col relative w-1/4">
                <div className="font-bold text-center leading-snug mb-2">Acknowledged by<br/>(Admin/Engineering)</div>
                <div className="flex-1 flex items-center justify-center"></div>
                <div className="flex flex-col mt-auto pt-2 pb-2">
                    <SignatureField label="NAME" value={data.acknowledgedAdmin.name} />
                    <SignatureField label="DATE" value={formatPdfDate(data.acknowledgedAdmin.date)} />
                </div>
            </div>

            {/* Acknowledged Purchasing */}
            <div className="flex-1 p-3 flex flex-col relative w-1/4">
                <div className="font-bold text-center leading-snug mb-2">Acknowledged by<br/>(Purchasing/Account)</div>
                <div className="flex-1 flex items-center justify-center"></div>
                <div className="flex flex-col mt-auto pt-2 pb-2">
                    <SignatureField label="NAME" value={data.acknowledgedPurchasing.name} />
                    <SignatureField label="DATE" value={formatPdfDate(data.acknowledgedPurchasing.date)} />
                </div>
            </div>
       </div>

       {/* Footer Text */}
       <div className="mt-8 text-[11px] font-bold text-black flex justify-between items-end pl-6">
            <div className="leading-tight">
                <p>FM-PC-01 Rev:7, 01st Ogos 2021</p>
                <p>Ref : SP-PC-01,DCM</p>
                <p>HALAGEL GROUP OF COMPANIES</p>
            </div>
       </div>
    </div>
  );
});

PurchasePdfTemplate.displayName = "PurchasePdfTemplate";
