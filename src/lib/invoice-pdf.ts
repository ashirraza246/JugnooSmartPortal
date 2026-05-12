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
 * Generate a professional branded PDF invoice using jsPDF drawing commands
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
  doc.rect(0, 0, pageWidth, 42, 'F')

  // Gold accent line at bottom of header
  doc.setFillColor(...GOLD)
  doc.rect(0, 42, pageWidth, 2, 'F')

  // Business name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('JUGNOO PHOTOSTATE', margin, 18)

  // Tagline
  doc.setFontSize(8)
  doc.setTextColor(...GOLD)
  doc.text('AI-Powered Business Management', margin, 25)

  // Address in header
  doc.setFontSize(7)
  doc.setTextColor(200, 210, 220)
  doc.text('Chowk Azam, Layyah, Punjab, Pakistan', margin, 31)
  doc.text('Working Hours: 9 AM - 9 PM', margin, 36)

  // INVOICE title on the right side of header
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - margin, 28, { align: 'right' })

  doc.setFontSize(8)
  doc.setTextColor(...GOLD)
  doc.text(`#${data.invoiceNumber}`, pageWidth - margin, 35, { align: 'right' })

  // ─── INVOICE META: Date, Customer info ───
  let y = 52

  // Left column: Invoice details
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.setFont('helvetica', 'normal')
  doc.text('Invoice Date:', margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(data.date, margin + 28, y)

  y += 6
  if (data.orderNumber) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('Order No:', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(data.orderNumber, margin + 28, y)
    y += 6
  }

  if (data.paymentMethod) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('Payment:', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    const methodLabel = data.paymentMethod === 'jazzcash' ? 'JazzCash'
      : data.paymentMethod === 'easypaisa' ? 'EasyPaisa'
      : data.paymentMethod === 'bank_transfer' ? 'Bank Transfer'
      : data.paymentMethod === 'online' ? 'Online Payment'
      : data.paymentMethod === 'cash' ? 'Cash'
      : data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1)
    doc.text(methodLabel, margin + 28, y)
    y += 6
  }

  if (data.transactionId) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('Transaction ID:', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(data.transactionId, margin + 28, y)
    y += 6
  }

  // Right column: Customer info (Bill To)
  const rightColX = pageWidth / 2 + 5
  const metaLeftY = 52

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GOLD)
  doc.text('BILL TO', rightColX, metaLeftY)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.setFontSize(10)
  doc.text(data.customerName, rightColX, metaLeftY + 7)

  if (data.customerPhone) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(`Phone: ${data.customerPhone}`, rightColX, metaLeftY + 14)
  }

  if (data.customerCnic) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(`CNIC: ${data.customerCnic}`, rightColX, metaLeftY + (data.customerPhone ? 20 : 14))
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
  doc.text('Description', descX + 3, y)
  doc.text('Qty', qtyX + 3, y)
  doc.text('Unit Price', priceX + 3, y)
  doc.text('Total', totalX + 3, y)

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
  doc.text('Subtotal:', totalsX, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(`Rs. ${data.subtotal.toLocaleString()}`, amountsX, y, { align: 'right' })
  y += 6

  // Service fee
  if (data.serviceFee && data.serviceFee > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text('Service Fee:', totalsX, y)
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
  doc.text('TOTAL:', totalsX, y + 1)
  doc.setTextColor(...DARK)
  doc.text(`Rs. ${data.totalAmount.toLocaleString()}`, amountsX, y + 1, { align: 'right' })

  y += 14

  // ─── PAYMENT METHOD BADGE ───
  if (data.paymentMethod) {
    const methodLabel = data.paymentMethod === 'jazzcash' ? 'JazzCash'
      : data.paymentMethod === 'easypaisa' ? 'EasyPaisa'
      : data.paymentMethod === 'bank_transfer' ? 'Bank Transfer'
      : data.paymentMethod === 'online' ? 'Online Payment'
      : data.paymentMethod === 'cash' ? 'Cash'
      : data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1)

    doc.setFillColor(...GOLD)
    const badgeWidth = doc.getTextWidth(methodLabel) + 10
    doc.roundedRect(margin, y - 3, badgeWidth, 7, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`Paid via ${methodLabel}`, margin + 3, y + 1)
    y += 10
  }

  // ─── VERIFICATION QR SECTION ───
  if (data.verificationHash || data.verificationUrl) {
    y += 2
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y - 2, contentWidth, 18, 2, 2)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text('VERIFICATION', margin + 4, y + 3)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.setFontSize(6.5)

    if (data.verificationUrl) {
      doc.text(`Verify online: ${data.verificationUrl}`, margin + 4, y + 9)
    }

    if (data.verificationHash) {
      doc.text(`Hash: ${data.verificationHash}`, margin + 4, y + 13)
    }

    // QR icon placeholder
    doc.setFontSize(6)
    doc.setTextColor(...LIGHT_GRAY)
    doc.text('Scan QR to verify', pageWidth - margin - 22, y + 6)
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
  doc.text('Chowk Azam, Layyah, Punjab, Pakistan', pageWidth / 2, footerY + 7, { align: 'center' })

  doc.setTextColor(...LIGHT_GRAY)
  doc.setFontSize(6)
  doc.text('AI-Powered Business Management | Payments: JazzCash, EasyPaisa, Bank Transfer', pageWidth / 2, footerY + 11, { align: 'center' })
  doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, footerY + 15, { align: 'center' })

  return doc
}

/**
 * Generate and download the invoice PDF
 */
export function downloadInvoicePDF(data: InvoiceData, filename?: string): void {
  const doc = generateInvoicePDF(data)
  const name = filename || `Invoice-${data.invoiceNumber}.pdf`
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
 * Generate a WhatsApp share link with invoice summary
 */
export function generateWhatsAppInvoiceLink(data: InvoiceData, phone?: string): string {
  const methodLabel = data.paymentMethod === 'jazzcash' ? 'JazzCash'
    : data.paymentMethod === 'easypaisa' ? 'EasyPaisa'
    : data.paymentMethod === 'bank_transfer' ? 'Bank Transfer'
    : data.paymentMethod === 'online' ? 'Online Payment'
    : data.paymentMethod === 'cash' ? 'Cash'
    : data.paymentMethod || 'N/A'

  const summary = `*Jugnoo Photostate - Invoice*
━━━━━━━━━━━━━━━━━━
Invoice #: ${data.invoiceNumber}
Date: ${data.date}
Customer: ${data.customerName}
${data.orderNumber ? `Order: ${data.orderNumber}` : ''}

*Items:*
${data.items.map(item => `• ${item.description} x${item.quantity} = Rs.${item.total.toLocaleString()}`).join('\n')}

*Subtotal:* Rs.${data.subtotal.toLocaleString()}
${data.serviceFee ? `*Service Fee:* Rs.${data.serviceFee.toLocaleString()}\n` : ''}*TOTAL:* Rs.${data.totalAmount.toLocaleString()}

*Payment:* ${methodLabel}
${data.transactionId ? `*Transaction ID:* ${data.transactionId}` : ''}
${data.verificationUrl ? `\nVerify: ${data.verificationUrl}` : ''}

━━━━━━━━━━━━━━━━━━
Jugnoo Photostate
Chowk Azam, Layyah`

  const encodedSummary = encodeURIComponent(summary)
  return phone
    ? `https://wa.me/${phone}?text=${encodedSummary}`
    : `https://wa.me/?text=${encodedSummary}`
}
