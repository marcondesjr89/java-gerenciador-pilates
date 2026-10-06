package br.com.gerenciadorpilates.students.application;

/**
 * Porta de aplicacao responsavel por assinar digitalmente documentos PDF.
 */
public interface PdfDigitalSigner {

    /**
     * Retorna os metadados ativos do certificado/assinador configurado.
     */
    DigitalSignatureMetadata getActiveMetadata();

    /**
     * Assina digitalmente o conteudo em bytes do PDF (padrao PAdES / PKCS#7).
     * Caso a assinatura esteja desabilitada ou nao configurada, retorna os bytes originais.
     */
    byte[] signPdf(byte[] pdfBytes);
}
