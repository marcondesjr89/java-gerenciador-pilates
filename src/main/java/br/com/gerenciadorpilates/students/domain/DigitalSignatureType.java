package br.com.gerenciadorpilates.students.domain;

/**
 * Niveis de assinatura eletronica e digital conforme a Lei Federal nº 14.063/2020
 * e a Infraestrutura de Chaves Publicas Brasileira (ICP-Brasil / MP nº 2.200-2/2001).
 */
public enum DigitalSignatureType {
    /**
     * Assinatura Eletronica Simples (Art. 4º, I, Lei 14.063/2020):
     * Registro eletronico com auditoria de IP, sessao tecnica, data/hora e hash de integridade SHA-256.
     */
    SIMPLE("Simples (Registro Eletronico)", "Lei Federal nº 14.063/2020, Art. 4º, I"),

    /**
     * Assinatura Eletronica Avancada (Art. 4º, II, Lei 14.063/2020):
     * Assinada digitalmente com certificado digital corporativo/institucional e chave assimetrica exclusiva.
     */
    ADVANCED("Avancada (Certificado Institucional)", "Lei Federal nº 14.063/2020, Art. 4º, II"),

    /**
     * Assinatura Eletronica Qualificada (Art. 4º, III, Lei 14.063/2020):
     * Assinada digitalmente com certificado digital credenciado na ICP-Brasil (Padrao A1/A3).
     */
    QUALIFIED("Qualificada (ICP-Brasil)", "Lei Federal nº 14.063/2020, Art. 4º, III e MP nº 2.200-2/2001 (ICP-Brasil)");

    private final String description;
    private final String legalBasis;

    DigitalSignatureType(String description, String legalBasis) {
        this.description = description;
        this.legalBasis = legalBasis;
    }

    public String getDescription() {
        return description;
    }

    public String getLegalBasis() {
        return legalBasis;
    }
}
