document.addEventListener('DOMContentLoaded', function() {

    // --- Utils ---
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function showStatus(element, message, type) {
        element.innerHTML = `<div class="alert alert-${type} py-2 mb-0">${message}</div>`;
    }

    // --- 1. JSON Formatter & Validator ---
    if (document.getElementById('jsonInput')) {
        const jsonInput = document.getElementById('jsonInput');
        const jsonOutput = document.getElementById('jsonOutput');
        const jsonStatus = document.getElementById('jsonStatus');

        document.getElementById('btnJsonFormat').addEventListener('click', () => {
            try {
                const raw = jsonInput.value;
                if (!raw.trim()) return;
                const parsed = JSON.parse(raw);
                jsonOutput.value = JSON.stringify(parsed, null, 4);
                jsonOutput.classList.remove('error');
                showStatus(jsonStatus, '성공적으로 포맷팅되었습니다.', 'success');
            } catch (e) {
                jsonOutput.value = e.message;
                jsonOutput.classList.add('error');
                showStatus(jsonStatus, '유효하지 않은 JSON입니다.', 'danger');
            }
        });

        document.getElementById('btnJsonMinify').addEventListener('click', () => {
            try {
                const raw = jsonInput.value;
                if (!raw.trim()) return;
                const parsed = JSON.parse(raw);
                jsonOutput.value = JSON.stringify(parsed);
                jsonOutput.classList.remove('error');
                showStatus(jsonStatus, '성공적으로 압축되었습니다.', 'success');
            } catch (e) {
                jsonOutput.value = e.message;
                jsonOutput.classList.add('error');
                showStatus(jsonStatus, '유효하지 않은 JSON입니다.', 'danger');
            }
        });

        document.getElementById('btnJsonValidate').addEventListener('click', () => {
            try {
                const raw = jsonInput.value;
                if (!raw.trim()) {
                    showStatus(jsonStatus, '입력값이 비어있습니다.', 'warning');
                    return;
                }
                JSON.parse(raw);
                jsonOutput.value = "Valid JSON";
                jsonOutput.classList.remove('error');
                showStatus(jsonStatus, '유효한 JSON 데이터입니다.', 'success');
            } catch (e) {
                jsonOutput.value = e.message;
                jsonOutput.classList.add('error');
                showStatus(jsonStatus, 'JSON 오류가 발견되었습니다.', 'danger');
            }
        });

        document.getElementById('btnJsonClear').addEventListener('click', () => {
            jsonInput.value = '';
            jsonOutput.value = '';
            jsonStatus.innerHTML = '';
            jsonOutput.classList.remove('error');
        });
    }

    // --- 2. WebP Converter ---
    if (document.getElementById('webpInput')) {
        const webpInput = document.getElementById('webpInput');
        const webpDropZone = document.getElementById('webpDropZone');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            webpDropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        webpDropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        webpInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            if (files.length === 0) return;
            const file = files[0];
            if (!file.type.match('image.*')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Show Source
                    document.getElementById('webpSourceImg').src = e.target.result;
                    document.getElementById('webpSourceInfo').innerText = `${file.name} (${formatBytes(file.size)})`;

                    // Convert
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
                    document.getElementById('webpOutputImg').src = webpDataUrl;

                    // Calculate size approx
                    const head = 'data:image/webp;base64,';
                    const size = Math.round((webpDataUrl.length - head.length) * 3 / 4);
                    document.getElementById('webpOutputInfo').innerText = `converted.webp (${formatBytes(size)})`;

                    document.getElementById('webpDownloadBtn').href = webpDataUrl;
                    document.getElementById('webpResult').classList.remove('d-none');
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    }

    // --- 3. Base64 Converter ---
    if (document.getElementById('base64TextInput')) {
        // Text
        document.getElementById('btnBase64Encode').addEventListener('click', () => {
            try {
                const input = document.getElementById('base64TextInput').value;
                const encoded = btoa(unescape(encodeURIComponent(input)));
                document.getElementById('base64TextOutput').value = encoded;
            } catch (e) {
                alert('인코딩 오류: ' + e.message);
            }
        });

        document.getElementById('btnBase64Decode').addEventListener('click', () => {
            try {
                const input = document.getElementById('base64TextOutput').value || document.getElementById('base64TextInput').value;
                const decoded = decodeURIComponent(escape(atob(input)));
                document.getElementById('base64TextInput').value = decoded;
            } catch (e) {
                alert('디코딩 오류: 올바르지 않은 Base64 문자열입니다.');
            }
        });

        // Image
        document.getElementById('base64ImgInput').addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('base64ImgOutput').value = e.target.result;
                    const preview = document.getElementById('base64ImgPreview');
                    preview.src = e.target.result;
                    preview.style.display = 'inline-block';
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // --- 4. Regex Tester ---
    if (document.getElementById('regexPattern')) {
        const regexPattern = document.getElementById('regexPattern');
        const regexFlags = document.getElementById('regexFlags');
        const regexText = document.getElementById('regexText');
        const regexResult = document.getElementById('regexResult');

        function runRegex() {
            const pattern = regexPattern.value;
            const flags = regexFlags.value;
            const text = regexText.value;

            if (!pattern) {
                regexResult.innerHTML = '';
                return;
            }

            try {
                const regex = new RegExp(pattern, flags);

                if (flags.includes('g')) {
                    const matches = text.match(regex);
                    if (matches) {
                        regexResult.innerHTML = `<span class="text-success"><strong>${matches.length}</strong>개의 매칭 결과 발견</span><br>`;
                        let highlighted = text.replace(regex, match => `<span class="highlight-match">${match}</span>`);
                        regexResult.innerHTML += `<div class="mt-2" style="white-space: pre-wrap;">${highlighted}</div>`;
                    } else {
                        regexResult.innerHTML = '<span class="text-muted">매칭되는 결과가 없습니다.</span>';
                    }
                } else {
                    const match = text.match(regex);
                    if (match) {
                        regexResult.innerHTML = `<span class="text-success">매칭 성공!</span><br>`;
                        regexResult.innerHTML += `<div class="mt-2">Match: <strong>${match[0]}</strong></div>`;
                    } else {
                        regexResult.innerHTML = '<span class="text-muted">매칭되는 결과가 없습니다.</span>';
                    }
                }
            } catch (e) {
                regexResult.innerHTML = `<span class="text-danger">Invalid Regex: ${e.message}</span>`;
            }
        }

        regexPattern.addEventListener('input', runRegex);
        regexFlags.addEventListener('input', runRegex);
        regexText.addEventListener('input', runRegex);

        document.querySelectorAll('.regex-preset').forEach(btn => {
            btn.addEventListener('click', function() {
                regexPattern.value = this.dataset.regex;
                regexFlags.value = 'g';
                runRegex();
            });
        });
    }

    // --- 5. Markdown Converter ---
    if (document.getElementById('mdInput')) {
        const mdInput = document.getElementById('mdInput');
        const mdPreview = document.getElementById('mdPreview');
        const mdHtmlOutput = document.getElementById('mdHtmlOutput');
        const mdViewRadios = document.getElementsByName('mdView');

        function convertMarkdown() {
            const text = mdInput.value;
            const html = marked.parse(text);
            mdPreview.innerHTML = html;
            mdHtmlOutput.value = html;
        }

        mdInput.addEventListener('input', convertMarkdown);

        mdViewRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.id === 'mdViewPreview') {
                    mdPreview.classList.remove('d-none');
                    mdHtmlOutput.classList.add('d-none');
                } else {
                    mdPreview.classList.add('d-none');
                    mdHtmlOutput.classList.remove('d-none');
                }
            });
        });

        document.getElementById('btnCopyHtml').addEventListener('click', () => {
            mdHtmlOutput.select();
            document.execCommand('copy');
            alert('HTML 코드가 복사되었습니다.');
        });
    }

    // --- 6. Color Palette ---
    if (document.getElementById('colorInput')) {
        const colorInput = document.getElementById('colorInput');
        const colorPreview = document.getElementById('colorPreview');
        const paletteContainer = document.getElementById('paletteContainer');
        const paletteResult = document.getElementById('paletteResult');

        colorInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    colorPreview.src = e.target.result;
                    colorPreview.style.display = 'block';
                    colorPreview.onload = function() {
                        extractColors(colorPreview);
                    }
                };
                reader.readAsDataURL(this.files[0]);
            }
        });

        function extractColors(imgElement) {
            const colorThief = new ColorThief();
            const palette = colorThief.getPalette(imgElement, 5);

            paletteContainer.innerHTML = '';
            palette.forEach(color => {
                const rgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                const hex = rgbToHex(color[0], color[1], color[2]);

                const box = document.createElement('div');
                box.className = 'color-box';
                box.style.backgroundColor = rgb;
                box.innerHTML = `<span>${hex}</span>`;
                box.onclick = () => {
                    navigator.clipboard.writeText(hex);
                    alert(`색상 코드 ${hex} 복사됨`);
                };
                paletteContainer.appendChild(box);
            });

            paletteResult.classList.remove('d-none');
        }

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
    }

    // --- 7. QR Code ---
    if (document.getElementById('btnGenerateQR')) {
        const btnGenerateQR = document.getElementById('btnGenerateQR');
        const qrContainer = document.getElementById('qrContainer');
        const btnDownloadQR = document.getElementById('btnDownloadQR');

        btnGenerateQR.addEventListener('click', () => {
            const text = document.getElementById('qrText').value;
            const colorDark = document.getElementById('qrColorDark').value;
            const colorLight = document.getElementById('qrColorLight').value;

            if (!text) {
                alert('URL 또는 텍스트를 입력해주세요.');
                return;
            }

            qrContainer.innerHTML = '';

            new QRCode(qrContainer, {
                text: text,
                width: 200,
                height: 200,
                colorDark : colorDark,
                colorLight : colorLight,
                correctLevel : QRCode.CorrectLevel.H
            });

            document.getElementById('qrDownloadSection').style.display = 'block';
        });

        btnDownloadQR.addEventListener('click', () => {
            const img = qrContainer.querySelector('img');
            if (img) {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = img.src;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }

});
