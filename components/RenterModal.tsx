"use client";

import { Renter } from "@/lib/mockData";
import { getLocalizedRenterName, getLocalizedRoomName, Language } from "@/lib/localization";

type Props = {
  renter: Renter | null;
  roomName: string;
  roomId: string;
  language: Language;
  onClose: () => void;
};

export default function RenterModal({ renter, roomName, roomId, language, onClose }: Props) {
  if (!renter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-w-md w-full bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">
            {getLocalizedRoomName(roomId, language)}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Renter Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Renter Name
            </label>
            <div className="text-lg font-medium text-zinc-900">
              {getLocalizedRenterName(renter.id, language)}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Phone Number
            </label>
            <div className="text-lg text-zinc-900">
              {renter.phone}
            </div>
          </div>

          {/* Move-in Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Move-in Date
            </label>
            <div className="text-lg text-zinc-900">
              {require("@/lib/mockData").formatEthiopianDate(renter.moveIn, language)}
            </div>
          </div>

          {/* Move-out Date (if exists) */}
          {renter.moveOut && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Move-out Date
              </label>
              <div className="text-lg text-zinc-900">
                {require("@/lib/mockData").formatEthiopianDate(renter.moveOut, language)}
              </div>
            </div>
          )}

          {/* Room ID */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Room ID
            </label>
            <div className="text-lg text-zinc-900">
              {roomId}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-zinc-200 bg-zinc-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
          >
            Close
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit Renter
          </button>
        </div>
      </div>
    </div>
  );
}
