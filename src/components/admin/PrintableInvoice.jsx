import React from 'react';

const PrintableInvoice = ({ order }) => {
  if (!order) return null;

  return (
    <div id="printable-invoice" className="hidden print:block bg-white text-black p-0 m-0 w-[210mm] min-h-[297mm] font-['Inter'] relative overflow-hidden">
      {/* Decorative Gold Header */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-[#ecc244] via-[#ecc244] to-black transform skew-x-[-45deg] -translate-y-16 translate-x-16 z-0"></div>
      <div className="absolute top-0 right-0 w-48 h-24 bg-gradient-to-bl from-black to-gray-800 transform skew-x-[-45deg] -translate-y-8 translate-x-24 z-0 opacity-80"></div>

      <div className="relative z-10 px-12 pt-12">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 rounded-full border-2 border-[#ecc244] shadow-md" />
            <div>
              <h1 className="text-2xl font-black text-[#050505] tracking-tight leading-none uppercase">Asmita Gruh Udhyog</h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1">ESTABLISHED SINCE 1995</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-6xl font-black text-[#050505] tracking-tighter opacity-10">INVOICE</h2>
            <div className="mt-[-2rem] mr-2">
               <h2 className="text-4xl font-black text-[#050505] tracking-tight">INVOICE</h2>
            </div>
          </div>
        </div>

        <hr className="border-gray-800 mb-8" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">From : Asmita Gruh Udhyog</p>
            <div className="text-sm font-medium leading-relaxed text-gray-800">
              Goverdhan Park, GIDC Industrial Area,<br />
              Manjalpur, Vadodara,<br />
              Gujarat 390011
            </div>
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <p className="text-sm"><span className="font-bold text-gray-500 uppercase text-[10px] mr-2">Invoice No :</span> <span className="font-bold">{order.orderId || order.id.slice(0, 8)}</span></p>
              <p className="text-sm"><span className="font-bold text-gray-500 uppercase text-[10px] mr-2">Invoice Date :</span> <span className="font-bold">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</span></p>
              <p className="text-sm"><span className="font-bold text-gray-500 uppercase text-[10px] mr-2">Order Status :</span> <span className="font-bold text-[#ecc244]">{order.status || 'Pending'}</span></p>
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="bg-gray-50 p-6 rounded-2xl mb-12 border border-gray-100">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Bill To :</p>
           <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-black">{order.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{order.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 leading-relaxed">{order.address}</p>
              </div>
           </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-4 px-2 font-black text-[11px] uppercase tracking-widest">Name</th>
              <th className="text-center py-4 px-2 font-black text-[11px] uppercase tracking-widest">Qty</th>
              <th className="text-right py-4 px-2 font-black text-[11px] uppercase tracking-widest">Price</th>
              <th className="text-right py-4 px-2 font-black text-[11px] uppercase tracking-widest">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-6 px-2">
                <p className="font-bold text-gray-900">{order.product}</p>
                <p className="text-[10px] text-gray-500 uppercase mt-1">Payment: {order.paymentMethod || 'COD'}</p>
              </td>
              <td className="py-6 px-2 text-center font-bold">1</td>
              <td className="py-6 px-2 text-right font-bold">₹{order.amount}</td>
              <td className="py-6 px-2 text-right font-black text-lg">₹{order.amount}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end mb-24">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Sub-total :</span>
              <span className="font-bold">₹{order.amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Tax (0%) :</span>
              <span className="font-bold">₹0</span>
            </div>
            <div className="flex justify-between pt-3 border-t-2 border-black">
              <span className="text-xl font-black uppercase tracking-tighter">Total :</span>
              <span className="text-2xl font-black text-[#ecc244]">₹{order.amount}</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-6">
            <h3 className="text-3xl font-black text-[#050505] tracking-tighter">THANK YOU!</h3>
            <div className="flex gap-12 text-[11px] font-bold text-gray-500">
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ecc244]/10 flex items-center justify-center text-[#ecc244]">☎</span>
                +91 9924123860
              </p>
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ecc244]/10 flex items-center justify-center text-[#ecc244]">✉</span>
                Asmitagruhudhyog@gmail.com
              </p>
            </div>
          </div>
          <div className="text-center w-48">
            <div className="border-b border-gray-400 mb-2"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Gold Shape */}
      <div className="absolute bottom-0 left-0 w-96 h-48 bg-gradient-to-tr from-[#ecc244] via-[#ecc244] to-black transform skew-x-[-45deg] translate-y-24 -translate-x-24 z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-32 bg-gradient-to-tr from-black to-gray-800 transform skew-x-[-45deg] translate-y-16 -translate-x-16 z-0 opacity-80"></div>
    </div>
  );
};

export default PrintableInvoice;
