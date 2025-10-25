from fpdf import FPDF
from app.models.billing import Invoice
from app.models.order import Order
from app.models.user import UserInDB
from app.core.config import settings
import os

class PDFService:
    def generate_invoice_pdf(self, invoice: Invoice, order: Order, user_email: str) -> str:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Header
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="INVOICE", ln=1, align='C')
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="GitShop Inc.", ln=1, align='C')
        
        pdf.ln(10)
        
        # Details
        pdf.cell(0, 10, txt=f"Invoice ID: {invoice.id}", ln=1)
        pdf.cell(0, 10, txt=f"Order ID: {order.id}", ln=1)
        pdf.cell(0, 10, txt=f"Date: {invoice.created_at.strftime('%Y-%m-%d %H:%M:%S')}", ln=1)
        pdf.cell(0, 10, txt=f"Billed To: {user_email}", ln=1)
        
        pdf.ln(10)
        
        # Table Header
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(100, 10, "Item")
        pdf.cell(30, 10, "Qty")
        pdf.cell(30, 10, "Price")
        pdf.cell(30, 10, "Total")
        pdf.ln(10)
        
        # Items
        pdf.set_font("Arial", size=12)
        for item in order.items:
            # Check if item is dict or object (safety)
            if isinstance(item, dict):
                name = item.get("product_name", "Unknown Product")[:35]
                qty = item.get("quantity", 0)
                price = item.get("price_at_purchase", item.get("price", 0.0))
            else:
                name = getattr(item, "product_name", "Unknown Product")[:35]
                qty = getattr(item, "quantity", 0)
                price = getattr(item, "price_at_purchase", getattr(item, "price", 0.0))
            
            total = qty * price
            
            pdf.cell(100, 10, name)
            pdf.cell(30, 10, str(qty))
            pdf.cell(30, 10, f"${price:.2f}")
            pdf.cell(30, 10, f"${total:.2f}")
            pdf.ln(10)
            
        pdf.ln(10)
        
        # Total
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(160, 10, "Total Amount:", align='R')
        pdf.cell(30, 10, f"${invoice.amount:.2f}", align='L')
        
        # Save
        # Save
        # Make sure directory exists: uploads/invoices/pdfs
        output_dir = os.path.join(settings.UPLOAD_DIR, "invoices", "pdfs")
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"{invoice.id}.pdf"
        output_path = os.path.join(output_dir, filename)
        
        pdf.output(output_path)
        
        # Return relative path for storage
        return f"invoices/pdfs/{filename}"

pdf_service = PDFService()
