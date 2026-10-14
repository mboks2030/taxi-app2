import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const shareReport = async (elementId, title = 'Report') => {
    let pdfDoc = null;
    const fileName = `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error('Share error: Element not found - ' + elementId);
            return false;
        }

        // Create Canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Convert to PDF
        pdfDoc = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdfWidth = pdfDoc.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        // Get Base64
        const base64Data = pdfDoc.output('datauristring').split(',')[1];

        // Write to file system (Required for Android sharing)
        const result = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
        });

        // Share via Native Share Sheet
        await Share.share({
            title: title,
            text: `Here is your ${title}`,
            files: [result.uri], // Uses 'files' for Android compatibility
            dialogTitle: 'Share Report'
        });

        return true;
    } catch (error) {
        console.error('Error sharing report:', error);

        // Fallback: Download PDF if native share fails (Desktop/Browser behavior)
        if (pdfDoc) {
            try {
                pdfDoc.save(fileName);
                return true;
            } catch (e) {
                console.error('Fallback download failed:', e);
            }
        }

        alert('Share failed: ' + error.message);
        return false;
    }
};
