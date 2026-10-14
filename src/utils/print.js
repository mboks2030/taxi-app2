/**
 * Print utility for generating printable reports
 */

/**
 * Print a specific report/view by adding printable class and triggering print
 * @param {string} viewId - ID of the element to print (optional, prints page if not specified)
 */
export const printReport = (viewId) => {
    try {
        // Add print class to body to enable print styles
        document.body.classList.add('printing');

        // If viewId specified, mark that element as the print target
        if (viewId) {
            const element = document.getElementById(viewId);
            if (element) {
                element.classList.add('print-target');
            }
        }

        // Use window.print() - works in browser, Electron, and Capacitor WebView
        window.print();

        // Cleanup after print dialog closes (delayed to ensure print completes)
        const cleanup = () => {
            document.body.classList.remove('printing');
            if (viewId) {
                const element = document.getElementById(viewId);
                if (element) {
                    element.classList.remove('print-target');
                }
            }
        };

        // Use onafterprint if available, otherwise timeout fallback
        if (window.onafterprint !== undefined) {
            window.onafterprint = cleanup;
        } else {
            setTimeout(cleanup, 1000);
        }
    } catch (error) {
        console.error('Print failed:', error);
        // Fallback: try html2pdf if available (lazy load)
        fallbackToPdf(viewId);
    }
};

/**
 * Fallback to PDF generation if print fails
 * @param {string} viewId - ID of element to convert to PDF
 */
const fallbackToPdf = async (viewId) => {
    try {
        // Dynamically import html2pdf only if needed
        const html2pdf = (await import('html2pdf.js')).default;

        const element = viewId
            ? document.getElementById(viewId)
            : document.querySelector('.container');

        if (!element) {
            alert('Unable to generate PDF: Report element not found.');
            return;
        }

        const opt = {
            margin: 10,
            filename: `taxi-report-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error('PDF fallback also failed:', err);
        alert('Print is not available. Please try using your browser\'s built-in print function (Ctrl+P / Cmd+P).');
    }
};

export default printReport;
