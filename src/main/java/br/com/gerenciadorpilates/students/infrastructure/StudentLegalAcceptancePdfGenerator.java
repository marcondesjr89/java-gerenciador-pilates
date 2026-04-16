package br.com.gerenciadorpilates.students.infrastructure;

import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Component;

@Component
public class StudentLegalAcceptancePdfGenerator {

    private static final float PAGE_MARGIN = 48f;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth() - (PAGE_MARGIN * 2);
    private static final float BASE_FONT_SIZE = 11f;
    private static final float META_FONT_SIZE = 10f;
    private static final float SMALL_FONT_SIZE = 9f;
    private static final float TITLE_FONT_SIZE = 18f;
    private static final float SECTION_TITLE_FONT_SIZE = 12f;
    private static final float LINE_HEIGHT = 15f;
    private static final float QR_SIZE = 104f;
    private static final float FOOTER_HEIGHT = 44f;
    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss 'UTC'XXX", new Locale("pt", "BR"));

    public byte[] generate(DocumentData data) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            document.getDocumentInformation().setTitle("Aceite legal consolidado");
            document.getDocumentInformation().setAuthor(data.issuerName());
            document.getDocumentInformation().setSubject(data.documentReference());
            document.getDocumentInformation().setKeywords("aceite legal, qr code, verificacao, pilates");
            PdfCanvas canvas = new PdfCanvas(document);
            canvas.startPage();

            canvas.writeHeader(data);
            canvas.writeSectionTitle("Emitente institucional");
            canvas.writePair("Emitente", data.issuerName());
            canvas.writePair("Documento institucional", data.issuerDocument());
            canvas.writePair("Referencia formal do documento", data.documentReference());
            canvas.writeParagraph(data.verificationStatement());

            canvas.writeSectionTitle("Resumo do registro");
            canvas.writePair("Aluno", data.studentName());
            canvas.writePair("CPF", data.studentCpfMasked());
            canvas.writePair("Termo", data.title());
            canvas.writePair("Tipo", data.termTypeLabel());
            canvas.writePair("Versao", data.termsVersion());
            canvas.writePair("Status", data.status() == StudentLegalAcceptanceStatus.ACCEPTED ? "Aceito" : "Pendente de assinatura");
            canvas.writePair("Metodo de coleta", data.collectionMethodLabel());
            canvas.writePair("Aceite formal", data.acceptedAtLabel());
            canvas.writePair("Capturado por", data.capturedByUserName());

            canvas.writeSectionTitle("Integridade e verificacao");
            canvas.writePair("Hash SHA-256 do termo", data.documentHash());
            canvas.writePair("Codigo de verificacao", data.verificationCode());
            canvas.writePair("URL de verificacao", data.verificationUrl());
            canvas.writeQrCode(data.qrCodeImage());

            canvas.writeSectionTitle("Auditoria tecnica");
            canvas.writePair("Origem da coleta", data.auditCollectionOrigin());
            canvas.writePair("IP", data.auditIpAddress());
            canvas.writePair("Sessao tecnica", data.auditSessionKey());
            canvas.writePair("User-Agent", data.auditUserAgent());

            canvas.writeSectionTitle("Observacoes e evidencias");
            canvas.writeParagraph(data.evidenceStatement());
            canvas.writeParagraph(data.evidenceNote());
            canvas.writeBulletedList(data.attachmentsSummary());
            canvas.writeSignaturePreview(data.tabletSignatureImage(), data.tabletSignatureCaption());

            canvas.writeSectionTitle("Texto versionado do termo");
            canvas.writeParagraph(data.termBody());

