/**
 * Shared Tax Invoice Printer / PDF Downloader
 * Opens a print-formatted invoice window and triggers the browser print dialog
 */
export function printOrderInvoice(order, storeName = 'Vwalah') {
  if (!order) return;

  const orderNum = order.order_number || order.id || 'N/A';
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN');

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items.length > 0
    ? items.map((it, idx) => {
        const unitPrice = parseFloat(it.price ?? it.unit_price ?? it.selling_price ?? 0);
        const qty = parseInt(it.quantity, 10) || 1;
        const total = unitPrice * qty;
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
              <strong style="color: #111;">${it.product_name || 'Handcrafted Heritage Jewellery'}</strong>
              ${it.variant_name ? `<br/><small style="color: #6b7280;">Variant: ${it.variant_name}</small>` : ''}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">7117</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${unitPrice.toLocaleString('en-IN')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111;">₹${total.toLocaleString('en-IN')}</td>
          </tr>
        `;
      }).join('')
    : `<tr><td colspan="6" style="padding: 14px; text-align: center; color: #6b7280;">Item details recorded in system</td></tr>`;

  const subtotal = Number(order.subtotal || order.total_amount || 0);
  const discount = Number(order.discount || 0);
  const total = Number(order.total_amount || 0);

  const invoiceContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Tax Invoice - #${orderNum}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1f2937;
          background: #ffffff;
          margin: 0;
          padding: 24px;
          font-size: 13px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #996515;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .brand-title {
          font-family: Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          color: #420833;
          letter-spacing: 0.05em;
          margin: 0 0 4px;
        }
        .brand-tag {
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .inv-title {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin: 0 0 6px;
          text-align: right;
        }
        .inv-meta {
          text-align: right;
          font-size: 12px;
          color: #4b5563;
        }
        .grid-two {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 20px;
        }
        .box {
          flex: 1;
          background: #fdfbf7;
          border: 1px solid #f3ebe0;
          border-radius: 8px;
          padding: 14px 16px;
        }
        .box h4 {
          margin: 0 0 8px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #996515;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #f9fafb;
          color: #374151;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .summary-table {
          width: 320px;
          margin-left: auto;
          border-collapse: collapse;
        }
        .summary-table td {
          padding: 6px 10px;
        }
        .grand-total {
          border-top: 2px solid #996515;
          font-size: 16px;
          font-weight: 700;
          color: #420833;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 14px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #6b7280;
        }
        .stamp {
          text-align: right;
          font-weight: 600;
          color: #996515;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-title">${storeName || 'Vwalah'}</div>
          <div class="brand-tag">Heirloom Handcrafted Jewellery · Certified Craft</div>
          <p style="margin: 6px 0 0; color: #4b5563; font-size: 11px;">
            Registered Artisan Workshop · GSTIN: 33AAACT0142J1Z8<br/>
            Support: care@vwalah.com | +91 98765 43210
          </p>
        </div>
        <div>
          <div class="inv-title">TAX INVOICE</div>
          <div class="inv-meta">
            <div><strong>Invoice No:</strong> INV-${orderNum}</div>
            <div><strong>Order No:</strong> #${orderNum}</div>
            <div><strong>Date:</strong> ${orderDate}</div>
            <div><strong>Payment Mode:</strong> ${(order.payment_method || 'Online Prepaid').toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div class="grid-two">
        <div class="box">
          <h4>Billed &amp; Shipped To:</h4>
          <strong>${order.customer_name || 'Valued Patron'}</strong><br/>
          ${order.customer_email ? `${order.customer_email}<br/>` : ''}
          ${order.customer_phone ? `Phone: ${order.customer_phone}<br/>` : ''}
          <div style="margin-top: 4px; color: #4b5563;">
            ${order.shipping_address || 'Customer Delivery Address'}
          </div>
        </div>
        <div class="box">
          <h4>Consignment &amp; Logistics:</h4>
          <div><strong>Status:</strong> ${order.order_status || order.status || 'Confirmed'}</div>
          <div><strong>Courier Partner:</strong> ${order.tracking_carrier || 'BlueDart Express'}</div>
          <div><strong>Tracking Docket:</strong> ${order.tracking_number || 'BD-' + orderNum}</div>
          <div><strong>Dispatch Date:</strong> ${orderDate}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: left;">Item Description</th>
            <th style="width: 80px; text-align: center;">HSN</th>
            <th style="width: 60px; text-align: center;">Qty</th>
            <th style="width: 100px; text-align: right;">Unit Price</th>
            <th style="width: 110px; text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <table class="summary-table">
        <tr>
          <td style="color: #6b7280;">Item Subtotal:</td>
          <td style="text-align: right; font-weight: 500;">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${discount > 0 ? `
          <tr>
            <td style="color: #16a34a;">Promotional Discount:</td>
            <td style="text-align: right; color: #16a34a; font-weight: 500;">- ₹${discount.toLocaleString('en-IN')}</td>
          </tr>
        ` : ''}
        <tr>
          <td style="color: #6b7280;">Express Insured Transit:</td>
          <td style="text-align: right; font-weight: 500; color: #16a34a;">COMPLIMENTARY</td>
        </tr>
        <tr class="grand-total">
          <td>Grand Total:</td>
          <td style="text-align: right;">₹${total.toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <div class="footer">
        <div>
          <p style="margin: 0 0 4px;">Thank you for preserving timeless heritage craft with us.</p>
          <p style="margin: 0; font-size: 10px;">This is a computer-generated tax invoice. No physical signature is required.</p>
        </div>
        <div class="stamp">
          ✓ Genuine Heritage Certified<br/>
          ${storeName || 'Vwalah'}
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=840,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  }
}

