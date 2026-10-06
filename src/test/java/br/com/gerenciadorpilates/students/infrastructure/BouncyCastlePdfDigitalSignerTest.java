package br.com.gerenciadorpilates.students.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.gerenciadorpilates.students.application.DigitalSignatureMetadata;
import br.com.gerenciadorpilates.students.application.DigitalSignatureProperties;
import br.com.gerenciadorpilates.students.domain.DigitalSignatureType;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.Certificate;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

class BouncyCastlePdfDigitalSignerTest {

    @Test
    @DisplayName("Quando desabilitado, deve manter metadados de assinatura simples e nao alterar bytes do PDF")
    void shouldFallbackToSimpleSignatureWhenDisabled() throws IOException {
        DigitalSignatureProperties properties = new DigitalSignatureProperties(
                false, "PKCS12", null, null, null, null,
                "Autenticidade", "Studio", false
        );
        BouncyCastlePdfDigitalSigner signer = new BouncyCastlePdfDigitalSigner(properties, new DefaultResourceLoader());

        DigitalSignatureMetadata meta = signer.getActiveMetadata();
        assertThat(meta.signed()).isFalse();
        assertThat(meta.signatureType()).isEqualTo(DigitalSignatureType.SIMPLE);
        assertThat(meta.legalFramework()).contains("Lei Federal nº 14.063/2020");

        byte[] originalPdf = createSamplePdf();
        byte[] result = signer.signPdf(originalPdf);
        assertThat(result).isEqualTo(originalPdf);
    }

    @Test
    @DisplayName("Deve assinar digitalmente o PDF com certificado avancado e gerar dicionario de assinatura valido")
    void shouldSignPdfWithAdvancedCertificate() throws Exception {
        KeyStore ks = BouncyCastlePdfDigitalSigner.generateSelfSignedKeystore(
                "Studio Pilates Ltda",
                "Autoridade Certificadora Privada",
                "secret123",
                "studio-cert"
        );
        PrivateKey privateKey = (PrivateKey) ks.getKey("studio-cert", "secret123".toCharArray());
        Certificate[] certChain = ks.getCertificateChain("studio-cert");

        DigitalSignatureProperties properties = new DigitalSignatureProperties(
                true, "PKCS12", null, null, null, null,
                "Autenticidade e integridade", "Studio Pilates", false
        );
        BouncyCastlePdfDigitalSigner signer = new BouncyCastlePdfDigitalSigner(properties, new DefaultResourceLoader());
        signer.configureManualCredentials(privateKey, certChain, false);

        DigitalSignatureMetadata meta = signer.getActiveMetadata();
        assertThat(meta.signed()).isTrue();
        assertThat(meta.signatureType()).isEqualTo(DigitalSignatureType.ADVANCED);
        assertThat(meta.certificateSubject()).contains("CN=Studio Pilates Ltda");
        assertThat(meta.certificateIssuer()).contains("O=Autoridade Certificadora Privada");
        assertThat(meta.algorithm()).contains("RSA");

        byte[] originalPdf = createSamplePdf();
        byte[] signedPdf = signer.signPdf(originalPdf);

        assertThat(signedPdf).isNotNull();
        assertThat(signedPdf.length).isGreaterThan(originalPdf.length);

        try (PDDocument doc = Loader.loadPDF(signedPdf)) {
            assertThat(doc.getSignatureDictionaries()).hasSize(1);
            PDSignature pdSig = doc.getSignatureDictionaries().getFirst();
            assertThat(pdSig.getFilter()).isEqualTo(PDSignature.FILTER_ADOBE_PPKLITE.getName());
            assertThat(pdSig.getSubFilter()).isEqualTo(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED.getName());
            assertThat(pdSig.getName()).contains("CN=Studio Pilates Ltda");
            assertThat(pdSig.getReason()).isEqualTo("Autenticidade e integridade");
        }
    }

    @Test
    @DisplayName("Deve identificar assinatura qualificada ICP-Brasil quando configurado flag icpBrasil")
    void shouldSignPdfWithQualifiedIcpBrasilCertificate() throws Exception {
        KeyStore ks = BouncyCastlePdfDigitalSigner.generateSelfSignedKeystore(
                "Studio Pilates A1 ICP-Brasil",
                "AC Instituto Nacional de Tecnologia da Informacao ICP-Brasil",
                "secret123",
                "icp-cert"
        );
        PrivateKey privateKey = (PrivateKey) ks.getKey("icp-cert", "secret123".toCharArray());
        Certificate[] certChain = ks.getCertificateChain("icp-cert");

        DigitalSignatureProperties properties = new DigitalSignatureProperties(
                true, "PKCS12", null, null, null, null,
                "Validade juridica plena", "Fortaleza/CE", true
        );
        BouncyCastlePdfDigitalSigner signer = new BouncyCastlePdfDigitalSigner(properties, new DefaultResourceLoader());
        signer.configureManualCredentials(privateKey, certChain, true);

        DigitalSignatureMetadata meta = signer.getActiveMetadata();
        assertThat(meta.signed()).isTrue();
        assertThat(meta.signatureType()).isEqualTo(DigitalSignatureType.QUALIFIED);
        assertThat(meta.legalFramework()).contains("ICP-Brasil").contains("MP nº 2.200-2/2001");
    }

    private byte[] createSamplePdf() throws IOException {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            document.save(out);
            return out.toByteArray();
        }
    }
}
