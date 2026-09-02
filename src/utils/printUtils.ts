/**
 * Utilitário robusto de impressão e geração de documento PDF
 * Funciona de forma transparente tanto em navegadores normais quanto dentro de iFrames / WebViews
 */

export function printDocument(elementId: string, documentTitle: string = 'Documento - Andreia Bordados') {
  const element = document.getElementById(elementId);
  if (!element) {
    // Fallback padrão se não encontrar o elemento
    window.print();
    return;
  }

  // Clona o elemento para capturar exatamente o conteúdo renderizado com estilos
  const clonedContent = element.innerHTML;

  // Cria um iframe oculto dedicado para a impressão isolada
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  printIframe.title = documentTitle;

  document.body.appendChild(printIframe);

  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  // Copia todas as folhas de estilo da aplicação para dentro do iframe de impressão
  const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('\n');

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
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
            padding: 0 !important;
            margin: 0 !important;
            line-height: 1.4;
          }
          .print-card {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            padding: 12px 16px !important;
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
            image-rendering: auto;
          }
        </style>
      </head>
      <body>
        <div class="printable-wrapper" style="width: 100%; max-width: 800px; margin: 0 auto;">
          ${clonedContent}
        </div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Aguarda o carregamento das fontes e imagens antes de acionar a impressão
  setTimeout(() => {
    try {
      if (printIframe.contentWindow) {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } else {
        window.print();
      }
    } catch (e) {
      console.warn('Erro ao disparar impressão no iframe, chamando window.print fallback:', e);
      window.print();
    } finally {
      // Remove o iframe temporário após a impressão
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 2000);
    }
  }, 350);
}
