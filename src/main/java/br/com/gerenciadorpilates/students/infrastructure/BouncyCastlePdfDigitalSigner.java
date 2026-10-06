package br.com.gerenciadorpilates.students.infrastructure;

import br.com.gerenciadorpilates.students.application.DigitalSignatureMetadata;
import br.com.gerenciadorpilates.students.application.DigitalSignatureProperties;
import br.com.gerenciadorpilates.students.application.PdfDigitalSigner;
import br.com.gerenciadorpilates.students.domain.DigitalSignatureType;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.math.BigInteger;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureInterface;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.cms.CMSProcessableByteArray;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.CMSSignedDataGenerator;
import org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
public class BouncyCastlePdfDigitalSigner implements PdfDigitalSigner {

    private static final Logger log = LoggerFactory.getLogger(BouncyCastlePdfDigitalSigner.class);

    private final DigitalSignatureProperties properties;
    private final ResourceLoader resourceLoader;

    private PrivateKey configuredPrivateKey;
    private Certificate[] configuredCertificateChain;
    private DigitalSignatureMetadata activeMetadata;

    public BouncyCastlePdfDigitalSigner(
            DigitalSignatureProperties properties,
            ResourceLoader resourceLoader
    ) {
        this.properties = properties;
        this.resourceLoader = resourceLoader;
        initSigner();
    }

    private synchronized void initSigner() {
        if (!properties.enabled() || properties.keystorePath() == null || properties.keystorePath().isBlank()) {
            this.activeMetadata = DigitalSignatureMetadata.simple();
            log.info("Assinatura digital de PDF desabilitada. Utilizando Assinatura Eletronica Simples (Lei 14.063/2020).");
            return;
        }

        try {
            Resource resource = resourceLoader.getResource(properties.keystorePath());
            if (!resource.exists()) {
                log.warn("Arquivo de Keystore nao encontrado em: {}. Fallback para assinatura simples.", properties.keystorePath());
                this.activeMetadata = DigitalSignatureMetadata.simple();
                return;
            }

            KeyStore keyStore = KeyStore.getInstance(properties.keystoreType());
            char[] password = properties.keystorePassword() != null ? properties.keystorePassword().toCharArray() : new char[0];
            try (InputStream in = resource.getInputStream()) {
                keyStore.load(in, password);
            }

            String alias = properties.keyAlias();
            if (alias == null || alias.isBlank()) {
                alias = keyStore.aliases().hasMoreElements() ? keyStore.aliases().nextElement() : null;
            }

            if (alias == null) {
                log.warn("Nenhum alias encontrado no keystore. Fallback para assinatura simples.");
                this.activeMetadata = DigitalSignatureMetadata.simple();
                return;
            }

            char[] keyPass = properties.keyPassword() != null && !properties.keyPassword().isBlank()
                    ? properties.keyPassword().toCharArray()
                    : password;

            this.configuredPrivateKey = (PrivateKey) keyStore.getKey(alias, keyPass);
            this.configuredCertificateChain = keyStore.getCertificateChain(alias);

            if (configuredPrivateKey == null || configuredCertificateChain == null || configuredCertificateChain.length == 0) {
                log.warn("Chave privada ou cadeia de certificados ausente para o alias '{}'. Fallback para assinatura simples.", alias);
                this.activeMetadata = DigitalSignatureMetadata.simple();
                return;
            }

            X509Certificate x509 = (X509Certificate) configuredCertificateChain[0];
            DigitalSignatureType type = properties.icpBrasil() ? DigitalSignatureType.QUALIFIED : DigitalSignatureType.ADVANCED;

            this.activeMetadata = new DigitalSignatureMetadata(
                    true,
                    type,
                    x509.getSubjectX500Principal().getName(),
                    x509.getIssuerX500Principal().getName(),
                    x509.getSerialNumber().toString(16).toUpperCase(),
                    OffsetDateTime.now(ZoneOffset.UTC),
                    x509.getSigAlgName(),
                    type.getLegalBasis()
            );

            log.info("Assinatura digital configurada com sucesso. Tipo: {}, Titular: {}, Emissor: {}",
                    type, x509.getSubjectX500Principal().getName(), x509.getIssuerX500Principal().getName());

        } catch (Exception ex) {
            log.error("Erro ao inicializar certificado digital para assinatura de PDF: {}. Fallback para assinatura simples.", ex.getMessage(), ex);
            this.activeMetadata = DigitalSignatureMetadata.simple();
        }
    }

