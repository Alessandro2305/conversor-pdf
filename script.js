document.addEventListener("DOMContentLoaded", () => {
    const pdfInput = document.getElementById("pdfInput");
    const excelInput = document.getElementById("excelInput");
    const btnProcessar = document.querySelector(".btn-blue") || document.querySelector(".btn-primary");
    const tbody = document.querySelector("tbody");
    const counterText = document.querySelector(".counter-text");
    const btnImprimir = document.getElementById("btnImprimir");
    const btnBaixarPDF = document.getElementById("btnBaixarPDF") || document.querySelector(".btn-pdf");

    // Atualiza o texto do PDF quando selecionado
    pdfInput?.addEventListener("change", (e) => {
        if (e.target.files[0]) {
            const fileName = e.target.files[0].name;
            const card = pdfInput.closest(".upload-card") || pdfInput.closest(".drop-card");
            const statusSpan = card?.querySelector(".file-status span") || card?.querySelector("p");
            if (statusSpan) statusSpan.textContent = `📄 ${fileName}`;
        }
    });

    // Atualiza o texto do Excel quando selecionado
    excelInput?.addEventListener("change", (e) => {
        if (e.target.files[0]) {
            const fileName = e.target.files[0].name;
            const card = excelInput.closest(".upload-card") || excelInput.closest(".drop-card");
            const statusSpan = card?.querySelector(".file-status span") || card?.querySelector("p");
            if (statusSpan) statusSpan.textContent = `📊 ${fileName}`;
        }
    });

    // Processa e faz o download direto do PDF
    btnProcessar?.addEventListener("click", async () => {
        const filePdf = pdfInput?.files[0];
        const fileExcel = excelInput?.files[0];

        if (!filePdf || !fileExcel) {
            alert("Por favor, selecione tanto o arquivo PDF quanto a planilha Excel!");
            return;
        }

        const formData = new FormData();
        formData.append("pdf_file", filePdf);
        formData.append("excel_depara", fileExcel);

        const textoOriginalBotao = btnProcessar.innerHTML;
        btnProcessar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processando...`;
        btnProcessar.disabled = true;

        try {
            const response = await fetch('/escrever-no-pdf-original/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error("Erro na resposta do servidor.");
            }

            // Tratamento do PDF como Blob binário para download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resultado_processado.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Erro no processamento:", error);
            alert("Ocorreu um erro ao conectar com o backend. Verifique se a API está online.");
        } finally {
            btnProcessar.innerHTML = textoOriginalBotao;
            btnProcessar.disabled = false;
        }
    });

    // Imprimir Tabela
    btnImprimir?.addEventListener("click", () => {
        window.print();
    });

    // Gerar e abrir o PDF alterado em uma nova aba
    btnBaixarPDF?.addEventListener("click", async () => {
        const filePdf = pdfInput?.files[0];
        const fileExcel = excelInput?.files[0];

        if (!filePdf || !fileExcel) {
            alert("Selecione os dois arquivos antes de gerar o PDF!");
            return;
        }

        const formData = new FormData();
        formData.append("pdf_file", filePdf);
        formData.append("excel_depara", fileExcel);

        const textoOriginal = btnBaixarPDF.innerHTML;
        btnBaixarPDF.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gerando PDF...`;
        btnBaixarPDF.disabled = true;

        try {
            const response = await fetch('/escrever-no-pdf-original/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Erro ao gerar o PDF injetado.");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            window.open(url, "_blank");

        } catch (err) {
            console.error("Erro:", err);
            alert("Falha ao exportar o PDF com os dados injetados.");
        } finally {
            btnBaixarPDF.innerHTML = textoOriginal;
            btnBaixarPDF.disabled = false;
        }
    });
});