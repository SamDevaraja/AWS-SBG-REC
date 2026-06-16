"use client";
import React from 'react';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { AWSRegionData } from '@/lib/api';
import FlagImage from '../Layout/FlagImage';

interface RegionTableProps {
  regions: AWSRegionData[];
  onEditClick: (region: AWSRegionData) => void;
  onDeleteClick: (region: AWSRegionData) => void;
}

export default function RegionTable({ regions, onEditClick, onDeleteClick }: RegionTableProps) {
  // Helper to dynamically color category badges
  const getCategoryStyle = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes('us') || cat.includes('north america')) {
      return 'bg-blue-50/70 text-blue-700 border-blue-100/60';
    }
    if (cat.includes('europe')) {
      return 'bg-emerald-50/70 text-emerald-700 border-emerald-100/60';
    }
    if (cat.includes('india') || cat.includes('asia') || cat.includes('pacific') || cat.includes('japan') || cat.includes('korea') || cat.includes('singapore')) {
      return 'bg-amber-50/70 text-amber-700 border-amber-100/60';
    }
    if (cat.includes('south america')) {
      return 'bg-teal-50/70 text-teal-700 border-teal-100/60';
    }
    if (cat.includes('middle east')) {
      return 'bg-purple-50/70 text-purple-700 border-purple-100/60';
    }
    if (cat.includes('africa')) {
      return 'bg-orange-50/70 text-orange-700 border-orange-100/60';
    }
    if (cat.includes('australia')) {
      return 'bg-cyan-50/70 text-cyan-700 border-cyan-100/60';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200/60';
  };

  return (
    <div className="bg-white border border-slate-100/80 rounded-[2.5rem] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] bg-slate-50/80 backdrop-blur-sm select-none">
              <th className="py-3.5 px-8">Flag</th>
              <th className="py-3.5 px-6">Name</th>
              <th className="py-3.5 px-6">AWS Region Code</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Coordinates</th>
              <th className="py-3.5 px-6 text-center">Order</th>
              <th className="py-3.5 px-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {regions.map((region) => (
              <tr key={region.dbId} className="hover:bg-slate-50/30 transition-all duration-200 text-[13px] font-semibold text-slate-600 border-b border-slate-50/60 last:border-b-0">
                <td className="py-3 px-8 select-none">
                  <div className="w-12 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm hover:scale-105 transition-transform duration-200">
                    <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-9 h-6 object-contain" />
                  </div>
                </td>
                <td className="py-3 px-6">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-900 text-[14px] tracking-tight">{region.name}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      {region.primaryLocation || "AWS Infrastructure Node"} 
                      {region.availabilityZones ? `• ${region.availabilityZones} AZs` : ''}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <span className="inline-flex items-center font-mono text-[11px] bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md font-bold tracking-tight shadow-sm select-all">
                    {region.id}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <span className={`inline-flex items-center px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider ${getCategoryStyle(region.category)}`}>
                    {region.category || "Unassigned"}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 w-fit">
                    <MapPin size={11} className="text-[#0073BB]" />
                    <span>{region.lat.toFixed(4)}, {region.lng.toFixed(4)}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="mx-auto flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-mono font-black text-slate-600 shadow-inner">
                    {region.displayOrder}
                  </div>
                </td>
                <td className="py-3 px-8 text-right">
                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => onEditClick(region)}
                      title="Edit specifications"
                      className="p-3 rounded-xl border border-slate-200/60 bg-white text-slate-500 hover:text-[#0073BB] hover:bg-[#0073BB]/5 hover:border-[#0073BB]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(region)}
                      title="Decommission node"
                      className="p-3 rounded-xl border border-red-100 bg-red-50/20 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
