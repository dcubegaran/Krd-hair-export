import * as React from "react"

export function Toaster() {
  return (
    <div id="toaster" className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {/* Toast notifications will be rendered here */}
    </div>
  )
}