    /**
     * Permite injetar programaticamente credenciais em testes.
     */
    public synchronized void configureManualCredentials(
            PrivateKey privateKey,
            Certificate[] certificateChain,
            boolean icpBrasil
    ) {
        this.configuredPrivateKey = privateKey;
        this.configuredCertificateChain = certificateChain;

        if (privateKey != null && certificateChain != null && certificateChain.length > 0) {
            X509Certificate x509 = (X509Certificate) certificateChain[0];
            DigitalSignatureType type = icpBrasil ? DigitalSignatureType.QUALIFIED : DigitalSignatureType.ADVANCED;
            this.activeMetadata = new DigitalSignatureMetadata(
                    true,
                    type,
                    x509.getSubjectX500Principal().getName(),
                    x509.getIssuerX500Principal().getName(),
                    x509.getSerialNumber().toString(16).toUpperCase(),
                    OffsetDateTime.now(ZoneOffset.UTC),
                    x509.getSigAlgName(),
                    type.getLegalBasis()
            );
        } else {
            this.activeMetadata = DigitalSignatureMetadata.simple();
        }
    }

    @Override
    public DigitalSignatureMetadata getActiveMetadata() {
        return activeMetadata != null ? activeMetadata : DigitalSignatureMetadata.simple();
    }

    @Override
    public byte[] signPdf(byte[] pdfBytes) {
        if (configuredPrivateKey == null || configuredCertificateChain == null || configuredCertificateChain.length == 0) {
            return pdfBytes;
        }

        try (PDDocument document = Loader.loadPDF(pdfBytes);
             ByteArrayOutputStream signedOutput = new ByteArrayOutputStream()) {

            PDSignature signature = new PDSignature();
            signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
            signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
            signature.setName(activeMetadata.certificateSubject());
            signature.setLocation(properties.signatureLocation());
            signature.setReason(properties.signatureReason());
            signature.setSignDate(Calendar.getInstance());

            SignatureInterface signatureInterface = content -> {
                try {
                    byte[] dataToSign = content.readAllBytes();
                    CMSSignedDataGenerator gen = new CMSSignedDataGenerator();
                    ContentSigner shaSigner = new JcaContentSignerBuilder("SHA256withRSA").build(configuredPrivateKey);

                    gen.addSignerInfoGenerator(new JcaSignerInfoGeneratorBuilder(
                            new JcaDigestCalculatorProviderBuilder().build()
                    ).build(shaSigner, (X509Certificate) configuredCertificateChain[0]));

                    gen.addCertificates(new JcaCertStore(Arrays.asList(configuredCertificateChain)));

                    CMSSignedData signedData = gen.generate(new CMSProcessableByteArray(dataToSign), false);
                    return signedData.getEncoded();
                } catch (Exception e) {
                    throw new IOException("Falha ao computar assinatura digital PKCS#7: " + e.getMessage(), e);
                }
            };

            document.addSignature(signature, signatureInterface);
            document.saveIncremental(signedOutput);
            return signedOutput.toByteArray();

        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao assinar digitalmente o documento PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Utilitario para geracao de par de chaves e certificado auto-assinado X.509 em memoria (util para testes).
     */
    public static KeyStore generateSelfSignedKeystore(
            String commonName,
            String issuerOrg,
            String password,
            String alias
    ) {
        try {
            KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
            keyPairGen.initialize(2048, new SecureRandom());
            KeyPair keyPair = keyPairGen.generateKeyPair();

            long now = System.currentTimeMillis();
            Date startDate = new Date(now - 86400000L);
            Date endDate = new Date(now + (365L * 86400000L));
            BigInteger serial = BigInteger.valueOf(now);

            X500Name dnName = new X500Name("CN=" + commonName + ", O=" + issuerOrg + ", C=BR");
            X509v3CertificateBuilder certBuilder = new JcaX509v3CertificateBuilder(
                    dnName,
                    serial,
                    startDate,
                    endDate,
                    dnName,
                    keyPair.getPublic()
            );

            ContentSigner signer = new JcaContentSignerBuilder("SHA256withRSA").build(keyPair.getPrivate());
            X509Certificate cert = new JcaX509CertificateConverter().getCertificate(certBuilder.build(signer));

            KeyStore ks = KeyStore.getInstance("PKCS12");
            ks.load(null, password.toCharArray());
            ks.setKeyEntry(alias, keyPair.getPrivate(), password.toCharArray(), new Certificate[]{cert});
            return ks;
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao gerar keystore em memoria: " + ex.getMessage(), ex);
        }
    }
}
