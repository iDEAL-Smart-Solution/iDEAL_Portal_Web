import React from "react"
import { SignatureUploader } from "./SignatureUploader"

export function AdminPrincipalSignature() {
  return (
    <div>
      <h3 className="mb-2 font-medium">Principal Signature</h3>
      <SignatureUploader isPrincipal={true} onUploaded={(url) => alert("Uploaded: " + url)} />
    </div>
  )
}
