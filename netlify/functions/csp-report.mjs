/**
 * Netlify Function: CSP Violation Reporter
 * Recebe relatórios de violação de Content-Security-Policy-Report-Only
 * e loga no console do Netlify (visível em Netlify Dashboard > Functions > Logs)
 */

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const report = JSON.parse(event.body);
    const cspReport = report['csp-report'] || report;

    // Log estruturado para fácil leitura no Netlify Dashboard
    console.log('=== CSP VIOLATION REPORT ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Document URI:', cspReport['document-uri']);
    console.log('Referrer:', cspReport['referrer']);
    console.log('Violated Directive:', cspReport['violated-directive']);
    console.log('Effective Directive:', cspReport['effective-directive']);
    console.log('Blocked URI:', cspReport['blocked-uri']);
    console.log('Source File:', cspReport['source-file']);
    console.log('Line Number:', cspReport['line-number']);
    console.log('Column Number:', cspReport['column-number']);
    console.log('Status Code:', cspReport['status-code']);
    console.log('Original Policy:', cspReport['original-policy']);
    console.log('Sample:', cspReport['sample']);
    console.log('Disposition:', cspReport['disposition']);
    console.log('==============================');

    // Resposta 204 No Content (padrão para CSP reports)
    return { statusCode: 204 };
  } catch (error) {
    console.error('Erro ao processar CSP report:', error);
    return { statusCode: 400, body: 'Bad Request' };
  }
}

export default handler;