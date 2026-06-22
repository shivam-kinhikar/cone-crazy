const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Settings = require('../models/Settings');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const fetchImageToBuffer = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    return null;
  }
};

const generateInvoice = async (order) => {
  const invoiceCount = await Invoice.countDocuments();
  const settings = await Settings.findOne() || {};
  const invoicePrefix = settings.invoicePrefix || 'INV-';
  const invoiceNumber = `${invoicePrefix}${(invoiceCount + 1).toString().padStart(3, '0')}`;
  
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const pdfFilename = `INV-${Date.now()}-${invoiceCount + 1}.pdf`;
  const invoicesDir = path.join(__dirname, '../../public/invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  const pdfPath = path.join(invoicesDir, pdfFilename);
  
  doc.pipe(fs.createWriteStream(pdfPath));
  
  // Colors
  const ORANGE = '#c34614';
  const DARK = '#333333';
  const LIGHT = '#666666';
  const BG = '#ffffff';
  
  // Background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG);

  const storeName = settings.storeName || 'CONE CRAZY';
  const storeAddress = settings.address || '123 Dessert Lane\nSweet City';
  const storePhone = settings.phone || '9876543210';
  const storeEmail = settings.email || 'hello@conecrazy.com';

  // LOGO & HEADER
  const logoPath = path.join(__dirname, '../../../frontend/public/favicon.png');
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 40, 35, { width: 55 });
    } catch(e) {}
  }
  
  // Try to split storeName into two lines if it's two words for the logo block
  let logoTitle = storeName.toUpperCase();
  if (storeName.split(' ').length === 2) {
    logoTitle = storeName.split(' ').join('\n').toUpperCase();
  }
  
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(24).text(logoTitle, 105, 45, { lineGap: -5 });
  doc.fillColor(LIGHT).font('Helvetica').fontSize(8).text('SWEET MOMENTS, EVERY TIME.', 105, 95);

  // Vertical Separator
  doc.moveTo(230, 45).lineTo(230, 100).lineWidth(1).strokeColor('#dddddd').stroke();

  doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(36).text('INVOICE', 250, 55);

  // Top Right Info Box
  doc.roundedRect(430, 40, 120, 25, 3).fill(ORANGE);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text(invoiceNumber, 430, 46, { width: 120, align: 'center' });

  // Dates
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  doc.fillColor(LIGHT).font('Helvetica').fontSize(10);
  doc.text(`Invoice Date  :   ${invoiceDate}`, 410, 75);
  doc.text(`Due Date       :   ${dueDate}`, 410, 95);

  // FROM / TO section
  doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(10);
  doc.text('FROM', 40, 150);
  doc.text('BILL TO', 300, 150);

  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12);
  doc.text(storeName.toUpperCase(), 40, 165);
  doc.fillColor(LIGHT).font('Helvetica').fontSize(10);
  doc.text(`${storeAddress}\n${storePhone}\n${storeEmail}`, 40, 180, { lineGap: 3 });

  let customerName = 'Walk-in Customer';
  let customerPhone = '';
  if (order.customerId) {
    const customer = await Customer.findById(order.customerId);
    if (customer) {
      customerName = customer.name;
      customerPhone = customer.mobile;
    }
  }
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12);
  doc.text(customerName, 300, 165);
  doc.fillColor(LIGHT).font('Helvetica').fontSize(10);
  if (customerPhone) doc.text(customerPhone, 300, 180);

  // Top Dotted Line
  doc.moveTo(40, 250).lineTo(550, 250).lineWidth(1).strokeColor('#dddddd').dash(2, 2).stroke();
  doc.undash();

  // Table Header
  doc.rect(40, 265, 510, 30).fill(ORANGE);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11);
  doc.text('DESCRIPTION', 55, 275);
  doc.text('QTY', 280, 275, { width: 50, align: 'center' });
  doc.text('RATE', 380, 275, { width: 70, align: 'center' });
  doc.text('AMOUNT', 460, 275, { width: 75, align: 'right' });

  // Alternating background logic for rows
  const rowColor = '#fffaf4'; 

  // Fetch all product images
  const itemIds = order.items.map(i => i.productId);
  const products = await Product.find({ _id: { $in: itemIds } });
  
  let y = 310;
  
  for (const item of order.items) {
    if ((y - 310) / 45 % 2 === 1) {
      doc.rect(40, y - 5, 510, 45).fill('#fdfbf8');
    }
    
    const product = products.find(p => p._id.toString() === item.productId.toString());
    let imgBuffer = null;
    if (product && product.imageUrl) {
      imgBuffer = await fetchImageToBuffer(product.imageUrl);
    }

    doc.fillColor(DARK).font('Helvetica').fontSize(10);
    
    doc.circle(70, y + 17, 15).lineWidth(1).strokeColor(ORANGE).stroke();
    
    if (imgBuffer) {
      try {
        doc.save();
        doc.circle(70, y + 17, 14).clip();
        doc.image(imgBuffer, 56, y + 3, { width: 28, height: 28 });
        doc.restore();
      } catch(e) {}
    }
    
    doc.text(item.productName, 100, y + 13);
    doc.text(item.quantity.toString(), 280, y + 13, { width: 50, align: 'center' });
    doc.text(`Rs. ${Number(item.unitPrice).toFixed(2)}`, 380, y + 13, { width: 70, align: 'center' });
    doc.font('Helvetica-Bold').text(`Rs. ${Number(item.totalPrice).toFixed(2)}`, 460, y + 13, { width: 75, align: 'right' });
    
    doc.moveTo(270, y - 5).lineTo(270, y + 40).lineWidth(1).strokeColor('#f1e8e0').dash(2, 2).stroke();
    doc.moveTo(370, y - 5).lineTo(370, y + 40).lineWidth(1).strokeColor('#f1e8e0').dash(2, 2).stroke();
    doc.moveTo(460, y - 5).lineTo(460, y + 40).lineWidth(1).strokeColor('#f1e8e0').dash(2, 2).stroke();
    
    doc.moveTo(40, y + 40).lineTo(550, y + 40).lineWidth(1).strokeColor('#f1e8e0').dash(2, 2).stroke();
    doc.undash();
    
    y += 45;
  }
  
  doc.moveTo(40, y + 5).lineTo(550, y + 5).lineWidth(1.5).strokeColor(ORANGE).stroke();
  y += 20;

  doc.fillColor(ORANGE).font('Times-Italic').fontSize(36).text('Thank', 50, y - 5);
  doc.text('you!', 60, y + 25);
  
  doc.fillColor(LIGHT).font('Helvetica').fontSize(10);
  doc.text('We appreciate your business', 150, y + 10);
  doc.text('and look forward to', 150, y + 25);
  doc.text('serving you again.', 150, y + 40);

  const totalY = y;
  doc.fillColor(LIGHT).font('Helvetica').fontSize(10);
  doc.text('Subtotal', 330, totalY);
  doc.fillColor(DARK).text(`Rs. ${Number(order.subtotal).toFixed(2)}`, 450, totalY, { width: 100, align: 'right' });
  
  doc.moveTo(330, totalY + 15).lineTo(550, totalY + 15).lineWidth(1).strokeColor('#dddddd').stroke();
  
  doc.fillColor(LIGHT).text('Discount', 330, totalY + 20);
  doc.fillColor(DARK).text(`-Rs. ${Number(order.discountAmount).toFixed(2)}`, 450, totalY + 20, { width: 100, align: 'right' });

  doc.moveTo(330, totalY + 35).lineTo(550, totalY + 35).lineWidth(1).strokeColor('#dddddd').stroke();

  doc.fillColor(LIGHT).text(`Tax (${order.taxAmount > 0 ? 'Inc.' : '0%'})`, 330, totalY + 40);
  doc.fillColor(DARK).text(`Rs. ${Number(order.taxAmount).toFixed(2)}`, 450, totalY + 40, { width: 100, align: 'right' });

  doc.rect(320, totalY + 60, 230, 30).fill(ORANGE);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16);
  doc.text('TOTAL', 335, totalY + 68);
  doc.text(`Rs. ${Number(order.totalAmount).toFixed(2)}`, 430, totalY + 68, { width: 110, align: 'right' });

  doc.roundedRect(40, 750, 510, 30, 3).fill('#f9f2e8');
  doc.fillColor(LIGHT).font('Helvetica').fontSize(9);
  
  const singleLineAddress = storeAddress.replace(/\n/g, ', ').substring(0, 35);
  doc.text(singleLineAddress, 60, 762);
  doc.text(storePhone, 260, 762);
  doc.text(storeEmail, 360, 762);

  doc.fillColor('#a0a0a0').font('Helvetica-Oblique').fontSize(8);
  doc.text('This is a computer generated invoice and does not require a signature.', 40, 790, { align: 'center', width: 510 });

  doc.end();

  const pdfUrl = `/invoices/${pdfFilename}`;
  const invoice = await Invoice.create({
    invoiceNumber,
    orderId: order._id,
    customerId: order.customerId,
    totalAmount: order.totalAmount,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    pdfUrl
  });
  
  return invoice;
};

const getInvoices = async () => {
  return await Invoice.find().sort({ createdAt: -1 });
};

const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id).populate('orderId');
  if (!invoice) throw new Error('Invoice not found');
  return invoice;
};

module.exports = { generateInvoice, getInvoices, getInvoiceById };
