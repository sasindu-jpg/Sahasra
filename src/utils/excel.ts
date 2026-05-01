import * as XLSX from 'xlsx';
import { OrderData } from '../services/gemini';

export function exportToExcel(orders: OrderData[]) {
  const worksheet = XLSX.utils.json_to_sheet(orders.map(order => ({
    'ORDER NUMBER': order.orderNumber,
    'CUSTOMER NAME': order.customerName,
    'ADDRESS': order.address,
    'ORDER DESCRIPTION': order.orderDescription,
    'PHONE NUMBER 1': order.phone1,
    'PHONE NUMBER 2': order.phone2,
    'COD AMOUNT': order.codAmount
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  
  // Clean filename with timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `ORDERS_EXPORT_${dateStr}.xlsx`);
}
