import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export const generateInvoice = (order: any) => {
    const doc = new jsPDF();

    // 1. Header & Branding
    doc.setFillColor(16, 185, 129); // Emerald-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('VegFrash Store', 15, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Fresh Produce Delivered', 15, 32);

    // 2. Invoice Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(18);
    doc.text('INVOICE', 160, 60);

    doc.setFontSize(10);
    doc.text(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`, 160, 68);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 160, 73);

    // 3. Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 60);
    doc.setFont('helvetica', 'normal');

    const address = order.delivery_address_snapshot || {};
    doc.text(address.name || 'Customer', 15, 68);
    doc.text(address.phone || 'No Phone', 15, 73);
    doc.text(address.address_line || '-', 15, 78);
    doc.text(`${address.city || ''} ${address.pincode || ''}`, 15, 83);

    // 4. Items Table
    const tableData = order.items.map((item: any) => [
        item.name,
        `${item.quantity} ${item.unit || 'kg'}`,
        `result ₹${item.price}`,
        `result ₹${(item.price * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 95,
        head: [['Product', 'Quantity', 'Price', 'Subtotal']],
        body: tableData,
        headStyles: { fillStyle: [16, 185, 129], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 250, 248] },
        margin: { left: 15, right: 15 }
    });

    // 5. Totals
    const finalY = (doc as any).lastAutoTable.cursor.y + 10;

    doc.setFontSize(10);
    doc.text('Subtotal:', 140, finalY);
    doc.text(`₹${(order.total_amount + (order.discount_amount || 0)).toLocaleString()}`, 175, finalY, { align: 'right' });

    if (order.discount_amount) {
        doc.setTextColor(16, 185, 129);
        doc.text('Discount:', 140, finalY + 7);
        doc.text(`-₹${order.discount_amount.toLocaleString()}`, 175, finalY + 7, { align: 'right' });
    }

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', 140, finalY + 16);
    doc.text(`₹${order.total_amount.toLocaleString()}`, 175, finalY + 16, { align: 'right' });

    // 6. Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping at VegFrash!', 105, 285, { align: 'center' });

    // Save
    doc.save(`invoice_${order.id.slice(0, 8)}.pdf`);
};
