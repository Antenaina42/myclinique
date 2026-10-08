/**
 * Utilitaire d'impression pour imprimante de ticket thermique (80mm)
 * Compatible Epson TM-T20, TM-T88, Star Micronics, Xprinter, etc.
 * Utilise les données dynamiques de la clinique stockées en base de données.
 */

export interface ThermalReceiptItem {
  medicineName: string;
  dosage?: string | null;
  form?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ThermalReceiptData {
  clinic: {
    name?: string | null;
    slogan?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    taxId?: string | null;
    currency?: string | null;
  };
  saleNumber: string;
  saleDate: string | Date;
  cashierName?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  paymentMethod: string;
  paymentReference?: string | null;
  items: ThermalReceiptItem[];
  subtotal: number;
  discount?: number | null;
  total: number;
  cashTendered?: number | string | null;
  changeDue?: number | string | null;
}

export function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'CASH':
      return 'Espèces (Cash)';
    case 'MOBILE_MONEY':
      return 'Mobile Money';
    case 'CREDIT_CARD':
      return 'Carte Bancaire';
    case 'BANK_TRANSFER':
      return 'Virement Bancaire';
    default:
      return method || 'Espèces';
  }
}

export function formatReceiptMoney(amount: number | null | undefined, currency: string = 'Ar'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return `0 ${currency}`;
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Number(amount));
  return `${formatted} ${currency}`;
}

export function formatReceiptDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

/**
 * Génère le code HTML pur optimisé pour imprimante de ticket thermique 80mm
 */
