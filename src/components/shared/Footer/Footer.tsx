import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex items-center gap-2 align-center justify-center bg-white py-[10px] border-t-[0.5px] border-gray-200">
      <p className="text-xs text-gray-400">
        Desarrollado por {"\n"}
        <a href="https://derechoalderecho.co/" target="_blank" className="font-bold hover:underline">Derecho al Derecho Colombia S.A.S</a>
        {"\n"} y financiado por {"\n"}
        <a href="https://www.swisscontact.org/es/" target="_blank" className="font-bold hover:underline">SwissContact</a>
      </p>
      <Image src="/logo_dd.png" alt="Logo" width={45} height={19.7} />
      <div className="border-gray-200 border-r-[0.5px] border-r-gray-200 h-[19.7px]" />
      <Image src="/swisscontact_Logo.png" alt="Logo" width={54} height={17} />
    </footer>
  );
}
