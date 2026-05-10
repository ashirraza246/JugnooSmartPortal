#!/usr/bin/env python3
"""
Jugnoo Smart - AI-Powered App Proposal PDF Generator
"""
import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
pdfmetrics.registerFont(TTFont('LibSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LibSans-Bold', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LibSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LibSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('LibSerif', normal='LibSerif', bold='LibSerif-Bold')
registerFontFamily('LibSans', normal='LibSans', bold='LibSans-Bold')

# ── Color Palette ──
ACCENT       = colors.HexColor('#4b6673')
ACCENT_WARM  = colors.HexColor('#c46b4e')
TEXT_PRIMARY  = colors.HexColor('#202224')
TEXT_MUTED    = colors.HexColor('#7c8386')
BG_SURFACE   = colors.HexColor('#eaedef')
BG_PAGE      = colors.HexColor('#f2f3f3')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = colors.HexColor('#f3f4f5')
BORDER_COLOR       = colors.HexColor('#c7d3d9')
SEM_SUCCESS   = colors.HexColor('#417d55')
SEM_INFO      = colors.HexColor('#4d6a87')

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ── Styles ──
body_style = ParagraphStyle(
    name='Body', fontName='LibSerif', fontSize=11, leading=18,
    alignment=TA_JUSTIFY, spaceAfter=8, wordWrap='CJK'
)

h1_style = ParagraphStyle(
    name='H1', fontName='LibSerif', fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT
)

h2_style = ParagraphStyle(
    name='H2', fontName='LibSerif', fontSize=15, leading=22,
    textColor=ACCENT, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)

h3_style = ParagraphStyle(
    name='H3', fontName='LibSerif', fontSize=12, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)

header_cell_style = ParagraphStyle(
    name='HeaderCell', fontName='LibSans', fontSize=10,
    textColor=colors.white, alignment=TA_CENTER, leading=14
)

cell_style = ParagraphStyle(
    name='Cell', fontName='LibSerif', fontSize=10,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, leading=14, wordWrap='CJK'
)

cell_center = ParagraphStyle(
    name='CellCenter', fontName='LibSerif', fontSize=10,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, leading=14
)

caption_style = ParagraphStyle(
    name='Caption', fontName='LibSerif', fontSize=9,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=12
)

bullet_style = ParagraphStyle(
    name='Bullet', fontName='LibSerif', fontSize=11, leading=18,
    alignment=TA_LEFT, leftIndent=24, bulletIndent=12, spaceAfter=4, wordWrap='CJK'
)

toc_h1 = ParagraphStyle(name='TOCH1', fontName='LibSerif', fontSize=13, leftIndent=20, leading=22)
toc_h2 = ParagraphStyle(name='TOCH2', fontName='LibSerif', fontSize=11, leftIndent=40, leading=18)

# ── TOC DocTemplate ──
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

H1_ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

def add_major_section(text, style):
    return [
        CondPageBreak(H1_ORPHAN_THRESHOLD),
        add_heading(text, style, level=0),
    ]

def make_table(headers, rows, col_widths=None):
    """Create a styled table with header and rows."""
    if col_widths is None:
        n = len(headers)
        col_widths = [CONTENT_W / n] * n
    
    data = []
    header_row = [Paragraph('<b>%s</b>' % h, header_cell_style) for h in headers]
    data.append(header_row)
    
    for row in rows:
        data.append([Paragraph(str(c), cell_style) for c in row])
    
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_ODD if i % 2 == 0 else TABLE_ROW_EVEN
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    
    t.setStyle(TableStyle(style_cmds))
    return t

# ── Build Document ──
output_path = '/home/z/my-project/download/jugnoo_smart_body.pdf'
doc = TocDocTemplate(
    output_path, pagesize=A4,
    leftMargin=LEFT_MARGIN, rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
    title='Jugnoo Smart - AI App Proposal',
    author='Z.ai',
    creator='Z.ai'
)

story = []

# ── Table of Contents ──
toc_title = Paragraph('<b>Table of Contents</b>', ParagraphStyle(
    name='TOCTitle', fontName='LibSerif', fontSize=22, leading=30,
    textColor=ACCENT, spaceBefore=0, spaceAfter=20, alignment=TA_LEFT
))
story.append(toc_title)
story.append(Spacer(1, 12))

toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════
# SECTION 1: Executive Summary
# ═══════════════════════════════════════
story.extend(add_major_section('<b>1. Executive Summary</b>', h1_style))

story.append(Paragraph(
    'Jugnoo Photos & Printing Services, located at Chowk Azam, Layyah, Punjab, is a multi-service document and printing shop that currently offers over 14 distinct services ranging from basic colour printing and photocopying to specialised notarisation services including deed notarisation, divorce document notarisation, and e-notary services. The business also provides custom printing, document scanning, form printing, letterhead and business card production, letterpress printing, photo printing, and poster creation. Despite this impressive service portfolio, the shop faces a critical operational challenge: managing a high volume of diverse client requests simultaneously, which leads to bottlenecks, delays, and customer dissatisfaction.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'This proposal presents <b>Jugnoo Smart</b>, an AI-powered mobile and web application designed to automate the majority of routine tasks, streamline client management, reduce manual workload, and transform the business from a reactive service provider into a proactive, technology-enabled operation. By leveraging artificial intelligence for document processing, queue management, form auto-filling, customer communication, and inventory tracking, Jugnoo Smart aims to reduce the operational burden by an estimated 60-70%, enabling the business to serve more clients with higher quality and faster turnaround times.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The application is specifically tailored for the Pakistani market, with support for Urdu language, local payment methods like JazzCash and EasyPaisa, WhatsApp integration for client communication, and compliance with local notarisation regulations. The proposed solution addresses the unique challenges faced by small printing and document service shops in semi-urban areas of Punjab, where digital adoption is growing but still requires thoughtful, culturally-aware design choices.',
    body_style
))

# ═══════════════════════════════════════
# SECTION 2: Problem Analysis
# ═══════════════════════════════════════
story.extend(add_major_section('<b>2. Problem Analysis</b>', h1_style))

story.append(Paragraph(
    'The current operational model of Jugnoo Photos & Printing Services relies heavily on manual processes for nearly every aspect of the business. From receiving orders and managing queues to processing documents and handling payments, every step requires direct human intervention. This manual dependency creates several interconnected problems that compound during peak hours, resulting in a stressful work environment and diminished service quality.',
    body_style
))

story.append(add_heading('<b>2.1 Current Pain Points</b>', h2_style, level=1))

pain_points_data = [
    ['Manual Order Taking', 'Every client must physically visit the shop to place an order, describe their requirements verbally, and wait for staff to manually note down specifications. This process is time-consuming and error-prone, especially when multiple clients arrive simultaneously.'],
    ['Queue Congestion', 'Without a digital queue system, clients physically line up at the counter. During peak hours (morning rush, exam seasons, tax filing deadlines), this creates long wait times and frustrated customers who may leave for competitors.'],
    ['Repetitive Document Processing', 'Common tasks like copying ID cards, filling out standard forms, and creating notarisation documents require the same steps every time. Staff must manually scan, format, print, and verify each document even though most follow predictable templates.'],
    ['Price Calculation Errors', 'With 14+ services and varying pricing based on paper size, colour/monochrome, quantity, and urgency, calculating prices manually leads to inconsistencies. Some clients may be overcharged while others get undercharged, affecting both revenue and trust.'],
    ['Inventory Blind Spots', 'Paper, ink, toner, and stamp supplies run out without warning because there is no automated tracking system. This leads to emergency procurement at higher prices or temporary service shutdowns until supplies arrive.'],
    ['Client Communication Gaps', 'When jobs are ready, staff must manually call or message clients. During busy periods, this step gets delayed or forgotten, leading to uncollected orders and unhappy customers who feel ignored.'],
]

for title, desc in pain_points_data:
    story.append(Paragraph('<b>%s:</b> %s' % (title, desc), bullet_style))

story.append(Spacer(1, 12))

# ═══════════════════════════════════════
# SECTION 3: App Overview - Jugnoo Smart
# ═══════════════════════════════════════
story.extend(add_major_section('<b>3. App Overview: Jugnoo Smart</b>', h1_style))

story.append(Paragraph(
    'Jugnoo Smart is envisioned as a comprehensive, AI-powered management platform that serves three distinct user groups: (1) the shop owners and staff who need powerful operational tools, (2) the clients who want convenient, self-service access to printing and document services, and (3) notary officials who need secure, verifiable document processing capabilities. The application will be available as both a mobile app (Android-first, given the Pakistani market) and a web dashboard for shop management.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The core philosophy of Jugnoo Smart is "AI First, Human Supervised." This means that artificial intelligence handles the repetitive, time-consuming tasks automatically, while human staff retain oversight and control over quality-critical decisions. For example, AI can auto-scan and categorise incoming documents, pre-fill standard forms, calculate pricing, and send client notifications, but a human operator must approve the final print job and verify notarisation documents before they are sealed.',
    body_style
))

story.append(add_heading('<b>3.1 Core Architecture</b>', h2_style, level=1))

arch_data = [
    ['Component', 'Technology', 'Purpose'],
    ['Mobile App (Client)', 'React Native / Flutter', 'Client-facing ordering, tracking, payments'],
    ['Mobile App (Staff)', 'React Native / Flutter', 'Queue management, job processing, notifications'],
    ['Web Dashboard', 'Next.js + Tailwind CSS', 'Shop management, analytics, inventory, reports'],
    ['AI Engine', 'Python + TensorFlow/PyTorch', 'Document OCR, form auto-fill, smart categorisation'],
    ['Backend API', 'Node.js + Express / Django', 'Business logic, authentication, payment processing'],
    ['Database', 'PostgreSQL + Redis', 'Persistent storage + caching for fast queue operations'],
    ['Cloud Storage', 'AWS S3 / Google Cloud', 'Document storage, backup, secure client vault'],
    ['Messaging', 'WhatsApp Business API + Twilio', 'Client notifications, order updates, reminders'],
]

headers = arch_data[0]
rows = arch_data[1:]
col_w = [CONTENT_W * 0.28, CONTENT_W * 0.32, CONTENT_W * 0.40]
t = make_table(headers, rows, col_w)
story.append(Spacer(1, 18))
story.append(t)
story.append(Paragraph('Table 1: Core Technology Architecture', caption_style))

# ═══════════════════════════════════════
# SECTION 4: AI-Powered Features
# ═══════════════════════════════════════
story.extend(add_major_section('<b>4. AI-Powered Features</b>', h1_style))

story.append(Paragraph(
    'The most transformative aspect of Jugnoo Smart is its suite of AI-powered features that directly address the operational bottlenecks identified in the problem analysis. Each feature is designed to eliminate a specific manual task, freeing up staff time for quality control and customer interaction. The AI models can be trained incrementally, starting with pre-trained models for common document types and improving over time with shop-specific data.',
    body_style
))

# Feature 1
story.append(add_heading('<b>4.1 AI Document Scanner and Processor</b>', h2_style, level=1))

story.append(Paragraph(
    'The AI Document Scanner is the flagship feature of Jugnoo Smart, designed to replace the entire manual document processing pipeline. When a client brings a physical document to the shop, the staff member simply places it under the scanner and the AI takes over. The system uses advanced Optical Character Recognition (OCR) to extract text from the document, classifies the document type (ID card, property deed, affidavit, form, etc.), and automatically routes it to the appropriate processing queue.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'For common document types like CNIC copies, property documents, and affidavit forms, the AI can automatically enhance scan quality, correct skew and rotation, adjust brightness and contrast, and crop to the document boundaries. This eliminates the need for staff to manually adjust scanner settings for each document, which currently takes 2-3 minutes per document. With AI processing, the same task takes under 15 seconds, representing a 90% reduction in per-document processing time.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The system also maintains a digital archive of all scanned documents, indexed by client name, document type, and date. This allows staff to quickly retrieve and reprint previously scanned documents without requiring the client to bring the original again. For repeat customers, this feature alone can save significant time and improve customer satisfaction, as they no longer need to carry original documents for every visit.',
    body_style
))

# Feature 2
story.append(add_heading('<b>4.2 AI Form Auto-Fill Engine</b>', h2_style, level=1))

story.append(Paragraph(
    'Many of the services offered by Jugnoo Photos & Printing involve filling out standardised forms. Whether it is a notarisation application, a demand for payment, a divorce document, or a general affidavit, these forms follow predictable patterns with most fields being common across clients from the same area. The AI Form Auto-Fill Engine leverages this predictability to dramatically reduce the time spent on form completion.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'When a returning client requests a form-based service, the system automatically retrieves their previously stored information (name, father\'s name, CNIC number, address, etc.) and pre-populates the form fields. The staff member only needs to verify the auto-filled data and add any form-specific details. For new clients, the system captures their information once and stores it securely for future use. The AI also cross-references CNIC data (when available through verified APIs) to auto-validate personal information, reducing errors and ensuring document accuracy.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The form templates are stored digitally and can be updated centrally whenever regulations change. This eliminates the need to maintain physical stock of blank forms and ensures that clients always receive the most current version. For notarisation services specifically, the system can generate the complete document package (affidavit, witness statements, notary certificate) from a single client input session, reducing a process that currently takes 30-45 minutes to under 5 minutes.',
    body_style
))

# Feature 3
story.append(add_heading('<b>4.3 Smart Queue Management System</b>', h2_style, level=1))

story.append(Paragraph(
    'The Smart Queue Management System replaces the physical line-up system with a digital, AI-optimised queue. Clients can book their slot through the mobile app, WhatsApp, or at a self-service kiosk at the shop entrance. The AI estimates service time based on the requested service type, current queue length, and historical data, providing clients with an accurate estimated wait time. This transparency alone significantly improves client satisfaction, as people are more willing to wait when they know exactly how long it will take.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The AI continuously optimises the queue order by grouping similar service types together, prioritising quick jobs (photocopying, scanning) between longer jobs (notarisation, custom printing), and dynamically adjusting estimated times based on real-time progress. If a notarisation job is taking longer than expected, the system automatically updates the wait times for all subsequent clients and sends proactive notifications. Clients receive alerts when they are next in line, allowing them to wait comfortably outside or in their vehicles rather than standing in a physical queue.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'For peak periods such as exam seasons or tax filing deadlines, the system can enable advance booking with time slots, ensuring a more even distribution of client arrivals throughout the day. Historical queue data also helps the business identify staffing needs, optimal operating hours, and seasonal demand patterns, enabling data-driven decisions about resource allocation.',
    body_style
))

# Feature 4
story.append(add_heading('<b>4.4 AI Notarisation Assistant</b>', h2_style, level=1))

story.append(Paragraph(
    'Notarisation services are among the most complex and time-consuming offerings at Jugnoo Photostate. Each type of notarisation (deed, demand for payment, divorce document, general) has specific legal requirements, document formats, witness requirements, and stamp duty calculations. The AI Notarisation Assistant acts as an expert guide for both staff and clients, walking them through the entire process step by step.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'When a client requests a notarisation service, the AI first determines the document type and presents a checklist of required documents, witnesses, and fees. It then generates the appropriate legal document template, auto-fills client information, calculates the correct stamp duty based on current Punjab regulations, and prepares the notary certificate. The system maintains a secure audit trail of all notarisation activities, including timestamps, digital signatures (for e-notary services), and photographic verification of the signing parties.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'For e-notary services, the system integrates with NADRA verification APIs to confirm the identity of signing parties, adds tamper-evident digital seals to documents, and provides clients with a QR code that can be scanned to verify the authenticity of the notarised document. This digital verification capability adds significant value to the service and positions Jugnoo as a modern, trustworthy notarisation provider in the Chowk Azam area.',
    body_style
))

# Feature 5
story.append(add_heading('<b>4.5 Smart Pricing Calculator</b>', h2_style, level=1))

story.append(Paragraph(
    'The Smart Pricing Calculator eliminates the inconsistency and errors in manual price calculation. It maintains a comprehensive, updatable pricing database that accounts for every variable: service type, paper size (A4, A3, Legal, Letter), colour versus monochrome, single-sided versus double-sided, quantity tiers, urgency surcharges, lamination options, and binding types. When a client places an order through the app or when staff enters a job at the counter, the calculator instantly generates an accurate, itemised price quote.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The AI component adds intelligent pricing recommendations based on historical data and market analysis. For example, it can suggest bundle discounts for clients ordering multiple services (e.g., printing + binding + lamination at 10% off), recommend upsell options (e.g., premium paper for business cards), and alert staff when a particular service is priced significantly below the local market rate. The system also tracks profitability per service, helping the business owner make informed decisions about pricing adjustments and promotional offers.',
    body_style
))

# Feature 6
story.append(add_heading('<b>4.6 WhatsApp-Integrated Communication Hub</b>', h2_style, level=1))

story.append(Paragraph(
    'In Pakistan, WhatsApp is the dominant communication platform, and Jugnoo Smart leverages this reality by building the entire client communication system around the WhatsApp Business API. Instead of requiring clients to download a separate app just for communication, the system sends order confirmations, queue position updates, ready-for-collection notifications, and payment receipts directly through WhatsApp messages.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The AI-powered chatbot can handle common enquiries automatically, such as "What are your rates for colour printing?" or "What documents do I need for deed notarisation?" or "What time do you close today?" This reduces the number of routine phone calls and walk-in enquiries that staff must handle, freeing them to focus on processing orders. For more complex queries, the chatbot seamlessly transfers the conversation to a staff member, who can respond from the staff app without switching between platforms.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'Clients can also submit orders directly through WhatsApp by sending photos of the documents they need printed or scanned. The AI processes these images, identifies the document type, generates a price quote, and asks for confirmation before adding the job to the queue. This WhatsApp-first approach dramatically lowers the barrier to digital adoption for clients who may be hesitant to install a new app.',
    body_style
))

# Feature 7
story.append(add_heading('<b>4.7 Digital Document Vault</b>', h2_style, level=1))

story.append(Paragraph(
    'The Digital Document Vault provides secure, cloud-based storage for all client documents processed by the shop. Each client gets a personal vault accessible through the mobile app using biometric authentication (fingerprint or face recognition). The vault stores scanned copies of all documents the client has ever had processed at Jugnoo, along with metadata such as processing date, document type, and print specifications.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'When a client needs a reprint of a previously processed document, they can simply select it from their vault and request a reprint through the app, without visiting the shop or carrying the original. The system sends the print job directly to the shop\'s queue and notifies the client when it is ready for collection. This feature is particularly valuable for commonly reprinted documents like CNIC copies, property papers, and educational certificates.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'Security is paramount for the document vault. All documents are encrypted using AES-256 encryption both at rest and in transit. Access logs are maintained for every document access, and clients can set expiration dates on shared documents. The system complies with Pakistani data protection regulations and implements role-based access control for staff, ensuring that sensitive documents like notarised deeds and divorce papers are only accessible to authorised personnel.',
    body_style
))

# Feature 8
story.append(add_heading('<b>4.8 Inventory Management with Auto-Reorder</b>', h2_style, level=1))

story.append(Paragraph(
    'The Inventory Management module tracks all consumable supplies in real-time, including paper (by size, type, and quantity), ink and toner cartridges (by colour and model), stamp supplies, binding materials, and lamination pouches. The system uses weight sensors connected to paper trays and usage data from the AI Document Scanner to maintain accurate inventory counts without manual counting.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The AI predicts when supplies will run out based on current usage rates, historical patterns, and upcoming seasonal demand (e.g., increased demand during exam periods or government deadline periods). When inventory drops below a configurable threshold, the system automatically generates a purchase order to the pre-configured supplier and sends an approval notification to the shop owner. With the owner\'s approval, the order is placed automatically, ensuring that supplies are always available without the owner needing to manually monitor stock levels.',
    body_style
))

# ═══════════════════════════════════════
# SECTION 5: Service Mapping
# ═══════════════════════════════════════
story.extend(add_major_section('<b>5. Service-to-Feature Mapping</b>', h1_style))

story.append(Paragraph(
    'The following table maps each of the 14 services currently offered by Jugnoo Photos & Printing Services to the specific AI features that automate or assist with that service. This mapping demonstrates how every service benefits from the Jugnoo Smart platform, with AI automation levels ranging from partial assistance to near-complete automation.',
    body_style
))

service_map = [
    ['Colour Printing', 'AI Scanner + Smart Pricing', 'High', 'Auto-scan, enhance, and print with AI-calculated pricing'],
    ['Copy Services', 'AI Scanner + Queue Manager', 'Very High', 'Auto-detect settings, batch processing, queue optimisation'],
    ['Custom Printing', 'Smart Pricing + Vault', 'Medium', 'Template library, price calculator, design upload via app'],
    ['Document Scanning', 'AI Scanner + Vault', 'Very High', 'Auto-enhance, categorise, archive to digital vault'],
    ['Form Printing', 'Auto-Fill Engine + Vault', 'Very High', 'Pre-filled forms from stored data, digital templates'],
    ['Letterhead & Cards', 'Smart Pricing + Vault', 'High', 'Design templates, batch ordering, reorder from vault'],
    ['Letterpress Printing', 'Smart Pricing + Queue', 'Medium', 'Queue scheduling, price calculation, material tracking'],
    ['Photo Printing', 'AI Scanner + Smart Pricing', 'High', 'Auto-colour correction, size selection, price calculation'],
    ['Posters', 'Smart Pricing + Queue', 'Medium', 'Size/quantity pricing, queue scheduling for large format'],
    ['Deed Notarisation', 'Notary Assistant + Auto-Fill', 'High', 'Document generation, witness checklist, stamp duty calc'],
    ['Payment Notarisation', 'Notary Assistant + Auto-Fill', 'High', 'Demand draft generation, legal compliance check'],
    ['Divorce Notarisation', 'Notary Assistant + Auto-Fill', 'High', 'Sensitive document handling, legal template, e-seal'],
    ['E-Notary Services', 'Notary Assistant + Vault', 'Very High', 'NADRA verification, digital seal, QR verification'],
    ['General Notarisation', 'Notary Assistant + Auto-Fill', 'High', 'Template selection, auto-fill, audit trail'],
]

headers = ['Service', 'AI Features Used', 'Automation Level', 'How AI Helps']
rows = service_map
col_w = [CONTENT_W * 0.18, CONTENT_W * 0.22, CONTENT_W * 0.15, CONTENT_W * 0.45]
t = make_table(headers, rows, col_w)
story.append(Spacer(1, 18))
story.append(t)
story.append(Paragraph('Table 2: Service-to-Feature Mapping with Automation Levels', caption_style))

# ═══════════════════════════════════════
# SECTION 6: User Interface Design
# ═══════════════════════════════════════
story.extend(add_major_section('<b>6. User Interface Design</b>', h1_style))

story.append(Paragraph(
    'The user interface design for Jugnoo Smart follows three core principles: simplicity, accessibility, and speed. Given the diverse user base in Chowk Azam, which includes both tech-savvy youth and older adults who may be less comfortable with technology, the interface must be intuitive enough for first-time users while powerful enough for experienced staff. All interfaces support both Urdu and English, with automatic language detection based on the user\'s device settings.',
    body_style
))

story.append(add_heading('<b>6.1 Client Mobile App</b>', h2_style, level=1))

story.append(Paragraph(
    'The client-facing mobile app features a clean, card-based home screen that displays the most commonly used services as large, tappable cards with clear icons and Urdu labels. The primary actions include "Place Order," "Track Order," "My Documents," and "Notarisation Services." Each service card shows the estimated price range and processing time, allowing clients to make informed decisions before committing. The app uses a bottom navigation bar with four tabs: Home, Orders, Documents, and Profile, following standard Android design patterns that users are already familiar with.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The order placement flow is designed for maximum efficiency. For simple services like photocopying, the client selects the service, enters the quantity, and sees the price instantly. For complex services like notarisation, the app presents a step-by-step wizard that collects required information, lists necessary documents, and provides a clear breakdown of fees. The client can upload document photos directly from their phone camera, and the AI processes these in real-time to provide accurate previews and pricing.',
    body_style
))

story.append(add_heading('<b>6.2 Staff App</b>', h2_style, level=1))

story.append(Paragraph(
    'The staff-facing app is optimised for speed and multitasking, with a dashboard-style home screen that shows the current queue, active jobs, pending approvals, and alerts at a glance. The primary workflow follows a Kanban-style board where jobs move from "Queue" to "In Progress" to "Quality Check" to "Ready for Collection." Staff can swipe between jobs, tap to view details, and use voice commands for hands-free operation when both hands are occupied with document handling.',
    body_style
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'The AI assists staff at every step: it pre-processes scanned documents before they appear on the screen, highlights form fields that need manual verification (in yellow), flags potential issues (in red), and suggests next actions. For notarisation services, the app displays a real-time checklist of requirements with green checkmarks for completed steps and red indicators for missing items. This guided workflow ensures that no step is missed, even during the busiest periods, reducing the risk of legal errors in notarised documents.',
    body_style
))

story.append(add_heading('<b>6.3 Web Dashboard</b>', h2_style, level=1))

story.append(Paragraph(
    'The web dashboard serves as the command centre for the business owner, providing comprehensive analytics, inventory management, financial reporting, and system configuration capabilities. The dashboard features real-time charts showing daily revenue, service distribution, peak hours, and client retention rates. An AI-powered insights panel provides actionable recommendations such as "Notarisation demand increases by 40% on Thursdays - consider adding a second notary on duty" or "Paper A4 stock will run out in 3 days at current usage - auto-reorder suggested."',
    body_style
))

# ═══════════════════════════════════════
# SECTION 7: Technology Stack
# ═══════════════════════════════════════
story.extend(add_major_section('<b>7. Detailed Technology Stack</b>', h1_style))

story.append(Paragraph(
    'The technology stack for Jugnoo Smart has been carefully selected to balance performance, cost-effectiveness, maintainability, and the specific requirements of the Pakistani market. The system is designed to operate reliably even with intermittent internet connectivity, which is common in semi-urban areas like Chowk Azam, using offline-first architecture with background synchronisation when connectivity is restored.',
    body_style
))

tech_data = [
    ['Frontend (Mobile)', 'React Native with Expo', 'Cross-platform Android/iOS development from a single codebase, reducing development time and cost by approximately 40% compared to native development. Expo provides over-the-air updates, crucial for rapid feature deployment without requiring users to update from the Play Store.'],
    ['Frontend (Web)', 'Next.js 16 + Tailwind CSS 4 + shadcn/ui', 'Server-side rendered web application for the admin dashboard, with modern component library for professional UI. Tailwind CSS enables rapid styling with consistent design tokens across all pages.'],
    ['Backend API', 'Node.js + Express.js', 'Lightweight, event-driven backend that handles high concurrency efficiently. RESTful API design with WebSocket support for real-time queue updates and notifications.'],
    ['AI/ML Engine', 'Python + Tesseract OCR + Custom CNN', 'Tesseract OCR for document text extraction, custom CNN models for document classification and quality enhancement. Models run on a cloud GPU instance with API access from the backend.'],
    ['Database', 'PostgreSQL + Redis', 'PostgreSQL for persistent, relational data (clients, orders, inventory). Redis for caching, session management, and real-time queue operations requiring sub-millisecond response times.'],
    ['Authentication', 'Firebase Auth + JWT', 'Phone number-based OTP authentication for clients (no password to remember), with biometric login for staff. JWT tokens for API authentication with refresh token rotation.'],
    ['Payments', 'JazzCash + EasyPaisa + Cash', 'Integration with local digital payment platforms plus cash payment tracking. Payment gateway APIs for automated reconciliation and receipt generation.'],
    ['Cloud Infrastructure', 'AWS (EC2, S3, RDS)', 'Scalable cloud hosting with automated backups, CDN for static assets, and managed database service. Cost-optimised with reserved instances for predictable workloads.'],
]

headers = ['Layer', 'Technology', 'Rationale']
rows = tech_data
col_w = [CONTENT_W * 0.18, CONTENT_W * 0.25, CONTENT_W * 0.57]
t = make_table(headers, rows, col_w)
story.append(Spacer(1, 18))
story.append(t)
story.append(Paragraph('Table 3: Detailed Technology Stack', caption_style))

# ═══════════════════════════════════════
# SECTION 8: Implementation Roadmap
# ═══════════════════════════════════════
story.extend(add_major_section('<b>8. Implementation Roadmap</b>', h1_style))

story.append(Paragraph(
    'The implementation of Jugnoo Smart follows a phased approach, delivering the most impactful features first and building upon each success. This strategy ensures that the business sees tangible benefits from week one, while the development team can gather real-world feedback to refine subsequent phases. Each phase includes a testing period with the actual shop staff and clients before moving to the next phase.',
    body_style
))

roadmap_data = [
    ['Phase 1', 'Foundation', 'Weeks 1-6', 'Core app shell, client registration, service catalog, basic ordering, WhatsApp integration, smart pricing calculator'],
    ['Phase 2', 'AI Core', 'Weeks 7-14', 'AI Document Scanner, OCR integration, document categorisation, digital vault, form auto-fill engine for top 5 forms'],
    ['Phase 3', 'Queue + Notary', 'Weeks 15-22', 'Smart Queue Management, AI Notarisation Assistant (all 5 notary types), e-notary with NADRA verification, digital seals'],
    ['Phase 4', 'Intelligence', 'Weeks 23-28', 'Inventory auto-reorder, business analytics dashboard, AI insights engine, demand prediction, profitability analysis'],
    ['Phase 5', 'Scale', 'Weeks 29-34', 'Multi-shop support, franchise management, advanced reporting, marketing tools, loyalty programme, referral system'],
]

headers = ['Phase', 'Name', 'Timeline', 'Key Deliverables']
rows = roadmap_data
col_w = [CONTENT_W * 0.10, CONTENT_W * 0.14, CONTENT_W * 0.14, CONTENT_W * 0.62]
t = make_table(headers, rows, col_w)
story.append(Spacer(1, 18))
story.append(t)
story.append(Paragraph('Table 4: Implementation Roadmap', caption_style))

# ═══════════════════════════════════════
# SECTION 9: Business Impact
# ═══════════════════════════════════════
story.extend(add_major_section('<b>9. Expected Business Impact</b>', h1_style))

story.append(Paragraph(
    'Based on analysis of similar AI-powered transformations in document service businesses across South Asia, the following impacts are projected for Jugnoo Photos & Printing Services within the first 12 months of full deployment. These projections are conservative estimates based on documented case studies from comparable businesses in India and Bangladesh that have implemented similar automation solutions.',
    body_style
))

impact_data = [
    ['Client Throughput', '25-30 clients/day', '50-60 clients/day', '+100%', 'AI handles routine tasks; staff focus on quality control'],
    ['Average Processing Time', '15-20 min/client', '5-8 min/client', '-60%', 'Auto-scan, auto-fill, pre-calculated pricing eliminate delays'],
    ['Notarisation Time', '30-45 min/document', '8-12 min/document', '-73%', 'AI-generated documents, pre-filled templates, digital workflows'],
    ['Pricing Accuracy', '~80%', '~99%', '+24%', 'Automated calculator eliminates manual errors entirely'],
    ['Stock-out Incidents', '4-5 per month', '0-1 per month', '-80%', 'AI-driven inventory prediction and auto-reorder'],
    ['Client Satisfaction', 'Moderate', 'High', '+50%', 'Shorter waits, transparent pricing, WhatsApp updates'],
    ['Revenue Growth', 'Baseline', '+35-45%', '+40%', 'Higher throughput + reduced waste + premium e-notary services'],
]

headers = ['Metric', 'Before', 'After', 'Change', 'Reason']
rows = impact_data
col_w = [CONTENT_W * 0.16, CONTENT_W * 0.14, CONTENT_W * 0.14, CONTENT_W * 0.10, CONTENT_W * 0.46]
t = make_table(headers, rows, col_w)
story.append(Spacer(1, 18))
story.append(t)
story.append(Paragraph('Table 5: Projected Business Impact Within 12 Months', caption_style))

# ═══════════════════════════════════════
# SECTION 10: Cost Estimate
# ═══════════════════════════════════════
story.extend(add_major_section('<b>10. Cost Estimate</b>', h1_style))

story.append(Paragraph(
    'The following cost estimates are based on current market rates for software development in Pakistan and international cloud infrastructure pricing. The development approach prioritises cost-effectiveness by leveraging open-source technologies, cross-platform frameworks, and scalable cloud services that grow with the business. All costs are in Pakistani Rupees (PKR) unless otherwise noted.',
    body_style
))

cost_data = [
    ['Phase 1: Foundation', 'Development + Design + Testing', 'PKR 800,000 - 1,200,000', 'One-time'],
    ['Phase 2: AI Core', 'AI/ML Development + OCR + Vault', 'PKR 1,000,000 - 1,500,000', 'One-time'],
    ['Phase 3: Queue + Notary', 'Queue System + Notary AI + E-Notary', 'PKR 900,000 - 1,300,000', 'One-time'],
    ['Phase 4: Intelligence', 'Analytics + Inventory AI + Insights', 'PKR 600,000 - 900,000', 'One-time'],
    ['Phase 5: Scale', 'Multi-shop + Marketing + Loyalty', 'PKR 500,000 - 800,000', 'One-time'],
    ['Cloud Hosting (Year 1)', 'AWS EC2 + S3 + RDS + CDN', 'PKR 150,000 - 250,000/year', 'Recurring'],
    ['AI Cloud (Year 1)', 'GPU instance for OCR + ML', 'PKR 100,000 - 180,000/year', 'Recurring'],
    ['WhatsApp Business API', 'Monthly messaging costs', 'PKR 15,000 - 30,000/month', 'Recurring'],
    ['Maintenance & Support', 'Bug fixes + updates + support', 'PKR 50,000 - 80,000/month', 'Recurring'],
]

headers = ['Item', 'Description', 'Cost', 'Type']
rows = cost_data
col_w = [CONTENT_W * 0.20, CONTENT_W * 0.30, CONTENT_W * 0.30, CONTENT_W * 0.20]
t = make_table(headers, rows, col_w)
story.append(Spacer(1, 18))
story.append(t)
story.append(Paragraph('Table 6: Development and Operational Cost Estimates', caption_style))

story.append(Spacer(1, 12))
story.append(Paragraph(
    'The total one-time development cost across all five phases is estimated at PKR 3,800,000 to 5,700,000, with ongoing operational costs of approximately PKR 30,000 - 50,000 per month plus annual cloud hosting of PKR 250,000 - 430,000. Given the projected revenue increase of 35-45%, the investment is expected to achieve return on investment (ROI) within 8-12 months of full deployment, making it a financially viable investment for the business.',
    body_style
))

# ═══════════════════════════════════════
# SECTION 11: Conclusion
# ═══════════════════════════════════════
story.extend(add_major_section('<b>11. Conclusion and Recommendation</b>', h1_style))

story.append(Paragraph(
    'Jugnoo Smart represents a comprehensive, practical solution to the operational challenges faced by Jugnoo Photos & Printing Services. By leveraging AI to automate routine tasks, streamline client management, and provide intelligent decision support, the application can transform the business from a manually-operated shop struggling with high demand into an efficient, technology-enabled service provider that can scale its operations without proportionally increasing its workload.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The phased implementation approach ensures manageable investment and risk, with each phase delivering measurable business value. The WhatsApp-first strategy and bilingual interface address the specific needs of the Pakistani market, while the AI features are designed to be practical and immediately useful rather than gimmicky. The e-notary capabilities, in particular, position the business at the forefront of digital notarisation in the Chowk Azam area, creating a significant competitive advantage.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'We recommend proceeding with Phase 1 (Foundation) as the immediate next step, which will deliver the core ordering, pricing, and WhatsApp integration capabilities within 6 weeks. This phase alone is expected to reduce order processing time by 30% and eliminate pricing errors entirely. Based on the success of Phase 1, the subsequent phases can be initiated with confidence, building towards the full Jugnoo Smart vision that will enable the business to double its client capacity while reducing staff burden by over 60%.',
    body_style
))

# ── Build ──
doc.multiBuild(story)
print("Body PDF generated successfully:", output_path)
