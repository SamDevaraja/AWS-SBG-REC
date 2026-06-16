"use client";

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { AWSRegionData } from '@/lib/api';
import FlagImage from '../Layout/FlagImage';

interface RegionTableProps {
  regions: AWSRegionData[];
  onEditClick: (region: AWSRegionData) => void;
  onDeleteClick: (region: AWSRegionData) => void;
}

export default function RegionTable({ regions, onEditClick, onDeleteClick }: RegionTableProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50">
              <th className="py-6 px-8">Flag</th>
              <th className="py-6 px-6">Name</th>
              <th className="py-6 px-6">AWS Region Code</th>
              <th className="py-6 px-6">Category</th>
              <th className="py-6 px-6">Coordinates</th>
              <th className="py-6 px-6">Order</th>
              <th className="py-6 px-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {regions.map((region) => (
              <tr key={region.dbId} className="hover:bg-slate-50/50 transition-colors text-[13px] font-semibold text-slate-600">
                <td className="py-6 px-8 select-none">
                  <div className="w-10 h-7 flex items-center justify-center bg-slate-50 border border-slate-200/50 rounded overflow-hidden">
                    <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-8 h-5.5 object-contain" />
                  </div>
                </td>
                <td className="py-6 px-6 font-bold text-slate-900">{region.name}</td>
                <td className="py-6 px-6">
                  <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-bold border border-slate-200/40">
                    {region.id}
                  </span>
                </td>
                <td className="py-6 px-6 font-extrabold text-[#0073BB] uppercase text-[11px] tracking-wider">
                  {region.category || "Unassigned"}
                </td>
                <td className="py-6 px-6 font-mono text-xs text-slate-400">
                  {region.lat.toFixed(4)}, {region.lng.toFixed(4)}
                </td>
                <td className="py-6 px-6 font-mono text-xs font-bold text-slate-800">
                  {region.displayOrder}
                </td>
                <td className="py-6 px-8 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditClick(region)}
                      title="Edit specifications"
                      className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition-all hover:shadow-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(region)}
                      title="Decommission node"
                      className="p-2.5 rounded-xl border border-red-50 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all hover:shadow-sm"
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