export function generateThermalReceiptHtml(data: ThermalReceiptData): string {
  const currency = data.clinic?.currency || 'Ar';
  const clinicName = data.clinic?.name || 'CLINIQUE MÉDICALE';
  const clinicSlogan = data.clinic?.slogan || 'Pharmacie & Soins Médicaux';
  const clinicAddress = data.clinic?.address || '';
  const clinicPhone = data.clinic?.phone || '';
  const clinicTax = data.clinic?.taxId || '';
  const clinicEmail = data.clinic?.email || '';
  const clinicWebsite = data.clinic?.website || '';

  const cashier = data.cashierName || 'Caisse Pharmacie';
  const customer = data.customerName || 'Client de passage';
  const dateStr = formatReceiptDateTime(data.saleDate);
  const paymentStr = formatPaymentMethod(data.paymentMethod);

  const subtotal = Number(data.subtotal || 0);
  const discount = Number(data.discount || 0);
  const total = Number(data.total || 0);
  const cashTendered = data.cashTendered ? Number(data.cashTendered) : null;
  const changeDue = data.changeDue ? Number(data.changeDue) : null;

  const totalQuantity = (data.items || []).reduce((acc, item) => acc + item.quantity, 0);

  // Lignes d'articles
  const itemsHtml = (data.items || [])
    .map((it) => {
      const unit = formatReceiptMoney(it.unitPrice, currency);
      const lineTotal = formatReceiptMoney(it.totalPrice, currency);
      return `
        <div class="item-row">
          <div class="item-name">${escapeHtml(it.medicineName)}</div>
          <div class="item-details">
            <span class="item-qty-pu">${it.quantity} x ${unit}</span>
            <span class="item-total">${lineTotal}</span>
          </div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Ticket - ${escapeHtml(data.saleNumber)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: 'Courier New', Courier, Consolas, Monaco, monospace;
      font-size: 11.5px;
      line-height: 1.35;
      font-weight: 500;
      width: 80mm;
      max-width: 80mm;
    }
    .ticket-container {
      width: 72mm;
      margin: 0 auto;
      padding: 5mm 1.5mm 12mm 1.5mm;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }

    /* Header Clinique */
    .clinic-title {
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.3px;
      line-height: 1.25;
      margin-bottom: 2px;
    }
    .clinic-slogan {
      font-size: 10px;
      font-style: italic;
      margin-bottom: 4px;
    }
    .clinic-meta {
      font-size: 10px;
      line-height: 1.3;
    }
    .clinic-tax {
      font-size: 9.5px;
      margin-top: 2px;
      font-weight: bold;
    }

    /* Lignes de séparation thermiques */
    .sep-solid {
      border-top: 1px solid #000;
      margin: 5px 0;
    }
    .sep-double {
      border-top: 3px double #000;
      margin: 6px 0;
    }
    .sep-dashed {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }

    /* En-tête Ticket */
    .ticket-badge {
      display: inline-block;
      border: 1px solid #000;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 3px 0;
    }
    .info-table {
      width: 100%;
      font-size: 10.5px;
      border-collapse: collapse;
      margin: 3px 0;
    }
    .info-table td {
      padding: 1px 0;
      vertical-align: top;
    }
    .info-label {
      width: 32%;
      color: #000;
    }
    .info-val {
      width: 68%;
      font-weight: 600;
    }

    /* Articles */
    .items-header {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 0;
    }
    .item-row {
      margin-bottom: 5px;
      page-break-inside: avoid;
    }
    .item-name {
      font-weight: bold;
      font-size: 11px;
      word-break: break-word;
    }
    .item-details {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      padding-left: 6px;
    }
    .item-qty-pu {
      color: #000;
    }
    .item-total {
      font-weight: bold;
    }

    /* Totaux financiers */
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0;
    }
    .totals-table td {
      padding: 1.5px 0;
    }
    .net-box {
      border: 2px solid #000;
      padding: 4px 6px;
      margin: 4px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 900;
    }

    /* Pied de ticket */
    .barcode-container {
      margin: 8px 0 4px 0;
      text-align: center;
    }
    .barcode-svg {
      width: 190px;
      height: 38px;
      margin: 0 auto;
      display: block;
    }
    .barcode-text {
      font-size: 10px;
      letter-spacing: 2px;
      font-weight: bold;
      margin-top: 2px;
    }
    .disclaimer {
      font-size: 9px;
      line-height: 1.35;
      margin-top: 4px;
    }
    .thanks {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 6px 0 2px 0;
    }
    .cut-guide {
      text-align: center;
      font-size: 8px;
      color: #333;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <!-- CLINIC HEADER (DYNAMIC) -->
    <div class="text-center">
      <div class="clinic-title uppercase">${escapeHtml(clinicName)}</div>
      ${clinicSlogan ? `<div class="clinic-slogan">${escapeHtml(clinicSlogan)}</div>` : ''}
      ${clinicAddress ? `<div class="clinic-meta">${escapeHtml(clinicAddress)}</div>` : ''}
      ${clinicPhone ? `<div class="clinic-meta">Tél : ${escapeHtml(clinicPhone)}</div>` : ''}
      ${clinicEmail ? `<div class="clinic-meta">${escapeHtml(clinicEmail)}</div>` : ''}
      ${clinicTax ? `<div class="clinic-tax">${escapeHtml(clinicTax)}</div>` : ''}
      ${clinicWebsite ? `<div class="clinic-meta">${escapeHtml(clinicWebsite)}</div>` : ''}
    </div>

    <div class="sep-double"></div>

    <!-- TICKET METADATA -->
    <div class="text-center">
      <div class="ticket-badge">REÇU DE PHARMACIE</div>
    </div>

    <table class="info-table">
      <tr>
        <td class="info-label">Ticket N°</td>
        <td class="info-val">: ${escapeHtml(data.saleNumber)}</td>
      </tr>
      <tr>
        <td class="info-label">Date</td>
        <td class="info-val">: ${escapeHtml(dateStr)}</td>
      </tr>
      <tr>
        <td class="info-label">Caissier</td>
        <td class="info-val">: ${escapeHtml(cashier)}</td>
      </tr>
      <tr>
        <td class="info-label">Client</td>
        <td class="info-val">: ${escapeHtml(customer)}</td>
      </tr>
      ${data.customerPhone ? `
      <tr>
        <td class="info-label">Contact</td>
        <td class="info-val">: ${escapeHtml(data.customerPhone)}</td>
      </tr>` : ''}
      <tr>
        <td class="info-label">Règlement</td>
        <td class="info-val">: ${escapeHtml(paymentStr)}</td>
      </tr>
      ${data.paymentReference ? `
      <tr>
        <td class="info-label">Réf. Trans.</td>
        <td class="info-val">: ${escapeHtml(data.paymentReference)}</td>
      </tr>` : ''}
    </table>

    <div class="sep-dashed"></div>

    <!-- ITEMS BREAKDOWN -->
    <div class="items-header">
      <span>DÉSIGNATION / QTÉ x P.U</span>
      <span>TOTAL</span>
    </div>
    <div class="sep-solid"></div>

    <div class="items-list">
      ${itemsHtml}
    </div>

    <div class="sep-dashed"></div>

    <!-- TOTALS -->
    <table class="totals-table">
      <tr>
        <td>Nombre d'articles :</td>
        <td class="text-right bold">${totalQuantity}</td>
      </tr>
      <tr>
        <td>Sous-total :</td>
        <td class="text-right">${formatReceiptMoney(subtotal, currency)}</td>
      </tr>
      ${discount > 0 ? `
      <tr>
        <td>Remise accordée :</td>
        <td class="text-right bold">- ${formatReceiptMoney(discount, currency)}</td>
      </tr>` : ''}
    </table>

    <div class="net-box">
      <span>NET À PAYER :</span>
      <span>${formatReceiptMoney(total, currency)}</span>
    </div>

    ${cashTendered !== null && cashTendered > 0 ? `
    <table class="totals-table" style="font-size: 10.5px;">
      <tr>
        <td>Montant versé :</td>
        <td class="text-right">${formatReceiptMoney(cashTendered, currency)}</td>
      </tr>
      <tr>
        <td>Monnaie rendue :</td>
        <td class="text-right bold">${formatReceiptMoney(changeDue || 0, currency)}</td>
      </tr>
    </table>
    ` : ''}

    <div class="sep-dashed"></div>

    <!-- CODE-BARRES VISUEL -->
    <div class="barcode-container">
      ${generateBarcodeSvg(data.saleNumber)}
      <div class="barcode-text">*${escapeHtml(data.saleNumber)}*</div>
    </div>

    <!-- FOOTER MENTIONS -->
    <div class="text-center">
      <div class="thanks">★ MERCI DE VOTRE VISITE ★</div>
      <div style="font-weight: bold; font-size: 10.5px; margin-bottom: 4px;">Bon rétablissement !</div>
      <div class="disclaimer">
        Les médicaments ne sont ni repris ni échangés.<br>
        Conserver hors de portée des enfants (&lt; 25°C).
      </div>
      <div class="sep-dashed" style="margin: 6px auto; width: 60%;"></div>
      <div style="font-size: 8.5px; color: #444;">
        My Clinique • Système de Gestion Médicale Connecté
      </div>
    </div>

    <div class="cut-guide">----------------- DÉCOUPE TICKET -----------------</div>
  </div>
</body>
</html>`;
}

/**
 * Lance l'impression isolée sur l'imprimante ticket sans afficher les boutons ni l'interface du dashboard
 */
export function printThermalReceipt(data: ThermalReceiptData): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Supprimer tout ancien iframe d'impression thermique
    const existingFrame = document.getElementById('thermal-receipt-iframe');
    if (existingFrame) {
      existingFrame.remove();
    }

    // Créer une iframe isolée
    const iframe = document.createElement('iframe');
    iframe.id = 'thermal-receipt-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = '100mm';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      resolve(false);
      return;
    }

    const htmlContent = generateThermalReceiptHtml(data);
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Attendre que le contenu de l'iframe soit rendu puis imprimer
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        resolve(true);
      } catch (err) {
        console.error('Thermal print error:', err);
        // Fallback print
        window.print();
        resolve(false);
      }
    }, 280);
  });
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Génère un SVG de code-barres net et compatible avec les têtes d'impression thermique
 */
function generateBarcodeSvg(text: string): string {
  const bars: Array<{ x: number; w: number }> = [];
  let currentX = 10;
  const hash = (text || 'VTE').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Génération de barres pseudo-code 128 avec barres de garde
  // Guard bars
  bars.push({ x: currentX, w: 2 });
  currentX += 4;
  bars.push({ x: currentX, w: 2 });
  currentX += 4;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const w1 = (code % 3) + 1;
    const s1 = ((code + i) % 2) + 2;
    const w2 = ((code * 2) % 3) + 1;
    const s2 = ((code + hash) % 3) + 2;

    bars.push({ x: currentX, w: w1 });
    currentX += w1 + s1;
    bars.push({ x: currentX, w: w2 });
    currentX += w2 + s2;
  }

  // End guard bars
  bars.push({ x: currentX, w: 2 });
  currentX += 4;
  bars.push({ x: currentX, w: 2 });
  currentX += 10;

  const rects = bars
    .map((b) => `<rect x="${b.x}" y="0" width="${b.w}" height="36" fill="#000" />`)
    .join('');

  return `<svg viewBox="0 0 ${currentX} 36" class="barcode-svg" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}