            canvas.finish(data.footerText());
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new UncheckedIOException("Falha ao gerar o PDF consolidado do aceite legal.", exception);
        }
    }

    public record DocumentData(
            String applicationName,
            String issuerName,
            String issuerDocument,
            String studentName,
            String studentCpfMasked,
            String title,
            String termTypeLabel,
            String termsVersion,
            StudentLegalAcceptanceStatus status,
            String collectionMethodLabel,
            String acceptedAtLabel,
            String capturedByUserName,
            String documentHash,
            String verificationCode,
            String verificationUrl,
            String auditCollectionOrigin,
            String auditIpAddress,
            String auditSessionKey,
            String auditUserAgent,
            String evidenceNote,
            List<String> attachmentsSummary,
            String termBody,
            String evidenceStatement,
            BufferedImage tabletSignatureImage,
            String tabletSignatureCaption,
            BufferedImage qrCodeImage,
            String documentReference,
            String verificationStatement,
            String footerText
    ) {
    }

        private static final class PdfCanvas {

        private final PDDocument document;
        private final org.apache.pdfbox.pdmodel.font.PDFont regularFont =
                new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        private final org.apache.pdfbox.pdmodel.font.PDFont boldFont =
                new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        private PDPage page;
        private PDPageContentStream stream;
        private float cursorY;
        private int pageNumber;

        private PdfCanvas(PDDocument document) {
            this.document = document;
        }

        private void startPage() throws IOException {
            page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
            cursorY = page.getMediaBox().getHeight() - PAGE_MARGIN;
            pageNumber += 1;
        }

        private void ensureSpace(float requiredHeight) throws IOException {
            if (cursorY - requiredHeight > PAGE_MARGIN + FOOTER_HEIGHT) {
                return;
            }

            stream.close();
            startPage();
        }

        private void writeHeader(DocumentData data) throws IOException {
            ensureSpace(96f);
            writeText(data.applicationName(), PAGE_MARGIN, cursorY, boldFont, 10f, new Color(130, 100, 55));
            cursorY -= 18f;
            writeText("Aceite legal consolidado", PAGE_MARGIN, cursorY, boldFont, TITLE_FONT_SIZE, Color.BLACK);
            writeText("Ref. " + data.documentReference(), PAGE_MARGIN + PAGE_WIDTH - 165f, cursorY, boldFont, META_FONT_SIZE, new Color(90, 90, 90));
            cursorY -= 18f;
            writeText(
                    "Documento versionado com vinculo ao registro juridico e QR Code de verificacao.",
                    PAGE_MARGIN,
                    cursorY,
                    regularFont,
                    BASE_FONT_SIZE,
                    new Color(90, 90, 90)
            );
            cursorY -= 24f;
        }

        private void writeSectionTitle(String title) throws IOException {
            ensureSpace(28f);
            writeText(title, PAGE_MARGIN, cursorY, boldFont, SECTION_TITLE_FONT_SIZE, Color.BLACK);
            cursorY -= 16f;
        }

        private void writePair(String label, String value) throws IOException {
            String safeValue = sanitize(value);
            var lines = wrap(label + ": " + safeValue, regularFont, BASE_FONT_SIZE, PAGE_WIDTH);
            ensureSpace(lines.size() * LINE_HEIGHT + 4f);
            for (String line : lines) {
                writeText(line, PAGE_MARGIN, cursorY, regularFont, BASE_FONT_SIZE, Color.BLACK);
                cursorY -= LINE_HEIGHT;
            }
        }

        private void writeParagraph(String text) throws IOException {
            String safeText = sanitize(text);
            var lines = wrap(safeText, regularFont, BASE_FONT_SIZE, PAGE_WIDTH);
            ensureSpace(lines.size() * LINE_HEIGHT + 6f);
            for (String line : lines) {
                writeText(line, PAGE_MARGIN, cursorY, regularFont, BASE_FONT_SIZE, Color.BLACK);
                cursorY -= LINE_HEIGHT;
            }
            cursorY -= 4f;
        }

        private void writeBulletedList(List<String> items) throws IOException {
            if (items.isEmpty()) {
                writeParagraph("Nenhuma evidencia complementar anexada ao registro.");
                return;
            }

            for (String item : items) {
                var lines = wrap("- " + sanitize(item), regularFont, BASE_FONT_SIZE, PAGE_WIDTH);
                ensureSpace(lines.size() * LINE_HEIGHT + 2f);
                for (String line : lines) {
                    writeText(line, PAGE_MARGIN, cursorY, regularFont, BASE_FONT_SIZE, Color.BLACK);
                    cursorY -= LINE_HEIGHT;
                }
            }
            cursorY -= 4f;
        }

        private void writeQrCode(BufferedImage image) throws IOException {
            ensureSpace(QR_SIZE + 20f);
            PDImageXObject qrImage = LosslessFactory.createFromImage(document, image);
            stream.drawImage(qrImage, PAGE_MARGIN, cursorY - QR_SIZE, QR_SIZE, QR_SIZE);
            cursorY -= QR_SIZE + 10f;
        }

        private void writeSignaturePreview(BufferedImage image, String caption) throws IOException {
            if (image == null) {
                return;
            }

            float previewWidth = 180f;
            float previewHeight = Math.min(90f, (image.getHeight() * previewWidth) / Math.max(1f, image.getWidth()));
            ensureSpace(previewHeight + 36f);
            writeText("Previa da assinatura coletada", PAGE_MARGIN, cursorY, boldFont, SMALL_FONT_SIZE, new Color(90, 90, 90));
            cursorY -= 14f;

            PDImageXObject signatureImage = LosslessFactory.createFromImage(document, image);
            stream.drawImage(signatureImage, PAGE_MARGIN, cursorY - previewHeight, previewWidth, previewHeight);
            stream.setStrokingColor(new Color(210, 210, 210));
            stream.addRect(PAGE_MARGIN, cursorY - previewHeight, previewWidth, previewHeight);
            stream.stroke();
            cursorY -= previewHeight + 12f;

            if (caption != null && !caption.isBlank()) {
                writeText(caption, PAGE_MARGIN, cursorY, regularFont, SMALL_FONT_SIZE, new Color(90, 90, 90));
                cursorY -= 14f;
            }
        }

        private void finish(String footerText) throws IOException {
            writeFooter(footerText);
            stream.close();
        }

        private void writeFooter(String footerText) throws IOException {
            float footerY = PAGE_MARGIN - 6f;
            stream.setStrokingColor(new Color(190, 190, 190));
            stream.moveTo(PAGE_MARGIN, footerY + 18f);
            stream.lineTo(PAGE_MARGIN + PAGE_WIDTH, footerY + 18f);
            stream.stroke();
            writeText(sanitize(footerText), PAGE_MARGIN, footerY + 6f, regularFont, SMALL_FONT_SIZE, new Color(90, 90, 90));
            writeText(
                    "Emitido em " + DATE_TIME_FORMATTER.format(OffsetDateTime.now(ZoneId.of("UTC"))),
                    PAGE_MARGIN,
                    footerY - 6f,
                    regularFont,
                    SMALL_FONT_SIZE,
                    new Color(90, 90, 90)
            );
            writeText(
                    "Pagina " + pageNumber,
                    PAGE_MARGIN + PAGE_WIDTH - 42f,
                    footerY - 6f,
                    regularFont,
                    SMALL_FONT_SIZE,
                    new Color(90, 90, 90)
            );
        }

        private void writeText(
                String text,
                float x,
                float y,
                org.apache.pdfbox.pdmodel.font.PDFont font,
                float fontSize,
                Color color
        ) throws IOException {
            stream.beginText();
            stream.setFont(font, fontSize);
            stream.setNonStrokingColor(color);
            stream.newLineAtOffset(x, y);
            stream.showText(text);
            stream.endText();
        }

        private List<String> wrap(String text, org.apache.pdfbox.pdmodel.font.PDFont font, float fontSize, float width)
                throws IOException {
            List<String> lines = new java.util.ArrayList<>();
            String[] paragraphs = sanitize(text).split("\\R", -1);
            for (String paragraph : paragraphs) {
                if (paragraph.isBlank()) {
                    lines.add("");
                    continue;
                }

                StringBuilder current = new StringBuilder();
                for (String word : paragraph.split("\\s+")) {
                    String candidate = current.isEmpty() ? word : current + " " + word;
                    float candidateWidth = font.getStringWidth(candidate) / 1000f * fontSize;
                    if (candidateWidth <= width) {
                        current.setLength(0);
                        current.append(candidate);
                        continue;
                    }

                    if (!current.isEmpty()) {
                        lines.add(current.toString());
                        current.setLength(0);
                        current.append(word);
                    } else {
                        lines.add(word);
                    }
                }

                if (!current.isEmpty()) {
                    lines.add(current.toString());
                }
            }
            return lines;
        }

        private String sanitize(String value) {
            return value == null || value.isBlank() ? "Nao informado." : value.replace("\u0000", "").trim();
        }
    }
}
