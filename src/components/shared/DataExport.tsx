'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface DataExportProps {
  data: Record<string, unknown>[]
  filename: string
  columns: { key: string; label: string }[]
  title?: string
}

export function DataExport({ data, filename, columns, title }: DataExportProps) {
  const exportCSV = () => {
    if (!data || data.length === 0) return

    const headers = columns.map(c => c.label).join(',')
    const rows = data.map(row =>
      columns.map(col => {
        const val = row[col.key]
        const str = val === null || val === undefined ? '' : String(val)
        // Escape commas and quotes
        return `"${str.replace(/"/g, '""')}"`
      }).join(',')
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    if (!data || data.length === 0) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header branding
    doc.setFillColor(26, 60, 94) // Navy
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setTextColor(245, 166, 35) // Gold
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('JUGNOO PHOTOSTATE', 14, 14)
    doc.setFontSize(8)
    doc.setTextColor(200, 200, 200)
    doc.text('AI-Powered Business Management', 14, 20)
    doc.text('Chowk Azam, Layyah, Punjab', 14, 25)

    // Title
    doc.setTextColor(26, 60, 94)
    doc.setFontSize(14)
    doc.text(title || filename, 14, 40)

    // Date
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 46)

    // Gold separator
    doc.setDrawColor(245, 166, 35)
    doc.setLineWidth(0.5)
    doc.line(14, 49, pageWidth - 14, 49)

    // Table
    let y = 55
    const colWidth = (pageWidth - 28) / Math.min(columns.length, 6)
    const rowHeight = 7

    // Table header
    doc.setFillColor(240, 244, 248)
    doc.rect(14, y - 5, pageWidth - 28, rowHeight, 'F')
    doc.setTextColor(26, 60, 94)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    columns.forEach((col, i) => {
      doc.text(col.label.substring(0, 20), 16 + i * colWidth, y)
    })
    y += rowHeight + 2

    // Table rows
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    data.forEach((row, rowIdx) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      if (rowIdx % 2 === 0) {
        doc.setFillColor(249, 250, 251)
        doc.rect(14, y - 4, pageWidth - 28, rowHeight, 'F')
      }
      columns.forEach((col, i) => {
        const val = row[col.key]
        const str = val === null || val === undefined ? '-' : String(val).substring(0, 25)
        doc.text(str, 16 + i * colWidth, y)
      })
      y += rowHeight
    })

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(`Total Records: ${data.length}`, 14, y + 10)
    doc.text('Jugnoo Photostate · AI-Powered Business Management', pageWidth / 2, 290, { align: 'center' })

    doc.save(`${filename}.pdf`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-[#1A3C5E]/20 text-[#1A3C5E] hover:bg-[#1A3C5E] hover:text-white rounded-xl">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-[#E53935]" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
          <Printer className="w-4 h-4 text-[#1A3C5E]" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
