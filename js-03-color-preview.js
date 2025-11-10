// Live Color Preview System for Backcreek Designs
// This script enables real-time visual previews when customers change product colors

(function() {
    'use strict';

    // Color mapping with actual hex values
    const COLOR_MAP = {
        // Standard colors
        'black': '#1a1a1a',
        'white': '#f5f5f5',
        'red': '#e74c3c',
        'blue': '#3498db',
        'green': '#27ae60',
        'yellow': '#f1c40f',
        'orange': '#e67e22',
        'gray': '#95a5a6',
        // Tactical/Marine colors
        'od-green': '#4a5a3f',
        'tan': '#d2b48c',
        'camo': '#4a5a3f', // Will use pattern
        // Material colors (for reference)
        'pla+': '#e8e8e8',
        'petg': '#d4d4d4',
        'tpu': '#c0c0c0',
        'abs': '#a0a0a0'
    };

    // Initialize color preview on page load
    function initColorPreview() {
        console.log('🎨 Initializing Color Preview System...');
        
        // Find all product cards
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            setupCardPreview(card, index);
        });
        
        console.log(`✅ Color Preview initialized for ${productCards.length} products`);
    }

    function setupCardPreview(card, cardIndex) {
        const img = card.querySelector('img');
        if (!img) return;

        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'color-preview-container';
        previewContainer.style.cssText = `
            position: relative;
            width: 100%;
            margin: 12px 0;
            border-radius: 8px;
            overflow: hidden;
        `;

        // Wrap the image
        const imgParent = img.parentNode;
        imgParent.insertBefore(previewContainer, img);
        previewContainer.appendChild(img);

        // Create SVG overlay for color visualization
        const overlay = document.createElement('div');
        overlay.className = 'color-preview-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            mix-blend-mode: multiply;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1;
        `;
        previewContainer.appendChild(overlay);

        // Create color preview badge
        const badge = document.createElement('div');
        badge.className = 'color-preview-badge';
        badge.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: bold;
            z-index: 2;
            display: none;
            backdrop-filter: blur(4px);
        `;
        badge.textContent = 'Preview';
        previewContainer.appendChild(badge);

        // Create color swatches display
        const swatchContainer = document.createElement('div');
        swatchContainer.className = 'color-swatches';
        swatchContainer.style.cssText = `
            display: flex;
            gap: 6px;
            justify-content: center;
            margin-top: 8px;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 6px;
            flex-wrap: wrap;
        `;
        
        const colorSelects = card.querySelectorAll('.cap-color-select, .lettering-color-select, .holder-color-select');
        
        if (colorSelects.length > 0) {
            previewContainer.parentNode.insertBefore(swatchContainer, previewContainer.nextSibling);
        }

        // Set up color change listeners
        setupColorListeners(card, img, overlay, badge, swatchContainer);
    }

    function setupColorListeners(card, img, overlay, badge, swatchContainer) {
        const capColorSelect = card.querySelector('.cap-color-select');
        const letteringColorSelect = card.querySelector('.lettering-color-select');
        const holderColorSelect = card.querySelector('.holder-color-select');
        
        function updatePreview() {
            const capColor = capColorSelect ? capColorSelect.value : null;
            const letteringColor = letteringColorSelect ? letteringColorSelect.value : null;
            const holderColor = holderColorSelect ? holderColorSelect.value : null;
            
            // Clear swatches
            swatchContainer.innerHTML = '';
            
            // Determine primary color for overlay
            let primaryColor = capColor || holderColor;
            let secondaryColor = letteringColor;
            
            if (primaryColor && primaryColor !== 'out-of-stock') {
                // Show preview
                badge.style.display = 'block';
                
                // Apply color filter to image
                const hexColor = COLOR_MAP[primaryColor];
                if (hexColor) {
                    overlay.style.backgroundColor = hexColor;
                    overlay.style.opacity = '0.3';
                    
                    // Add subtle filter to the image for better color visualization
                    img.style.filter = `
                        sepia(0.2) 
                        hue-rotate(${getHueRotation(primaryColor)}deg) 
                        brightness(${getBrightness(primaryColor)})
                        contrast(1.1)
                    `;
                }
                
                // Create color swatches
                if (capColor || holderColor) {
                    addSwatch(swatchContainer, capColor || holderColor, 
                             capColor ? 'Cap' : 'Holder', true);
                }
                
                if (letteringColor && letteringColor !== 'out-of-stock') {
                    addSwatch(swatchContainer, letteringColor, 'Lettering', false);
                }
                
                // Update badge text
                let badgeText = 'Preview: ';
                if (capColor) badgeText += capColor.toUpperCase();
                else if (holderColor) badgeText += holderColor.toUpperCase();
                badge.textContent = badgeText;
                
            } else {
                // Reset preview
                badge.style.display = 'none';
                overlay.style.opacity = '0';
                img.style.filter = 'none';
            }
        }
        
        // Add change listeners
        if (capColorSelect) {
            capColorSelect.addEventListener('change', updatePreview);
        }
        if (letteringColorSelect) {
            letteringColorSelect.addEventListener('change', updatePreview);
        }
        if (holderColorSelect) {
            holderColorSelect.addEventListener('change', updatePreview);
        }
        
        // Initial preview
        updatePreview();
    }

    function addSwatch(container, colorValue, label, isPrimary) {
        if (!colorValue || colorValue === 'out-of-stock') return;
        
        const swatch = document.createElement('div');
        swatch.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: white;
            border-radius: 4px;
            font-size: 0.7rem;
            border: ${isPrimary ? '2px solid #4CAF50' : '1px solid #ddd'};
        `;
        
        const colorBox = document.createElement('div');
        const hexColor = COLOR_MAP[colorValue] || '#ccc';
        colorBox.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 3px;
            background: ${hexColor};
            border: 1px solid rgba(0,0,0,0.2);
            ${colorValue === 'camo' ? 'background: linear-gradient(45deg, #4a5a3f 25%, #3a4a2f 25%, #3a4a2f 50%, #4a5a3f 50%, #4a5a3f 75%, #3a4a2f 75%); background-size: 8px 8px;' : ''}
        `;
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = `${label}: ${formatColorName(colorValue)}`;
        labelSpan.style.fontWeight = isPrimary ? 'bold' : 'normal';
        
        swatch.appendChild(colorBox);
        swatch.appendChild(labelSpan);
        container.appendChild(swatch);
    }

    function formatColorName(colorValue) {
        return colorValue.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    function getHueRotation(colorValue) {
        const rotations = {
            'black': 0,
            'white': 0,
            'red': -20,
            'blue': 180,
            'green': 90,
            'yellow': 40,
            'orange': 20,
            'gray': 0,
            'od-green': 70,
            'tan': 30,
            'camo': 70
        };
        return rotations[colorValue] || 0;
    }

    function getBrightness(colorValue) {
        const brightness = {
            'black': '0.8',
            'white': '1.2',
            'red': '1',
            'blue': '0.95',
            'green': '0.95',
            'yellow': '1.1',
            'orange': '1',
            'gray': '1',
            'od-green': '0.85',
            'tan': '1.05',
            'camo': '0.85'
        };
        return brightness[colorValue] || '1';
    }

    // Enhanced 3D visualization modal
    function create3DPreviewModal() {
        const modal = document.createElement('div');
        modal.id = 'preview-3d-modal';
        modal.className = 'preview-3d-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            justify-content: center;
            align-items: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; position: relative;">
                <button onclick="this.closest('.preview-3d-modal').style.display='none'" 
                        style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
                <h2 style="margin-bottom: 20px; color: #333;">🎨 Color Preview</h2>
                <div id="preview-content" style="text-align: center;">
                    <img id="preview-large-img" style="max-width: 100%; border-radius: 8px; margin-bottom: 20px;">
                    <div id="preview-color-info" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;"></div>
                </div>
                <p style="margin-top: 20px; color: #666; font-size: 0.9rem; text-align: center;">
                    This is a simulated preview. Actual product colors may vary slightly based on material and printer settings.
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Add "View Full Preview" buttons to product cards
    function addPreviewButtons() {
        document.querySelectorAll('.product-card').forEach(card => {
            const colorSelects = card.querySelectorAll('.cap-color-select, .lettering-color-select, .holder-color-select');
            if (colorSelects.length === 0) return;
            
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (!addToCartBtn) return;
            
            // Check if button already exists
            if (card.querySelector('.preview-btn')) return;
            
            const previewBtn = document.createElement('button');
            previewBtn.className = 'preview-btn';
            previewBtn.textContent = '👁️ View Full Preview';
            previewBtn.style.cssText = `
                margin-top: 8px;
                padding: 8px 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                font-size: 0.9rem;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            `;
            
            previewBtn.addEventListener('mouseover', () => {
                previewBtn.style.transform = 'translateY(-2px)';
                previewBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            });
            
            previewBtn.addEventListener('mouseout', () => {
                previewBtn.style.transform = 'translateY(0)';
                previewBtn.style.boxShadow = 'none';
            });
            
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showFullPreview(card);
            });
            
            addToCartBtn.parentNode.insertBefore(previewBtn, addToCartBtn.nextSibling);
        });
    }

    function showFullPreview(card) {
        let modal = document.getElementById('preview-3d-modal');
        if (!modal) {
            create3DPreviewModal();
            modal = document.getElementById('preview-3d-modal');
        }
        
        const img = card.querySelector('img');
        const capColor = card.querySelector('.cap-color-select')?.value;
        const letteringColor = card.querySelector('.lettering-color-select')?.value;
        const holderColor = card.querySelector('.holder-color-select')?.value;
        const productName = card.querySelector('h3')?.textContent;
        
        const previewImg = document.getElementById('preview-large-img');
        const colorInfo = document.getElementById('preview-color-info');
        
        previewImg.src = img.src;
        
        // Apply same filters as small preview
        const primaryColor = capColor || holderColor;
        if (primaryColor && primaryColor !== 'out-of-stock') {
            previewImg.style.filter = `
                sepia(0.2) 
                hue-rotate(${getHueRotation(primaryColor)}deg) 
                brightness(${getBrightness(primaryColor)})
                contrast(1.1)
            `;
        }
        
        // Build color info
        colorInfo.innerHTML = `<h3 style="width: 100%; margin-bottom: 10px;">${productName}</h3>`;
        
        if (capColor && capColor !== 'out-of-stock') {
            colorInfo.innerHTML += createColorInfoCard('Cap Color', capColor);
        }
        if (holderColor && holderColor !== 'out-of-stock') {
            colorInfo.innerHTML += createColorInfoCard('Holder Color', holderColor);
        }
        if (letteringColor && letteringColor !== 'out-of-stock') {
            colorInfo.innerHTML += createColorInfoCard('Lettering Color', letteringColor);
        }
        
        modal.style.display = 'flex';
    }

    function createColorInfoCard(label, colorValue) {
        const hexColor = COLOR_MAP[colorValue] || '#ccc';
        return `
            <div style="background: #f8f9fa; padding: 12px 16px; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; border-radius: 6px; background: ${hexColor}; border: 2px solid #ddd;
                    ${colorValue === 'camo' ? 'background: linear-gradient(45deg, #4a5a3f 25%, #3a4a2f 25%, #3a4a2f 50%, #4a5a3f 50%, #4a5a3f 75%, #3a4a2f 75%); background-size: 16px 16px;' : ''}
                "></div>
                <div style="text-align: left;">
                    <div style="font-weight: bold; color: #333;">${label}</div>
                    <div style="color: #666; font-size: 0.9rem;">${formatColorName(colorValue)}</div>
                </div>
            </div>
        `;
    }

    // Add visual indicator of color availability
    function enhanceColorSelectors() {
        document.querySelectorAll('.cap-color-select, .lettering-color-select, .holder-color-select').forEach(select => {
            // Add color preview dots next to options
            const options = select.querySelectorAll('option');
            
            // Style the select element
            select.style.cursor = 'pointer';
            select.style.fontWeight = '500';
            
            // Create a color preview dot next to the select
            const currentColor = select.value;
            if (currentColor && currentColor !== 'out-of-stock') {
                updateSelectColorIndicator(select, currentColor);
            }
            
            select.addEventListener('change', function() {
                updateSelectColorIndicator(this, this.value);
            });
        });
    }

    function updateSelectColorIndicator(select, colorValue) {
        // Remove existing indicator
        const existingIndicator = select.parentNode.querySelector('.color-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (!colorValue || colorValue === 'out-of-stock') return;
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'color-indicator';
        const hexColor = COLOR_MAP[colorValue] || '#ccc';
        indicator.style.cssText = `
            position: absolute;
            right: 35px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${hexColor};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            pointer-events: none;
            ${colorValue === 'camo' ? 'background: linear-gradient(45deg, #4a5a3f 25%, #3a4a2f 25%, #3a4a2f 50%, #4a5a3f 50%, #4a5a3f 75%, #3a4a2f 75%); background-size: 8px 8px;' : ''}
        `;
        
        // Make parent relative if not already
        if (getComputedStyle(select.parentNode).position === 'static') {
            select.parentNode.style.position = 'relative';
        }
        
        select.parentNode.appendChild(indicator);
    }

    // Initialize everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initColorPreview();
            addPreviewButtons();
            enhanceColorSelectors();
        });
    } else {
        initColorPreview();
        addPreviewButtons();
        enhanceColorSelectors();
    }

    // Re-initialize if new products are added dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('product-card')) {
                        const cards = [node];
                        cards.forEach((card, index) => {
                            setupCardPreview(card, index);
                        });
                        addPreviewButtons();
                        enhanceColorSelectors();
                    }
                });
            }
        });
    });

    // Observe the main content area
    const mainElement = document.querySelector('main');
    if (mainElement) {
        observer.observe(mainElement, {
            childList: true,
            subtree: true
        });
    }

    console.log('🎨 Color Preview System loaded and ready!');
})();
