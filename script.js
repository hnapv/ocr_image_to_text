document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const pasteButton = document.getElementById('pasteButton');
    const uploadButton = document.getElementById('uploadButton');
    const textResult = document.getElementById('textResult');
    const fontSelect = document.getElementById('fontSelect');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const increaseSizeButton = document.getElementById('increaseSize');
    const decreaseSizeButton = document.getElementById('decreaseSize');
    const spinner = document.getElementById('spinner');
    const pasteArea = document.getElementById('pasteArea');
    const copyButton = document.getElementById('copyButton');
    const popup = document.getElementById('popup'); // Thông báo popup
    let imageFile = null;

    const selectedFont = fontSelect.value;
    textResult.style.fontFamily = selectedFont;

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            imageFile = file;
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    // Hiển thị hình ảnh đã chọn
                    pasteArea.innerHTML = ''; // Xóa nội dung trước đó
                    pasteArea.appendChild(img);
                };
            };

            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file.');
        }
    });

    pasteButton.addEventListener('click', () => {
        navigator.clipboard.read().then(items => {
            for (let item of items) {
                if (item.types.includes('image/png')) {
                    item.getType('image/png').then(blob => {
                        imageFile = blob; // Cập nhật biến imageFile với ảnh từ clipboard
                        const img = new Image();
                        img.src = URL.createObjectURL(blob);
                        pasteArea.innerHTML = ''; // Clear previous image
                        pasteArea.appendChild(img);
                    });
                }
            }
        }).catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });
    });

    uploadButton.addEventListener('click', () => {
        const img = pasteArea.querySelector('img');
        if (!img) {
            alert('Please select or paste an image first.');
            return;
        }

        // Hiển thị spinner và bắt đầu xoay
        spinner.style.display = 'inline-block';
        spinner.classList.add('rotating');

        // Làm mờ và vô hiệu hóa nút "Start OCR"
        uploadButton.disabled = true;
        uploadButton.style.opacity = '0.5';

        textResult.textContent = ''; // Xóa kết quả trước đó

        Tesseract.recognize(
            img.src,
            'vie',
            { logger: info => console.log(info) }
        ).then(({ data: { text } }) => {
            // Hiển thị kết quả OCR
            textResult.textContent = text;

            // Dừng xoay spinner
            spinner.style.display = 'none';
            spinner.classList.remove('rotating');

            // Kích hoạt lại nút "Start OCR"
            uploadButton.disabled = false;
            uploadButton.style.opacity = '1';
        }).catch(err => {
            alert('Error:', err)
            console.error('Error:', err);
            textResult.textContent = 'Error processing image.';

            // Dừng xoay spinner và kích hoạt lại nút ngay cả khi có lỗi
            spinner.style.display = 'none';
            spinner.classList.remove('rotating');
            uploadButton.disabled = false;
            uploadButton.style.opacity = '1';
        });
    });

    fontSelect.addEventListener('change', (event) => {
        const selectedFont = event.target.value;
        textResult.style.fontFamily = selectedFont;
    });

    fontSizeInput.addEventListener('input', (event) => {
        const fontSize = event.target.value;
        textResult.style.fontSize = `${fontSize}px`;
    });

    increaseSizeButton.addEventListener('click', () => {
        const currentSize = parseInt(fontSizeInput.value, 10);
        fontSizeInput.value = currentSize + 1;
        textResult.style.fontSize = `${currentSize + 1}px`;
    });

    decreaseSizeButton.addEventListener('click', () => {
        const currentSize = parseInt(fontSizeInput.value, 10);
        if (currentSize > 1) { // Ngăn kích thước chữ nhỏ hơn 1
            fontSizeInput.value = currentSize - 1;
            textResult.style.fontSize = `${currentSize - 1}px`;
        }
    });
    copyButton.addEventListener('click', () => {
        if (textResult.textContent) {
            // Thêm lớp mờ ngay lập tức
            copyButton.classList.add('disabled');
            
            // Sao chép văn bản vào clipboard
            navigator.clipboard.writeText(textResult.textContent).then(() => {
                // Hiển thị thông báo thành công
                popup.textContent = 'Copied to Clipboard!';
                popup.classList.remove('error');
                popup.style.display = 'block';
                setTimeout(() => {
                    popup.style.display = 'none'; // Ẩn thông báo sau 2 giây
                }, 2000);

                // Đặt lại lớp mờ sau 0.5 giây
                setTimeout(() => {
                    copyButton.classList.remove('disabled');
                }, 500);
            }).catch(err => {
                // Hiển thị thông báo lỗi
                popup.textContent = 'Failed to Copy!';
                popup.classList.add('error');
                popup.style.display = 'block';
                setTimeout(() => {
                    popup.style.display = 'none'; // Ẩn thông báo sau 2 giây
                }, 2000);

                // Đặt lại lớp mờ sau 0.5 giây
                setTimeout(() => {
                    copyButton.classList.remove('disabled');
                }, 500);
            });
        } else {
            alert('No text to copy.');
        }
    });
});
