import React from 'react';

const PrintableInvoice = ({ order }) => {
  if (!order) return null;

  return (
    <div id="printable-invoice" className="hidden print:block bg-white text-black p-0 m-0 w-[210mm] h-[297mm] font-['Outfit'] relative overflow-hidden">
      {/* --- TOP RIGHT DECORATION --- */}
      <div className="absolute top-0 right-0 w-[40%] h-40 z-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <path d="M 0 0 L 100 0 L 100 100 Z" fill="#2a2a2a" />
          <path d="M 20 0 L 100 0 L 100 80 Z" fill="#ecc244" />
        </svg>
      </div>

      <div className="relative z-10 px-16 pt-12">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-24 h-24 rounded-full border-2 border-black" />
            <h1 className="text-3xl font-black text-[#050505] tracking-tight uppercase">Asmita Gruh Udhyog</h1>
          </div>
          <div className="text-right">
            <h2 className="text-6xl font-black text-black tracking-widest">INVOICE</h2>
          </div>
        </div>

        <div className="border-t-2 border-gray-400 mb-10"></div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          <div className="space-y-4">
            <p className="text-lg font-bold text-gray-700">FROM : ASMITA GRUH UDHYOG</p>
            <div className="text-lg text-gray-600 font-medium leading-tight">
              Goverdhan Park, GIDC Industrial Area,<br />
              Manjalpur, Vadodara, Gujarat 390011
            </div>
          </div>
          <div className="text-right space-y-2 pt-12">
            <p className="text-xl font-medium text-gray-700">Invoice No : <span className="font-bold text-black">{order.orderId || order.id.slice(0, 8)}</span></p>
            <p className="text-xl font-medium text-gray-700">Invoice Date : <span className="font-bold text-black">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</span></p>
          </div>
        </div>

        <div className="mb-8">
            <p className="text-lg font-bold text-gray-700 mb-2">Phone No : <span className="font-medium text-gray-600">{order.phone}</span></p>
        </div>

        {/* Table Section */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-4 border-black">
              <th className="text-left py-4 px-2 text-xl font-black uppercase">Name</th>
              <th className="text-center py-4 px-2 text-xl font-black uppercase">Qty</th>
              <th className="text-center py-4 px-2 text-xl font-black uppercase">Price</th>
              <th className="text-right py-4 px-2 text-xl font-black uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b-2 border-gray-200">
              <td className="py-8 px-2 text-xl font-bold text-gray-800">{order.product}</td>
              <td className="py-8 px-2 text-center text-xl font-bold text-gray-800">1</td>
              <td className="py-8 px-2 text-center text-xl font-bold text-gray-800">₹{order.amount}</td>
              <td className="py-8 px-2 text-right text-xl font-bold text-gray-800">₹{order.amount}</td>
            </tr>
            {/* Empty space to match design */}
            <tr className="h-40"><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>

        <div className="border-t-2 border-gray-400 mb-8"></div>

        {/* Totals Section */}
        <div className="flex justify-end mb-32">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-xl font-bold text-gray-600">
              <span>Sub-total :</span>
              <span>₹{order.amount}</span>
            </div>
            <div className="border-t-2 border-gray-400 py-2"></div>
            <div className="flex justify-between text-xl font-bold text-gray-600">
              <span>Tax :</span>
              <span>-</span>
            </div>
            <div className="border-t-2 border-gray-400 py-2"></div>
            <div className="flex justify-between items-center bg-gray-50 p-2">
              <span className="text-3xl font-black uppercase">Total :</span>
              <span className="text-3xl font-black text-black">₹{order.amount}</span>
            </div>
            <div className="border-t-2 border-gray-400 py-2"></div>
          </div>
        </div>

        {/* Thank You & Signature */}
        <div className="flex flex-col items-end mb-20 pr-10">
          <h3 className="text-4xl font-black text-black tracking-tighter mb-10">THANK YOU!</h3>
          <div className="w-64 border-t-2 border-gray-400 pt-2 text-center">
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
          </div>
        </div>
      </div>

      {/* --- BOTTOM LEFT DECORATION --- */}
      <div className="absolute bottom-0 left-0 w-[40%] h-48 z-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <path d="M 0 0 L 0 100 L 100 100 Z" fill="#2a2a2a" />
          <path d="M 0 20 L 0 100 L 80 100 Z" fill="#ecc244" />
        </svg>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 left-0 w-full px-16 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-lg font-bold text-black">
           <span>+91 9924123860</span>
        </div>
        <div className="text-lg font-bold text-black">
          Asmitagruhudhyog@gmail.com
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;
