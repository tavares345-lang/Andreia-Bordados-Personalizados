/**
 * Utilitário robusto de impressão e geração de documento PDF
 * Funciona de forma transparente em navegadores normais, em novas abas e dentro de iFrames / WebViews
 */

export function generatePrintableHtml(elementId: string, documentTitle: string = 'Documento - Andreia Bordados'): string {
  const element = document.getElementById(elementId);
  const content = element ? element.innerHTML : '<p>Conteúdo não encontrado</p>';

  const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>${documentTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    ${styleSheets}
    <style>
      @page {
        size: A4;
        margin: 12mm 15mm;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box;
      }
      body {
        background-color: #ffffff !important;
        color: #0f172a !important;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
        padding: 20px !important;
        margin: 0 !important;
        line-height: 1.4;
      }
      .print-card {
        background-color: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 8px !important;
        padding: 14px 18px !important;
        margin-bottom: 14px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .print-avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .print\\:hidden, button, input:not([type="checkbox"]), select, nav, aside {
        display: none !important;
      }
      img {
        max-width: 100% !important;
      }
    </style>
  </head>
  <body>
    <div style="width: 100%; max-width: 850px; margin: 0 auto;">
      ${content}
    </div>
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      };
    </script>
  </body>
</html>`;
}

export function openPrintInNewTab(elementId: string, documentTitle: string = 'Documento - Andreia Bordados') {
  try {
    const fullHtml = generatePrintableHtml(elementId, documentTitle);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) {
      // Se popup for bloqueado, tenta window.print() direto
      window.print();
    }
  } catch (error) {
    console.error('Erro ao abrir nova aba para impressão:', error);
    window.print();
  }
}

export function printDocument(elementId: string, documentTitle: string = 'Documento - Andreia Bordados') {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  try {
    // Tenta primeiro abrir em nova aba para garantir suporte a PDF
    openPrintInNewTab(elementId, documentTitle);
  } catch (e) {
    console.warn('Fallback para window.print:', e);
    window.print();
  }
}
