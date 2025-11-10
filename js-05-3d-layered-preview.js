// Ultimate 3D-Style Color Preview with Layered SVG Graphics
// This creates a realistic 3D appearance with separate cap and text layers

(function() {
    'use strict';

    const COLOR_MAP = {
        'black': '#1a1a1a',
        'white': '#f5f5f5',
        'red': '#e74c3c',
        'blue': '#3498db',
        'green': '#27ae60',
        'yellow': '#f1c40f',
        'orange': '#e67e22',
        'gray': '#95a5a6',
        'od-green': '#4a5a3f',
        'tan': '#d2b48c',
        'camo': 'url(#camoPattern)'
    };

    console.log('🎨 3D-Style Layered Preview System Loading...');

    function init3DPreview() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            const img = card.querySelector('img');
            const capColorSelect = card.querySelector('.cap-color-select');
            const letteringColorSelect = card.querySelector('.lettering-color-select');
            const holderColorSelect = card.querySelector('.holder-color-select');
            
            if (!capColorSelect && !letteringColorSelect && !holderColorSelect) return;
            
            if (img && img.src) {
                setup3DPreview(card, img, index);
            }
        });
        
        console.log(`✅ 3D Preview initialized`);
    }

    function setup3DPreview(card, originalImg, cardIndex) {
        // Create 3D preview container
        const container = document.createElement('div');
        container.className = 'preview-3d-container';
        container.style.cssText = `
            position: relative;
            width: 100%;
            border-radius: 12px;
            overflow: visible;
            background: linear-gradient(145deg, #f0f0f0, #ffffff);
            padding: 20px;
            box-shadow: 
                inset 0 2px 10px rgba(0,0,0,0.05),
                0 4px 20px rgba(0,0,0,0.1);
        `;

        // Create SVG element for 3D rendering
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 400 400');
        svg.setAttribute('class', 'preview-3d-svg');
        svg.style.cssText = `
            width: 100%;
            height: auto;
            filter: drop-shadow(0 10px 30px rgba(0,0,0,0.2));
        `;

        // Add camo pattern definition
        svg.innerHTML = `
            <defs>
                <!-- Camo Pattern -->
                <pattern id="camoPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                    <rect width="40" height="40" fill="#4a5a3f"/>
                    <path d="M0 0 L20 20 L0 40 Z" fill="#3a4a2f"/>
                    <path d="M40 0 L20 20 L40 40 Z" fill="#5a6a4f"/>
                    <circle cx="10" cy="30" r="8" fill="#3a4a2f" opacity="0.5"/>
                    <circle cx="30" cy="10" r="6" fill="#2a3a1f" opacity="0.5"/>
                </pattern>
                
                <!-- Gradients for 3D effect -->
                <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
                    <stop offset="50%" style="stop-color:white;stop-opacity:0" />
                    <stop offset="100%" style="stop-color:black;stop-opacity:0.2" />
                </linearGradient>
                
                <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:white;stop-opacity:0.5" />
                    <stop offset="50%" style="stop-color:white;stop-opacity:0.1" />
                    <stop offset="100%" style="stop-color:white;stop-opacity:0" />
                </linearGradient>

                <!-- Shadow filter -->
                <filter id="innerShadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="0" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>

                <!-- 3D depth effect -->
                <filter id="depth3d">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="2" dy="4" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Background circle for depth -->
            <circle cx="200" cy="200" r="180" fill="#e0e0e0" opacity="0.3"/>
            
            <!-- Cap Body - Main cylinder shape -->
            <g id="capBody" filter="url(#depth3d)">
                <!-- Top ellipse -->
                <ellipse cx="200" cy="150" rx="120" ry="30" 
                         fill="black" opacity="0.9"
                         stroke="#333" stroke-width="2"/>
                <ellipse cx="200" cy="150" rx="120" ry="30" 
                         fill="url(#capGradient)" opacity="0.6"/>
                
                <!-- Side walls -->
                <rect x="80" y="150" width="240" height="100" 
                      fill="black"/>
                <rect x="80" y="150" width="240" height="100" 
                      fill="url(#capGradient)" opacity="0.7"/>
                
                <!-- Bottom ellipse -->
                <ellipse cx="200" cy="250" rx="120" ry="30" 
                         fill="black"/>
                <ellipse cx="200" cy="250" rx="120" ry="30" 
                         fill="url(#capGradient)" opacity="0.5"/>
                
                <!-- Highlight on top -->
                <ellipse cx="200" cy="150" rx="100" ry="20" 
                         fill="url(#highlightGradient)" opacity="0.4"/>
            </g>
            
            <!-- Lettering/Logo Layer -->
            <g id="letteringLayer">
                <!-- "BACKCREEK" text on cap -->
                <text x="200" y="205" 
                      font-family="Arial, sans-serif" 
                      font-size="32" 
                      font-weight="bold" 
                      text-anchor="middle"
                      fill="white"
                      stroke="#000" stroke-width="1"
                      filter="url(#depth3d)">
                    BACKCREEK
                </text>
                
                <!-- Decorative elements -->
                <circle cx="200" cy="160" r="8" fill="white" opacity="0.8"/>
                <circle cx="200" cy="240" r="8" fill="white" opacity="0.8"/>
            </g>
            
            <!-- Glass reflection effect -->
            <ellipse cx="200" cy="165" rx="90" ry="15" 
                     fill="white" opacity="0.2"
                     style="pointer-events: none;"/>
        `;

        // Replace original image
        const imgParent = originalImg.parentNode;
        imgParent.insertBefore(container, originalImg);
        container.appendChild(svg);
        originalImg.style.display = 'none';

        // Create interactive controls
        const controlPanel = createControlPanel();
        container.appendChild(controlPanel);

        // Create color swatches
        const swatchContainer = document.createElement('div');
        swatchContainer.className = 'color-swatches-3d';
        swatchContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        container.parentNode.insertBefore(swatchContainer, container.nextSibling);

        // Setup color change listeners
        setup3DColorListeners(card, svg, swatchContainer);

        // Initial render
        update3DPreview(card, svg, swatchContainer);
    }

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.className = 'preview-control-panel';
        panel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-size: 0.75rem;
            color: #667eea;
            font-weight: bold;
            backdrop-filter: blur(10px);
            border: 2px solid #667eea;
        `;
        panel.textContent = '✨ Live 3D Preview';
        return panel;
    }

    function setup3DColorListeners(card, svg, swatchContainer) {
        const capColorSelect = card.querySelector('.cap-color-select');
        const letteringColorSelect = card.querySelector('.lettering-color-select');
        
        const updateHandler = () => update3DPreview(card, svg, swatchContainer);
        
        if (capColorSelect) {
            capColorSelect.addEventListener('change', updateHandler);
        }
        if (letteringColorSelect) {
            letteringColorSelect.addEventListener('change', updateHandler);
        }
    }

    function update3DPreview(card, svg, swatchContainer) {
        const capColorSelect = card.querySelector('.cap-color-select');
        const letteringColorSelect = card.querySelector('.lettering-color-select');
        
        const capColor = capColorSelect ? capColorSelect.value : 'black';
        const letteringColor = letteringColorSelect ? letteringColorSelect.value : 'white';
        
        if (capColor === 'out-of-stock' || letteringColor === 'out-of-stock') return;

        // Update cap body color
        const capBody = svg.querySelector('#capBody');
        if (capBody) {
            const capElements = capBody.querySelectorAll('ellipse, rect');
            const capColorValue = COLOR_MAP[capColor] || '#1a1a1a';
            
            capElements.forEach((el, index) => {
                if (el.getAttribute('fill') !== 'url(#capGradient)' && 
                    el.getAttribute('fill') !== 'url(#highlightGradient)') {
                    el.setAttribute('fill', capColorValue);
                }
            });
        }

        // Update lettering color
        const letteringLayer = svg.querySelector('#letteringLayer');
        if (letteringLayer) {
            const textElements = letteringLayer.querySelectorAll('text, circle');
            const letteringColorValue = COLOR_MAP[letteringColor] || '#ffffff';
            
            textElements.forEach(el => {
                if (el.tagName === 'text') {
                    el.setAttribute('fill', letteringColorValue);
                } else if (el.tagName === 'circle') {
                    el.setAttribute('fill', letteringColorValue);
                }
            });
        }

        // Add rotation animation on color change
        svg.style.transform = 'rotateY(5deg) scale(1.02)';
        setTimeout(() => {
            svg.style.transform = 'rotateY(0deg) scale(1)';
        }, 300);
        svg.style.transition = 'transform 0.3s ease';

        // Update swatches
        updateSwatches3D(swatchContainer, capColor, letteringColor);
    }

    function updateSwatches3D(container, capColor, letteringColor) {
        container.innerHTML = '';
        
        if (capColor && capColor !== 'out-of-stock') {
            addSwatch3D(container, capColor, 'Cap Body', '🎨');
        }
        if (letteringColor && letteringColor !== 'out-of-stock') {
            addSwatch3D(container, letteringColor, 'Lettering', '✍️');
        }
    }

    function addSwatch3D(container, colorValue, label, icon) {
        const colorHex = COLOR_MAP[colorValue];
        if (!colorHex) return;
        
        const swatch = document.createElement('div');
        swatch.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            background: linear-gradient(145deg, #ffffff, #f0f0f0);
            border-radius: 8px;
            font-size: 0.85rem;
            border: 2px solid #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            transition: transform 0.2s ease;
            cursor: pointer;
        `;
        
        swatch.addEventListener('mouseover', () => {
            swatch.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        swatch.addEventListener('mouseout', () => {
            swatch.style.transform = 'translateY(0) scale(1)';
        });
        
        const iconSpan = document.createElement('span');
        iconSpan.textContent = icon;
        iconSpan.style.fontSize = '1.2rem';
        
        const colorBox = document.createElement('div');
        const isCamo = colorValue === 'camo';
        colorBox.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 6px;
            ${isCamo ? `
                background: linear-gradient(45deg, #4a5a3f 25%, #3a4a2f 25%, #3a4a2f 50%, #4a5a3f 50%, #4a5a3f 75%, #3a4a2f 75%);
                background-size: 16px 16px;
            ` : `background: ${colorHex};`}
            border: 3px solid rgba(0,0,0,0.2);
            box-shadow: 
                inset 0 2px 4px rgba(255,255,255,0.3),
                0 2px 8px rgba(0,0,0,0.2);
        `;
        
        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = `
            display: flex;
            flex-direction: column;
        `;
        
        const labelText = document.createElement('span');
        labelText.textContent = label;
        labelText.style.cssText = `
            font-weight: bold;
            color: #333;
            font-size: 0.8rem;
        `;
        
        const colorName = document.createElement('span');
        colorName.textContent = formatColorName(colorValue);
        colorName.style.cssText = `
            color: #667eea;
            font-size: 0.75rem;
            font-weight: 600;
        `;
        
        labelDiv.appendChild(labelText);
        labelDiv.appendChild(colorName);
        
        swatch.appendChild(iconSpan);
        swatch.appendChild(colorBox);
        swatch.appendChild(labelDiv);
        container.appendChild(swatch);
    }

    function formatColorName(colorValue) {
        return colorValue.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Add 3D View Modal Button
    function add3DViewButtons() {
        document.querySelectorAll('.product-card').forEach(card => {
            const colorSelects = card.querySelectorAll('.cap-color-select, .lettering-color-select');
            if (colorSelects.length === 0) return;
            
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (!addToCartBtn || card.querySelector('.view-3d-btn')) return;
            
            const view3DBtn = document.createElement('button');
            view3DBtn.className = 'view-3d-btn';
            view3DBtn.innerHTML = '🎭 View 3D Model';
            view3DBtn.style.cssText = `
                margin-top: 8px;
                padding: 12px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                width: 100%;
                font-size: 1rem;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            `;
            
            view3DBtn.addEventListener('mouseover', () => {
                view3DBtn.style.transform = 'translateY(-3px)';
                view3DBtn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
            });
            
            view3DBtn.addEventListener('mouseout', () => {
                view3DBtn.style.transform = 'translateY(0)';
                view3DBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            });
            
            view3DBtn.addEventListener('click', (e) => {
                e.preventDefault();
                show3DModal(card);
            });
            
            addToCartBtn.parentNode.insertBefore(view3DBtn, addToCartBtn.nextSibling);
        });
    }

    function show3DModal(card) {
        const modal = create3DModal();
        const svg = card.querySelector('.preview-3d-svg');
        const productName = card.querySelector('h3')?.textContent;
        const capColor = card.querySelector('.cap-color-select')?.value;
        const letteringColor = card.querySelector('.lettering-color-select')?.value;
        
        const modalSVG = modal.querySelector('#modal-3d-svg');
        if (svg && modalSVG) {
            modalSVG.innerHTML = svg.innerHTML;
            
            // Re-apply colors to modal SVG
            const capBody = modalSVG.querySelector('#capBody');
            const letteringLayer = modalSVG.querySelector('#letteringLayer');
            
            if (capBody && capColor) {
                const capColorValue = COLOR_MAP[capColor] || '#1a1a1a';
                capBody.querySelectorAll('ellipse, rect').forEach(el => {
                    if (el.getAttribute('fill') !== 'url(#capGradient)' && 
                        el.getAttribute('fill') !== 'url(#highlightGradient)') {
                        el.setAttribute('fill', capColorValue);
                    }
                });
            }
            
            if (letteringLayer && letteringColor) {
                const letteringColorValue = COLOR_MAP[letteringColor] || '#ffffff';
                letteringLayer.querySelectorAll('text, circle').forEach(el => {
                    if (el.tagName === 'text') {
                        el.setAttribute('fill', letteringColorValue);
                    } else {
                        el.setAttribute('fill', letteringColorValue);
                    }
                });
            }
        }
        
        const modalTitle = modal.querySelector('#modal-title');
        if (modalTitle) {
            modalTitle.textContent = productName || 'Product 3D View';
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function create3DModal() {
        let modal = document.getElementById('preview-3d-modal');
        if (modal) return modal;
        
        modal = document.createElement('div');
        modal.id = 'preview-3d-modal';
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
            <div style="background: linear-gradient(145deg, #ffffff, #f0f0f0); padding: 40px; border-radius: 20px; max-width: 800px; width: 90%; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <button onclick="this.closest('#preview-3d-modal').style.display='none'; document.body.style.overflow=''" 
                        style="position: absolute; top: 20px; right: 20px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 24px; font-weight: bold; box-shadow: 0 4px 15px rgba(231, 76, 60, 0.5);">×</button>
                
                <h2 id="modal-title" style="margin: 0 0 30px 0; color: #333; font-size: 2rem; text-align: center; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    3D Product View
                </h2>
                
                <div style="background: linear-gradient(145deg, #f0f0f0, #ffffff); padding: 30px; border-radius: 16px; box-shadow: inset 0 4px 20px rgba(0,0,0,0.1);">
                    <svg id="modal-3d-svg" viewBox="0 0 400 400" style="width: 100%; height: auto; filter: drop-shadow(0 15px 40px rgba(0,0,0,0.3));"></svg>
                </div>
                
                <div style="margin-top: 30px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 12px; border: 2px solid #667eea;">
                    <p style="margin: 0; color: #333; font-size: 1rem; font-weight: 500;">
                        <strong style="color: #667eea;">✨ Interactive 3D Model</strong><br>
                        This is a layered vector graphic that separates the cap body from the lettering for accurate color customization.
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        return modal;
    }

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .preview-3d-svg {
            transform-style: preserve-3d;
        }
    `;
    document.head.appendChild(style);

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                init3DPreview();
                add3DViewButtons();
            }, 100);
        });
    } else {
        setTimeout(() => {
            init3DPreview();
            add3DViewButtons();
        }, 100);
    }

    console.log('✨ 3D Layered Preview System loaded!');
})();
