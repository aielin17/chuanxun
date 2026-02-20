        export function safeGetItem(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.error('Error getting item:', e);
                return null;
            }
        }
        export function safeSetItem(key, value) {
            try {
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                localStorage.setItem(key, value);
            } catch (e) {
                console.error('Error setting item:', e);
            }
        }
        export function safeRemoveItem(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Error removing item:', e);
            }
        }
        export function showNotification(message, type = 'info', duration = 3000) {
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) existingNotification.remove();

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            const iconMap = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle',
                warning: 'fa-exclamation-triangle'
            };
            notification.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i><span>${message}</span>`;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('hiding');
                notification.addEventListener('animationend', () => notification.remove());
            }, duration);
        }
        export const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
        export function cropImageToSquare(file, maxSize = 640) { 
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const minSide = Math.min(img.width, img.height);
                        const sx = (img.width - minSide) / 2;
                        const sy = (img.height - minSide) / 2;

                        const canvas = document.createElement('canvas');
                        canvas.width = maxSize;
                        canvas.height = maxSize;
                        const ctx = canvas.getContext('2d');

                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);

                        resolve(canvas.toDataURL('image/jpeg', 0.95));
                    };
                    img.onerror = reject;
                    img.src = e.target.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
         export function optimizeImage(file, maxWidth = 800, quality = 0.7) {
            return new Promise((resolve, reject) => {
                if (file.size < 300 * 1024) {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let {
                        width,
                        height
                    } = img;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                    URL.revokeObjectURL(img.src);
                };
                img.onerror = () => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                    URL.revokeObjectURL(img.src);
                };
                img.src = URL.createObjectURL(file);
            });
        }
