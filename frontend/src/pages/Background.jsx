import React, { useState, useCallback } from "react";

export function Background({ children }) {
  

  return (
    <div
      className="relative min-h-screen overflow-auto bg-[#121826] text-white flex items-center justify-center"
    >
      

      <div className="relative h-full w-full z-200 opacity-75">
        {children}
      </div>
    </div>
  );
}
