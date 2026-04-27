"use client";
import { useState } from "react";
import { marked } from "marked";

export default function MarkdownPreviewer() {
  const [text, setText] = useState(`# Hello Markdown

## Subheading

- Item 1
- Item 2

**Bold text**
`);

  const previewHtml = marked.parse(text, { breaks: true });

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-neutral-200 flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-1">Markdown Previewer</h1>
          <p className="text-neutral-500 text-base">Write Markdown and preview formatted content instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-700">Editor</h2>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[380px] sm:h-[460px] p-4 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition resize-none text-base text-black placeholder:text-neutral-300"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-700">Preview</h2>

            <div
              className="w-full h-[380px] sm:h-[460px] overflow-auto p-4 border border-neutral-200 rounded-xl bg-neutral-50 text-black prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: previewHtml,
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}