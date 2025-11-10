// Advanced Color Preview System with Actual Image Recoloring
// This recolors the actual pixels in your product images for cap and lettering separately

(function() {
    'use strict';

    // Color mapping with RGB values
    const COLOR_MAP = {
        'black': { r: 26, g: 26, b: 26 },
        'white': { r: 245, g: 245, b: 245 },
        'red': { r: 231, g: 76, b: 60 },
        'blue': { r: 52, g: 152, b: 219 },
        'green': { r: 39, g: 174, b: 96 },
        'yellow': { r: 241, g: 196, b: 15 },
        'orange': { r: 230, g: 126, b: 34 },
        'gray': { r: 149, g: 165, b: 166 },
        'od-green': { r: 74, g: 90, b: 63 },
        'tan': { r: 210, g: 180, b: 140 },
        'camo': { r: 74, g: 90, b: 63 }
    };

    // Store original images and canvas data
    const imageCache = new Map();
    const canvasCache = new Map();

    console.log('🎨 Advanced Color Preview System Loading...');

    function initAdvancedPreview() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            const img = card.querySelector('img');
            const capColorSelect = card.querySelector('.cap-color-select');
            const letteringColorSelect = card.querySelector('.lettering-color-select');
            const holderColorSelect = card.querySelector('.holder-color-select');
            
            // Only process cards that have color selectors
            if (!capColorSelect && !letteringColorSelect && !holderColorSelect) {
                return;
            }

            if (img && img.src) {
                setupAdvancedPreview(card, img, index);
            }
        });
        
        console.log(`✅ Advanced Preview initialized for ${productCards.length} products`);
    }

    function setupAdvancedPreview(card, originalImg, cardIndex) {
        // Create container for canvas
        const container = document.createElement('div');
        container.className = 'advanced-preview-container';
        container.style.cssText = `
            position: relative;
            width: 100%;
            border-radius: 8px;
            overflow: hidden;
        `;

        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.className = 'color-preview-canvas';
        canvas.style.cssText = `
            width: 100%;
            height: auto;
            border-radius: 8px;
            display: block;
        `;

        // Create loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'preview-loading';
        loadingDiv.textContent = 'Loading preview...';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        `;

        // Replace image with canvas
        const imgParent = originalImg.parentNode;
        imgParent.insertBefore(container, originalImg);
        container.appendChild(canvas);
        container.appendChild(loadingDiv);
        originalImg.style.display = 'none';

        // Create color swatches display
        const swatchContainer = document.createElement('div');
        swatchContainer.className = 'color-swatches-advanced';
        swatchContainer.style.cssText = `
            display: flex;
            gap: 6px;
            justify-content: center;
            margin-top: 8px;
            padding: 8px;
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border-radius: 6px;
            flex-wrap: wrap;
            border: 1px solid #e0e0e0;
        `;
        container.parentNode.insertBefore(swatchContainer, container.nextSibling);

        // Load original image and set up recoloring
        const img = new Image();
        img.crossOrigin = 'anonymous'; // For CORS
        img.onload = function() {
            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Store original image data
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            imageCache.set(cardIndex, originalImageData);
            
            // Initial draw
            updateColorPreview(card, canvas, cardIndex, swatchContainer);
            
            // Set up listeners
            setupColorChangeListeners(card, canvas, cardIndex, swatchContainer);
            
            loadingDiv.style.display = 'none';
        };
        
        img.onerror = function() {
            console.error('Failed to load image:', originalImg.src);
            loadingDiv.textContent = 'Failed to load image';
            loadingDiv.style.background = 'rgba(231, 76, 60, 0.8)';
            // Fallback: show original image
            originalImg.style.display = 'block';
            container.style.display = 'none';
        };
        
        loadingDiv.style.display = 'block';
        img.src = originalImg.src;
    }

    function setupColorChangeListeners(card, canvas, cardIndex, swatchContainer) {
        const capColorSelect = card.querySelector('.cap-color-select');
        const letteringColorSelect = card.querySelector('.lettering-color-select');
        const holderColorSelect = card.querySelector('.holder-color-select');
        
        const updateHandler = () => updateColorPreview(card, canvas, cardIndex, swatchContainer);
        
        if (capColorSelect) {
            capColorSelect.addEventListener('change', updateHandler);
        }
        if (letteringColorSelect) {
            letteringColorSelect.addEventListener('change', updateHandler);
        }
        if (holderColorSelect) {
            holderColorSelect.addEventListener('change', updateHandler);
        }
    }

    function updateColorPreview(card, canvas, cardIndex, swatchContainer) {
        const originalImageData = imageCache.get(cardIndex);
        if (!originalImageData) return;

        const capColorSelect = card.querySelector('.cap-color-select');
        const letteringColorSelect = card.querySelector('.lettering-color-select');
        const holderColorSelect = card.querySelector('.holder-color-select');
        
        const capColor = capColorSelect ? capColorSelect.value : null;
        const letteringColor = letteringColorSelect ? letteringColorSelect.value : null;
        const holderColor = holderColorSelect ? holderColorSelect.value : null;
        
        // Skip if out of stock
        if (capColor === 'out-of-stock' || letteringColor === 'out-of-stock' || holderColor === 'out-of-stock') {
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Create a copy of the original image data
        const imageData = ctx.createImageData(originalImageData);
        const data = imageData.data;
        const originalData = originalImageData.data;
        
        // Copy original data
        for (let i = 0; i < originalData.length; i++) {
            data[i] = originalData[i];
        }

        // Apply color transformations
        const primaryColor = capColor || holderColor;
        
        if (primaryColor && COLOR_MAP[primaryColor]) {
            recolorImage(data, canvas.width, canvas.height, primaryColor, letteringColor);
        }
        
        // Put the modified image data back on canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Update swatches
        updateSwatches(swatchContainer, capColor, letteringColor, holderColor);
    }

    function recolorImage(data, width, height, capColor, letteringColor) {
        const capRGB = COLOR_MAP[capColor];
        const letteringRGB = letteringColor ? COLOR_MAP[letteringColor] : null;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent pixels
            if (a < 10) continue;
            
            // Calculate brightness/luminance
            const brightness = (r + g + b) / 3;
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Determine if this pixel is "text/lettering" or "cap body"
            // Lettering is typically darker or very bright (white text)
            // This is a heuristic - adjust thresholds based on your images
            const isLettering = (luminance < 80 || luminance > 200) && (r + g + b) !== 0;
            
            if (isLettering && letteringRGB) {
                // Recolor lettering
                const factor = luminance / 128; // Preserve some depth
                data[i] = letteringRGB.r * factor;
                data[i + 1] = letteringRGB.g * factor;
                data[i + 2] = letteringRGB.b * factor;
            } else if (capRGB) {
                // Recolor cap body
                // Preserve lighting/shading by using the original brightness
                const factor = brightness / 128;
                data[i] = capRGB.r * factor;
                data[i + 1] = capRGB.g * factor;
                data[i + 2] = capRGB.b * factor;
            }
        }
    }

    function updateSwatches(container, capColor, letteringColor, holderColor) {
        container.innerHTML = '';
        
        if (capColor && capColor !== 'out-of-stock') {
            addSwatch(container, capColor, 'Cap', true);
        }
        if (holderColor && holderColor !== 'out-of-stock') {
            addSwatch(container, holderColor, 'Holder', true);
        }
        if (letteringColor && letteringColor !== 'out-of-stock') {
            addSwatch(container, letteringColor, 'Lettering', false);
        }
    }

    function addSwatch(container, colorValue, label, isPrimary) {
        const rgb = COLOR_MAP[colorValue];
        if (!rgb) return;
        
        const swatch = document.createElement('div');
        swatch.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            background: white;
            border-radius: 6px;
            font-size: 0.75rem;
            border: ${isPrimary ? '2px solid #667eea' : '1px solid #ddd'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        `;
        
        swatch.addEventListener('mouseover', () => {
            swatch.style.transform = 'translateY(-2px)';
        });
        
        swatch.addEventListener('mouseout', () => {
            swatch.style.transform = 'translateY(0)';
        });
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 4px;
            background: rgb(${rgb.r}, ${rgb.g}, ${rgb.b});
            border: 2px solid rgba(0,0,0,0.2);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = `${label}: ${formatColorName(colorValue)}`;
        labelSpan.style.cssText = `
            font-weight: ${isPrimary ? 'bold' : '600'};
            color: #333;
        `;
        
        swatch.appendChild(colorBox);
        swatch.appendChild(labelSpan);
        container.appendChild(swatch);
    }

    function formatColorName(colorValue) {
        return colorValue.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Add enhanced "View Live Preview" button
    function addLivePreviewButtons() {
        document.querySelectorAll('.product-card').forEach(card => {
            const colorSelects = card.querySelectorAll('.cap-color-select, .lettering-color-select, .holder-color-select');
            if (colorSelects.length === 0) return;
            
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (!addToCartBtn) return;
            
            // Check if button already exists
            if (card.querySelector('.live-preview-btn')) return;
            
            const previewBtn = document.createElement('button');
            previewBtn.className = 'live-preview-btn';
            previewBtn.innerHTML = '✨ View Live Preview';
            previewBtn.style.cssText = `
                margin-top: 8px;
                padding: 10px 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                font-size: 0.95rem;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            `;
            
            previewBtn.addEventListener('mouseover', () => {
                previewBtn.style.transform = 'translateY(-2px)';
                previewBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            });
            
            previewBtn.addEventListener('mouseout', () => {
                previewBtn.style.transform = 'translateY(0)';
                previewBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            });
            
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showLivePreviewModal(card);
            });
            
            addToCartBtn.parentNode.insertBefore(previewBtn, addToCartBtn.nextSibling);
        });
    }

    function showLivePreviewModal(card) {
        // Create or get modal
        let modal = document.getElementById('live-preview-modal');
        if (!modal) {
            modal = createLivePreviewModal();
        }

        const canvas = card.querySelector('.color-preview-canvas');
        const productName = card.querySelector('h3')?.textContent;
        const capColor = card.querySelector('.cap-color-select')?.value;
        const letteringColor = card.querySelector('.lettering-color-select')?.value;
        const holderColor = card.querySelector('.holder-color-select')?.value;
        
        // Update modal content
        const modalCanvas = document.getElementById('live-preview-canvas');
        const modalName = document.getElementById('live-preview-name');
        const modalColors = document.getElementById('live-preview-colors');
        
        if (canvas && modalCanvas) {
            const ctx = modalCanvas.getContext('2d');
            modalCanvas.width = canvas.width;
            modalCanvas.height = canvas.height;
            ctx.drawImage(canvas, 0, 0);
        }
        
        if (modalName) {
            modalName.textContent = productName || 'Product Preview';
        }
        
        if (modalColors) {
            modalColors.innerHTML = '';
            if (capColor && capColor !== 'out-of-stock') {
                modalColors.innerHTML += createColorCard('Cap Color', capColor);
            }
            if (holderColor && holderColor !== 'out-of-stock') {
                modalColors.innerHTML += createColorCard('Holder Color', holderColor);
            }
            if (letteringColor && letteringColor !== 'out-of-stock') {
                modalColors.innerHTML += createColorCard('Lettering Color', letteringColor);
            }
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function createLivePreviewModal() {
        const modal = document.createElement('div');
        modal.id = 'live-preview-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 16px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <button onclick="this.closest('#live-preview-modal').style.display='none'; document.body.style.overflow=''" 
                        style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4); transition: transform 0.2s ease;"
                        onmouseover="this.style.transform='rotate(90deg) scale(1.1)'"
                        onmouseout="this.style.transform='rotate(0) scale(1)'">×</button>
                
                <h2 id="live-preview-name" style="margin: 0 0 20px 0; color: #333; font-size: 1.8rem; text-align: center; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Product Preview</h2>
                
                <div style="text-align: center; margin-bottom: 20px; background: #f8f9fa; padding: 20px; border-radius: 12px;">
                    <canvas id="live-preview-canvas" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);"></canvas>
                </div>
                
                <div id="live-preview-colors" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;"></div>
                
                <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 8px; border: 1px solid #e0e0e0;">
                    <p style="margin: 0; color: #666; font-size: 0.95rem;">
                        <strong>✨ Live Color Preview</strong><br>
                        This preview shows your exact color selections applied to the product image. Colors are digitally rendered and may vary slightly from the final 3D printed product.
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        return modal;
    }

    function createColorCard(label, colorValue) {
        const rgb = COLOR_MAP[colorValue];
        if (!rgb) return '';
        
        return `
            <div style="background: white; padding: 15px 20px; border-radius: 8px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 2px solid #e0e0e0;">
                <div style="width: 50px; height: 50px; border-radius: 8px; background: rgb(${rgb.r}, ${rgb.g}, ${rgb.b}); border: 3px solid rgba(0,0,0,0.1); box-shadow: inset 0 2px 6px rgba(0,0,0,0.2);"></div>
                <div style="text-align: left;">
                    <div style="font-weight: bold; color: #333; font-size: 1rem;">${label}</div>
                    <div style="color: #667eea; font-size: 0.95rem; font-weight: 600;">${formatColorName(colorValue)}</div>
                    <div style="color: #999; font-size: 0.8rem;">RGB(${rgb.r}, ${rgb.g}, ${rgb.b})</div>
                </div>
            </div>
        `;
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .color-preview-canvas {
            transition: transform 0.3s ease;
        }
        
        .color-preview-canvas:hover {
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                initAdvancedPreview();
                addLivePreviewButtons();
            }, 100);
        });
    } else {
        setTimeout(() => {
            initAdvancedPreview();
            addLivePreviewButtons();
        }, 100);
    }

    // Re-initialize if new products are added
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('product-card')) {
                        setTimeout(() => {
                            initAdvancedPreview();
                            addLivePreviewButtons();
                        }, 100);
                    }
                });
            }
        });
    });

    const mainElement = document.querySelector('main');
    if (mainElement) {
        observer.observe(mainElement, {
            childList: true,
            subtree: true
        });
    }

    console.log('✨ Advanced Color Preview System with Pixel Recoloring loaded!');
})();
