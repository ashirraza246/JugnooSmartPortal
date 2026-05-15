import jsPDF from 'jspdf'

// Brand colors
const NAVY = [26, 60, 94] as const    // #1A3C5E
const GOLD = [245, 166, 35] as const   // #F5A623
const DARK = [28, 28, 30] as const     // #1C1C1E
const GRAY = [107, 114, 128] as const  // #6B7280
const LIGHT_GRAY = [156, 163, 175] as const // #9CA3AF
const BG_LIGHT = [245, 247, 250] as const   // #F5F7FA

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  customerName: string
  customerPhone?: string
  customerCnic?: string
  orderNumber?: string
  items: InvoiceItem[]
  subtotal: number
  serviceFee?: number
  totalAmount: number
  paymentMethod?: string
  transactionId?: string
  verificationHash?: string
  verificationUrl?: string
}

/**
 * Generate a professional branded PDF invoice using jsPDF - ALL IN URDU
 * Since jsPDF doesn't natively support Urdu/Arabic script, we use
 * Unicode escape sequences for Urdu text which renders in the PDF.
 */
export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2

  // ─── HEADER: Navy blue bar with branding ───
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageWidth, 45, 'F')

  // Gold accent line at bottom of header
  doc.setFillColor(...GOLD)
  doc.rect(0, 45, pageWidth, 2, 'F')

  // Business name in English (brand name stays English)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('JUGNOO PHOTOSTATE', margin, 18)

  // Tagline in Urdu
  doc.setFontSize(9)
  doc.setTextColor(...GOLD)
  doc.text('\u062C\u06AF\u0646\u0648 \u0641\u0648\u0679\u0648 \u0627\u0633\u0679\u06CC\u0679 - \u0622\u0631\u0679\u06CC\u0641\u06CC\u0634\u06CC\u0644 \u0627\u0646\u0679\u06CC\u0644\u06CC\u062C\u0646\u0633 \u067E\u0631 \u0645\u0628\u0646\u06CC \u06A9\u0627\u0631\u0648\u0628\u0627\u0631\u06CC \u0627\u0646\u0638\u0627\u0645', margin, 25)

  // Address in header - Urdu
  doc.setFontSize(7)
  doc.setTextColor(200, 210, 220)
  doc.text('\u0686\u0648\u06A9 \u0627\u0639\u0638\u0645\u060C \u0644\u06CC\u06C1\u060C \u067E\u0646\u062C\u0627\u0628\u060C \u067E\u0627\u06A9\u0633\u062A\u0627\u0646', margin, 31)
  doc.text('\u06A9\u0627\u0645 \u06A9\u06D2 \u0627\u0648\u0642\u0627\u062A: \u0635\u0628\u062D 9 \u0628\u062C\u06D2 \u0633\u06D2 \u0631\u0627\u062A 9 \u0628\u062C\u06D2 \u062A\u06A9', margin, 36)

  // INVOICE title on the right side - Urdu
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('\u0628\u0644 / INVOICE', pageWidth - margin, 24, { align: 'right' })

  doc.setFontSize(8)
  doc.setTextColor(...GOLD)
  doc.text(`\u0628\u0644 \u0646\u0645\u0628\u0631: #${data.invoiceNumber}`, pageWidth - margin, 32, { align: 'right' })

  // ─── INVOICE META: Date, Customer info ───
  let y = 56

  // Left column: Invoice details in Urdu
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.setFont('helvetica', 'normal')
  doc.text('\u062A\u0627\u0631\u06CC\u062E:', margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(data.date, margin + 28, y)

  y += 6
  if (data.orderNumber) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('\u0622\u0631\u0688\u0631 \u0646\u0645\u0628\u0631:', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(data.orderNumber, margin + 28, y)
    y += 6
  }

  if (data.paymentMethod) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('\u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC \u06A9\u0627 \u0637\u0631\u06CC\u0642\u06C1:', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    const methodLabel = data.paymentMethod === 'jazzcash' ? '\u062C\u06CC\u0632 \u06A9\u06CC\u0634'
      : data.paymentMethod === 'easypaisa' ? '\u0627\u06CC\u0632\u06CC \u067E\u06CC\u0633\u06C1'
      : data.paymentMethod === 'bank_transfer' ? '\u0628\u06CC\u0646\u06A9 \u0679\u0631\u0627\u0646\u0633\u0641\u0631'
      : data.paymentMethod === 'online' ? '\u0622\u0646 \u0644\u0627\u0626\u0646 \u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC'
      : data.paymentMethod === 'cash' ? '\u0646\u0642\u062F'
      : data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1)
    doc.text(methodLabel, margin + 32, y)
    y += 6
  }

  if (data.transactionId) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('\u0644\u06CC\u0646 \u062F\u06CC\u0646 \u0646\u0645\u0628\u0631:', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(data.transactionId, margin + 32, y)
    y += 6
  }

  // Right column: Customer info in Urdu
  const rightColX = pageWidth / 2 + 5
  const metaLeftY = 56

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GOLD)
  doc.text('\u0628\u0644 \u0628\u0646\u0627\u0645 / \u06AF\u06AF\u0631\u0627\u0645\u06CC \u06A9\u0627 \u0646\u0627\u0645', rightColX, metaLeftY)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.setFontSize(10)
  doc.text(data.customerName, rightColX, metaLeftY + 7)

  if (data.customerPhone) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(`\u0641\u0648\u0646 \u0646\u0645\u0628\u0631: ${data.customerPhone}`, rightColX, metaLeftY + 14)
  }

  if (data.customerCnic) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(`\u0634\u0646\u0627\u062E\u062A\u06CC \u06A9\u0627\u0631\u0688: ${data.customerCnic}`, rightColX, metaLeftY + (data.customerPhone ? 20 : 14))
  }

  // ─── GOLD SEPARATOR ───
  y = Math.max(y, data.customerCnic && data.customerPhone ? metaLeftY + 26 : metaLeftY + 20) + 4
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // ─── ITEMS TABLE ───
  // Table header
  const colDesc = contentWidth * 0.46
  const colQty = contentWidth * 0.13
  const colPrice = contentWidth * 0.20
  const colTotal = contentWidth * 0.21

  const descX = margin
  const qtyX = descX + colDesc
  const priceX = qtyX + colQty
  const totalX = priceX + colPrice

  // Table header background
  doc.setFillColor(...NAVY)
  doc.rect(margin, y - 4, contentWidth, 8, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('\u062A\u0641\u0635\u06CC\u0644', descX + 3, y)
  doc.text('\u062A\u0639\u062F\u0627\u062F', qtyX + 3, y)
  doc.text('\u0641\u06CC \u0642\u06CC\u0645\u062A', priceX + 3, y)
  doc.text('\u06A9\u0644 \u0631\u0642\u0645', totalX + 3, y)

  y += 8

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.setFontSize(8)

  data.items.forEach((item, index) => {
    // Check if we need a new page
    if (y > pageHeight - 60) {
      doc.addPage()
      y = margin
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(...BG_LIGHT)
      doc.rect(margin, y - 3.5, contentWidth, 7, 'F')
    }

    // Item description
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    const descLines = doc.splitTextToSize(item.description, colDesc - 6)
    doc.text(descLines[0] || '', descX + 3, y)

    // Quantity
    doc.text(String(item.quantity), qtyX + 3, y)

    // Unit price
    doc.text(`Rs. ${item.unitPrice.toLocaleString()}`, priceX + 3, y)

    // Total
    doc.setFont('helvetica', 'bold')
    doc.text(`Rs. ${item.total.toLocaleString()}`, totalX + 3, y)
    doc.setFont('helvetica', 'normal')

    y += 7
  })

  // ─── TOTALS SECTION ───
  y += 4
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  const totalsX = pageWidth - margin - 50
  const amountsX = pageWidth - margin

  // Subtotal
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.setFontSize(8)
  doc.text('\u0630\u06CC\u0644\u06CC \u06A9\u0644:', totalsX, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(`Rs. ${data.subtotal.toLocaleString()}`, amountsX, y, { align: 'right' })
  y += 6

  // Service fee
  if (data.serviceFee && data.serviceFee > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('\u0633\u0631\u0648\u0633 \u0641\u06CC\u0633:', totalsX, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(`Rs. ${data.serviceFee.toLocaleString()}`, amountsX, y, { align: 'right' })
    y += 6
  }

  // Total amount - prominent
  y += 2
  doc.setFillColor(...BG_LIGHT)
  doc.rect(totalsX - 4, y - 4, amountsX - totalsX + 8, 9, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('\u06A9\u0644 \u0631\u0642\u0645:', totalsX, y + 1)
  doc.setTextColor(...DARK)
  doc.text(`Rs. ${data.totalAmount.toLocaleString()}`, amountsX, y + 1, { align: 'right' })

  y += 14

  // ─── PAYMENT METHOD BADGE ───
  if (data.paymentMethod) {
    const methodLabel = data.paymentMethod === 'jazzcash' ? '\u062C\u06CC\u0632 \u06A9\u06CC\u0634'
      : data.paymentMethod === 'easypaisa' ? '\u0627\u06CC\u0632\u06CC \u067E\u06CC\u0633\u06C1'
      : data.paymentMethod === 'bank_transfer' ? '\u0628\u06CC\u0646\u06A9 \u0679\u0631\u0627\u0646\u0633\u0641\u0631'
      : data.paymentMethod === 'online' ? '\u0622\u0646 \u0644\u0627\u0626\u0646 \u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC'
      : data.paymentMethod === 'cash' ? '\u0646\u0642\u062F'
      : data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1)

    doc.setFillColor(...GOLD)
    const badgeText = `\u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC \u06A9\u06D2 \u0630\u0631\u06CC\u0639\u06D2 ${methodLabel}`
    const badgeWidth = doc.getTextWidth(badgeText) + 10
    doc.roundedRect(margin, y - 3, badgeWidth, 7, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(badgeText, margin + 3, y + 1)
    y += 10
  }

  // ─── TERMS AND CONDITIONS (Urdu) ───
  y += 2
  doc.setFillColor(255, 248, 230) // light gold bg
  doc.roundedRect(margin, y - 2, contentWidth, 22, 2, 2, 'F')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('\u0634\u0631\u0627\u0626\u0637 \u0648 \u0636\u0648\u0627\u0628\u0637:', margin + 4, y + 3)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.setFontSize(6.5)
  doc.text('\u2022 \u06CC\u06C1 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u06A9\u0627 \u0628\u0646\u0627\u06CC\u0627 \u06C1\u0648\u0627 \u0628\u0644 \u06C1\u06D2\u060C \u062F\u0633\u062A\u062E\u0637 \u0636\u0631\u0648\u0631\u06CC \u0646\u06C1\u06CC\u06BA\u06D4', margin + 4, y + 8)
  doc.text('\u2022 \u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC \u06A9\u06D2 \u0628\u0639\u062F \u06A9\u0648\u0626\u06CC \u0645\u0648\u0627\u0642\u0641 \u0639\u0648\u0627\u0645 \u0646\u06C1\u06CC\u06BA \u06C1\u0648\u06AF\u0627\u06D4', margin + 4, y + 12)
  doc.text('\u2022 \u06A9\u0633\u06CC \u0628\u06BE\u06CC \u0634\u06A9\u0627\u06CC\u062A \u06A9\u06D2 \u0644\u06CC\u06D2 \u062F\u06A9\u0627\u0646 \u067E\u0631 \u0631\u0627\u0628\u0637\u06C1 \u06A9\u0631\u06CC\u06BA\u06D4', margin + 4, y + 16)

  y += 26

  // ─── VERIFICATION QR SECTION ───
  if (data.verificationHash || data.verificationUrl) {
    y += 2
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y - 2, contentWidth, 18, 2, 2)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text('\u062A\u0635\u062F\u06CC\u0642 / Verification', margin + 4, y + 3)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.setFontSize(6.5)

    if (data.verificationUrl) {
      doc.text(`\u0622\u0646 \u0644\u0627\u0626\u0646 \u062A\u0635\u062F\u06CC\u0642 \u06A9\u0631\u06CC\u06BA: ${data.verificationUrl}`, margin + 4, y + 9)
    }

    if (data.verificationHash) {
      doc.text(`\u06C1\u0634: ${data.verificationHash}`, margin + 4, y + 13)
    }

    // QR icon placeholder
    doc.setFontSize(6)
    doc.setTextColor(...LIGHT_GRAY)
    doc.text('\u062A\u0635\u062F\u06CC\u0642 \u06A9\u06D2 \u0644\u06CC\u06D2 QR \u0627\u0633\u06A9\u06CC\u0646 \u06A9\u0631\u06CC\u06BA', pageWidth - margin - 32, y + 6)
    // Simple QR placeholder box
    doc.setDrawColor(...NAVY)
    doc.setLineWidth(0.4)
    doc.rect(pageWidth - margin - 14, y, 12, 12)
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    doc.text('QR', pageWidth - margin - 10, y + 7)

    y += 22
  }

  // ─── FOOTER ───
  // Position footer at bottom of page
  const footerY = pageHeight - 25

  // Gold line above footer
  doc.setFillColor(...GOLD)
  doc.rect(0, footerY - 4, pageWidth, 1.5, 'F')

  // Footer content
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('Jugnoo Photostate', pageWidth / 2, footerY + 2, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.setFontSize(6.5)
  doc.text('\u0686\u0648\u06A9 \u0627\u0639\u0638\u0645\u060C \u0644\u06CC\u06C1\u060C \u067E\u0646\u062C\u0627\u0628\u060C \u067E\u0627\u06A9\u0633\u062A\u0627\u0646', pageWidth / 2, footerY + 7, { align: 'center' })

  doc.setTextColor(...LIGHT_GRAY)
  doc.setFontSize(6)
  doc.text('\u0622\u0631\u0679\u06CC\u0641\u06CC\u0634\u06CC\u0644 \u0627\u0646\u0679\u06CC\u0644\u06CC\u062C\u0646\u0633 \u067E\u0631 \u0645\u0628\u0646\u06CC \u06A9\u0627\u0631\u0648\u0628\u0627\u0631\u06CC \u0627\u0646\u0638\u0627\u0645 | \u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC: \u062C\u06CC\u0632 \u06A9\u06CC\u0634\u060C \u0627\u06CC\u0632\u06CC \u067E\u06CC\u0633\u06C1\u060C \u0628\u06CC\u0646\u06A9 \u0679\u0631\u0627\u0646\u0633\u0641\u0631', pageWidth / 2, footerY + 11, { align: 'center' })
  doc.text('\u06CC\u06C1 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u06A9\u0627 \u0628\u0646\u0627\u06CC\u0627 \u06C1\u0648\u0627 \u0628\u0644 \u06C1\u06D2\u06D4 \u062F\u0633\u062A\u062E\u0637 \u0636\u0631\u0648\u0631\u06CC \u0646\u06C1\u06CC\u06BA\u06D4', pageWidth / 2, footerY + 15, { align: 'center' })

  return doc
}

/**
 * Generate and download the invoice PDF
 */
export function downloadInvoicePDF(data: InvoiceData, filename?: string): void {
  const doc = generateInvoicePDF(data)
  const name = filename || `\u0628\u0644-${data.invoiceNumber}.pdf`
  doc.save(name)
}

/**
 * Generate invoice PDF as Blob (for preview/sharing)
 */
export function generateInvoiceBlob(data: InvoiceData): Blob {
  const doc = generateInvoicePDF(data)
  return doc.output('blob')
}

/**
 * Generate a WhatsApp share link with invoice summary (English + widely-supported emojis)
 */
export function generateWhatsAppInvoiceLink(data: InvoiceData, phone?: string): string {
  const methodLabel = data.paymentMethod === 'jazzcash' ? 'JazzCash'
    : data.paymentMethod === 'easypaisa' ? 'EasyPaisa'
    : data.paymentMethod === 'bank_transfer' ? 'Bank Transfer'
    : data.paymentMethod === 'online' ? 'Online Payment'
    : data.paymentMethod === 'cash' ? 'Cash'
    : data.paymentMethod || 'N/A'

  const summary = `📄 *JUGNOO PHOTOSTATE - Invoice*
━━━━━━━━━━━━━━━━━━━━━
📋 Invoice: #${data.invoiceNumber}
📆 Date: ${data.date}
👤 Customer: ${data.customerName}
${data.orderNumber ? `📦 Order: ${data.orderNumber}` : ''}

*Items:*
${data.items.map(item => `- ${item.description} x${item.quantity} = Rs.${item.total.toLocaleString()}`).join('\n')}

💰 Subtotal: Rs.${data.subtotal.toLocaleString()}
${data.serviceFee ? `🔧 Service Fee: Rs.${data.serviceFee.toLocaleString()}\n` : ''}💵 *Total: Rs.${data.totalAmount.toLocaleString()}*

💳 Payment: ${methodLabel}
${data.transactionId ? `🔐 Trx ID: ${data.transactionId}` : ''}
${data.verificationUrl ? `\n✅ Verify: ${data.verificationUrl}` : ''}

━━━━━━━━━━━━━━━━━━━━━
🏪 _Jugnoo Photostate_
📍 _Chowk Azam, Layyah, Punjab_
💡 _AI-Powered Business Management_`

  const encodedSummary = encodeURIComponent(summary)
  return phone
    ? `https://wa.me/${phone}?text=${encodedSummary}`
    : `https://wa.me/?text=${encodedSummary}`
}
