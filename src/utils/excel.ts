import * as XLSX from 'xlsx';
import { OrderData } from '../services/gemini';

export function exportToExcel(orders: OrderData[]) {
  const worksheet = XLSX.utils.json_to_sheet(orders.map(order => ({
    'ORDER NUMBER': order.orderNumber,
    'CUSTOMER NAME': order.customerName,
    'ADDRES': order.address,
    'ORDER DESCRIPTION': order.orderDescription,
    'CUSTOMER FIRST PHONE NO': order.phone1,
    'CUSTOMER SECOND PHONE NO': order.phone2,
    'COD AMOUNT': order.codAmount,
    'CITY': order.city,
    'REMARKS': order.remarks
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  
  // Clean filename with timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `ORDERS_EXPORT_${dateStr}.xlsx`);
}
