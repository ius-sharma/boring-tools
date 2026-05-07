"use client";
import { useState } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  const generateQR = async () => {
    if (!text.trim()) {
      setError("Please enter text or URL");
      setQr("");
      return;
    }

    try {
      const url = await QRCode.toDataURL(text.trim(), {
        width: 320,
        margin: 2,
      });
      setQr(url);
      setError("");
    } catch (err) {
      console.log(err);
      setError("Unable to generate QR right now");
      setQr("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">QR Generator</h1>
          <p className="text-slate-500 text-base">Generate a QR code from text or links instantly</p>
        </div>

        <input
          type="text"
          placeholder="Enter text or URL"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
          }}
          className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-base text-slate-900 placeholder:text-slate-300"
        />

        <button
          onClick={generateQR}
          className="w-full border border-slate-900 text-slate-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          Generate QR
        </button>

        {error && <p className="text-red-600 text-sm -mt-2">{error}</p>}

        {qr ? (
          <div className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center gap-4">
            <img src={qr} alt="Generated QR Code" className="w-48 h-48 rounded-lg bg-white p-2 border border-slate-200" />

            <a
              href={qr}
              download="qrcode.png"
              className="w-full border border-slate-900 text-slate-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              Download QR
            </a>
          </div>
        ) : (
          <div className="w-full p-4 border border-dashed border-slate-100 rounded-xl bg-slate-50 text-slate-300 text-base min-h-[120px] flex items-center justify-center select-none">
            Generated QR code will appear here
          </div>
        )}
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}


