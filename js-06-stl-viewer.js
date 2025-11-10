// 3D STL Model Viewer with Color Customization
// Uses Three.js to render actual STL files with interactive rotation

(function() {
    'use strict';

    const COLOR_MAP = {
        'black': 0x1a1a1a,
        'white': 0xf5f5f5,
        'red': 0xe74c3c,
        'blue': 0x3498db,
        'green': 0x27ae60,
        'yellow': 0xf1c40f,
        'orange': 0xe67e22,
        'gray': 0x95a5a6,
        'od-green': 0x4a5a3f,
        'tan': 0xd2b48c,
        'camo': 0x4a5a3f
    };

    // Map product IDs to their STL file paths
    // For products with separate cap and lettering, use an object with 'cap' and 'lettering' properties
    // For single-piece products, just use a string path
    const STL_FILES = {
        'cap1': {
            cap: 'models/plaincap.stl',
            lettering: 'models/plaincaptext.stl'
        },
        'cap2': {
            cap: 'models/plaincenterridgecap.stl',
            lettering: 'models/centerridgecaptext.stl'
        },
        'cap3': 'models/plainingravedback.stl',
        'premium1': 'models/yamaha-cap.stl',
        'premium2': 'models/american-flag-cap.stl', 
        'premium3': 'models/racing-cap.stl',
    // Shell holders (re-added with simplified single-part viewer logic)
    'holder1': 'models/6-shell-holder.stl',
    'holder2': 'models/12-shell-holder.stl', // Add this file to models/ to enable
    'holder3': 'models/24-shell-holder.stl', // Add this file to models/ to enable
        'keychain1': 'models/backcreek-keychain.stl',
        'keychain2': 'models/custom-keychain.stl',
        'keychain3': 'models/whistle-keychain.stl',
        'keychain4': 'models/round-keychain.stl'
    };

    console.log('🎨 3D STL Viewer System Loading...');

    function init3DViewer() {
        const productCards = document.querySelectorAll('.product-card');
        console.log(`Found ${productCards.length} product cards`);
        
        let buttonsAdded = 0;
        
        productCards.forEach((card, index) => {
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (!addToCartBtn) {
                console.log(`Card ${index + 1}: No add-to-cart button found`);
                return;
            }
            
            const productId = addToCartBtn.dataset.id;
            console.log(`Card ${index + 1}: Product ID = ${productId}`);
            
            if (!productId) {
                console.log(`Card ${index + 1}: No product ID`);
                return;
            }
            
            // Allow holders again (holder2/holder3 will show error if STL missing)

            if (!STL_FILES[productId]) {
                console.log(`Card ${index + 1}: No STL file mapped for product ID "${productId}"`);
                return;
            }
            
            console.log(`Card ${index + 1}: Adding 3D viewer button for ${productId}`);
            add3DViewerButton(card, productId);
            buttonsAdded++;
        });
        
        console.log(`✅ 3D STL Viewer initialized - Added ${buttonsAdded} 3D view buttons`);
    }

    function add3DViewerButton(card, productId) {
        const addToCartBtn = card.querySelector('.add-to-cart');
        if (!addToCartBtn || card.querySelector('.view-3d-stl-btn')) return;
        
        const view3DBtn = document.createElement('button');
        view3DBtn.className = 'view-3d-stl-btn';
        view3DBtn.innerHTML = '🔄 View 3D Model';
        view3DBtn.style.cssText = `
            margin-top: 8px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-size: 1rem;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
        `;
        
        view3DBtn.addEventListener('mouseover', () => {
            view3DBtn.style.transform = 'translateY(-3px) scale(1.02)';
            view3DBtn.style.boxShadow = '0 8px 25px rgba(17, 153, 142, 0.6)';
        });
        
        view3DBtn.addEventListener('mouseout', () => {
            view3DBtn.style.transform = 'translateY(0) scale(1)';
            view3DBtn.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.4)';
        });
        
        view3DBtn.addEventListener('click', (e) => {
            e.preventDefault();
            show3DViewer(card, productId);
        });
        
        addToCartBtn.parentNode.insertBefore(view3DBtn, addToCartBtn.nextSibling);
    }

    function show3DViewer(card, productId) {
        const modal = create3DViewerModal();
        const productName = card.querySelector('h3')?.textContent || 'Product';
        const capColorSelect = card.querySelector('.cap-color-select');
        const letteringColorSelect = card.querySelector('.lettering-color-select');
        const holderColorSelect = card.querySelector('.holder-color-select');
        
        const modalTitle = modal.querySelector('#stl-modal-title');
        if (modalTitle) {
            modalTitle.textContent = productName + ' - 3D View';
        }
        
        const viewerContainer = modal.querySelector('#stl-viewer-container');
        const loadingDiv = modal.querySelector('#stl-loading');
        const errorDiv = modal.querySelector('#stl-error');
        const controlsSection = modal.querySelector('.controls-section');
        
        // Add custom text input for cap3 (plain engraved cap)
        let existingTextInput = modal.querySelector('#custom-text-input-container');
        if (existingTextInput) {
            existingTextInput.remove();
        }
        
        if (productId === 'cap3') {
            const textInputContainer = document.createElement('div');
            textInputContainer.id = 'custom-text-input-container';
            textInputContainer.style.cssText = `
                margin-top: 15px;
                padding: 15px;
                background: linear-gradient(135deg, #11998e15, #38ef7d15);
                border-radius: 8px;
                border: 2px solid #11998e;
            `;
            textInputContainer.innerHTML = `
                <h3 style="margin: 0 0 10px 0; color: #11998e; font-size: 1.1rem;">✏️ Customize Text:</h3>
                
                <label style="font-weight: bold; color: #333; margin-bottom: 6px; display: block;">Text:</label>
                <input type="text" id="custom-3d-text" placeholder="Enter your custom text (e.g., BOAT NAME)" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; margin-bottom: 12px; box-sizing: border-box;">
                
                <label style="font-weight: bold; color: #333; margin-bottom: 6px; display: block;">Text Size: <span id="text-size-value" style="color: #11998e;">8</span></label>
                <input type="range" id="text-size-slider" min="4" max="15" value="8" step="0.5"
                       style="width: 100%; margin-bottom: 12px; accent-color: #11998e;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-top: -8px; margin-bottom: 12px;">
                    <span>Small</span>
                    <span>Large</span>
                </div>
                
                <button id="apply-3d-text" style="padding: 10px 20px; background: #11998e; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; transition: background 0.3s;">
                    Apply Text to 3D Model
                </button>
                <p style="font-size: 0.85rem; color: #666; margin: 8px 0 0 0; text-align: center;">💡 Adjust size with slider, then click Apply</p>
            `;
            
            // Insert before controls section
            if (controlsSection) {
                controlsSection.parentNode.insertBefore(textInputContainer, controlsSection);
            } else {
                errorDiv.parentNode.insertBefore(textInputContainer, errorDiv.nextSibling);
            }
            
            // Add button hover effect
            const applyBtn = textInputContainer.querySelector('#apply-3d-text');
            if (applyBtn) {
                applyBtn.addEventListener('mouseenter', () => {
                    applyBtn.style.background = '#0d7a6f';
                    applyBtn.style.transform = 'translateY(-2px)';
                    applyBtn.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.4)';
                });
                applyBtn.addEventListener('mouseleave', () => {
                    applyBtn.style.background = '#11998e';
                    applyBtn.style.transform = 'translateY(0)';
                    applyBtn.style.boxShadow = 'none';
                });
            }
        }
        
        // Show modal and loading
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        
        // Clear previous viewer
        viewerContainer.innerHTML = '';
        
        // Load and render STL
        const stlData = STL_FILES[productId];
        const initialCapColor = (capColorSelect?.value || holderColorSelect?.value || 'black');
        const initialLetteringColor = (letteringColorSelect?.value || 'white');
        
        load3DModel(viewerContainer, stlData, initialCapColor, initialLetteringColor, loadingDiv, errorDiv, {
            capColorSelect,
            letteringColorSelect,
            holderColorSelect,
            productId
        });
    }

    function load3DModel(container, stlData, initialCapColor, initialLetteringColor, loadingDiv, errorDiv, colorSelects) {
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            errorDiv.textContent = '❌ Three.js library not loaded. Please add Three.js to your page.';
            errorDiv.style.display = 'block';
            loadingDiv.style.display = 'none';
            
            // Show instructions
            const instructions = document.createElement('div');
            instructions.style.cssText = `
                background: #fff3cd;
                border: 2px solid #ffc107;
                padding: 20px;
                border-radius: 8px;
                margin: 20px;
                text-align: left;
            `;
            instructions.innerHTML = `
                <h3 style="margin-top: 0; color: #856404;">📦 Setup Required</h3>
                <p style="color: #856404;">To enable 3D STL viewing, add these scripts to your HTML:</p>
                <pre style="background: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto;">
&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"&gt;&lt;/script&gt;
&lt;script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js"&gt;&lt;/script&gt;
&lt;script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"&gt;&lt;/script&gt;</pre>
                <p style="color: #856404;"><strong>Or download the demo setup:</strong></p>
                <ol style="color: #856404;">
                    <li>Create a "models" folder in your project</li>
                    <li>Export your 3D designs as .stl files</li>
                    <li>Place STL files in the models folder</li>
                    <li>Add the Three.js scripts above to your HTML</li>
                </ol>
            `;
            container.appendChild(instructions);
            return;
        }

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Create camera - positioned for a top-angled view
        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(40, 60, 80); // Angled view from above to see cap flat with text on top

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(1, 1, 1);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-1, -1, -1);
        scene.add(directionalLight2);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(100, 10, 0xcccccc, 0xe0e0e0);
        scene.add(gridHelper);

        // Add orbit controls if available
        let controls;
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2.0;
        }

        // Load STL file(s) - supports both single file and separate cap+lettering
        if (typeof THREE.STLLoader !== 'undefined') {
            const loader = new THREE.STLLoader();
            
            // Check if this is a dual-part model (cap + lettering) or single model
            const isDualPart = typeof stlData === 'object' && stlData.cap && stlData.lettering;
            
            if (isDualPart) {
                // Load both cap and lettering separately
                let capMesh, letteringMesh;
                let capMaterial, letteringMaterial;
                let loadedCount = 0;
                
                // Create materials with better edge visibility
                capMaterial = new THREE.MeshPhongMaterial({
                    color: COLOR_MAP[initialCapColor] || 0x1a1a1a,
                    specular: 0x333333,
                    shininess: 100,
                    flatShading: false,
                    side: THREE.DoubleSide
                });
                
                letteringMaterial = new THREE.MeshPhongMaterial({
                    color: COLOR_MAP[initialLetteringColor] || 0xf5f5f5,
                    specular: 0x333333,
                    shininess: 100,
                    flatShading: false,
                    side: THREE.DoubleSide
                });
                
                // Store cap height for positioning text
                let capHeight = 0;
                let scaleValue = 1;
                
                // Load cap body
                console.log('🔄 Loading cap body from:', stlData.cap);
                loader.load(
                    stlData.cap,
                    function(geometry) {
                        geometry.center();
                        capMesh = new THREE.Mesh(geometry, capMaterial);
                        
                        // Add edge lines for better visibility
                        const capEdges = new THREE.EdgesGeometry(geometry, 15); // 15 degree threshold
                        const capLine = new THREE.LineSegments(capEdges, new THREE.LineBasicMaterial({ 
                            color: 0x000000, 
                            linewidth: 2,
                            opacity: 0.4,
                            transparent: true
                        }));
                        capMesh.add(capLine);
                        
                        // Calculate scale based on first loaded part
                        geometry.computeBoundingBox();
                        const size = new THREE.Vector3();
                        geometry.boundingBox.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);
                        scaleValue = 50 / maxDim;
                        capMesh.scale.set(scaleValue, scaleValue, scaleValue);
                        
                        // Store the cap height (after rotation, this becomes the Z dimension)
                        capHeight = size.z * scaleValue; // Height of cap after scaling
                        
                        // Rotate cap to lay flat (X-axis rotation makes it horizontal)
                        capMesh.rotation.x = -Math.PI / 2; // -90 degrees to lay flat
                        
                        // Position cap so bottom sits on grid
                        capMesh.position.y = capHeight / 2; // Half height to sit on grid
                        
                        scene.add(capMesh);
                        loadedCount++;
                        
                        if (loadedCount === 2) {
                            finishLoading();
                        }
                    },
                    function(xhr) {
                        const percentComplete = (xhr.loaded / xhr.total) * 50;
                        loadingDiv.textContent = `Loading cap body... ${Math.round(percentComplete)}%`;
                    },
                    function(error) {
                        console.error('❌ Cap body load error:', error);
                        console.error('❌ Failed to load:', stlData.cap);
                        showError(stlData.cap);
                    }
                );
                
                // Load lettering
                console.log('🔄 Loading lettering from:', stlData.lettering);
                loader.load(
                    stlData.lettering,
                    function(geometry) {
                        geometry.center();
                        
                        // Compute bounding box for proper alignment
                        geometry.computeBoundingBox();
                        
                        letteringMesh = new THREE.Mesh(geometry, letteringMaterial);
                        
                        // Add edge lines for lettering for better visibility
                        const letteringEdges = new THREE.EdgesGeometry(geometry, 15);
                        const letteringLine = new THREE.LineSegments(letteringEdges, new THREE.LineBasicMaterial({ 
                            color: 0x000000, 
                            linewidth: 2,
                            opacity: 0.5,
                            transparent: true
                        }));
                        letteringMesh.add(letteringLine);
                        
                        // Use same scale and rotation as cap
                        if (capMesh) {
                            letteringMesh.scale.set(scaleValue, scaleValue, scaleValue);
                            
                            // Copy the EXACT rotation from the cap to ensure perfect alignment
                            letteringMesh.rotation.x = capMesh.rotation.x;
                            letteringMesh.rotation.y = capMesh.rotation.y;
                            letteringMesh.rotation.z = capMesh.rotation.z;
                            
                            // Position lettering on top of cap surface
                            // Y position = cap's Y position + cap height (to sit on top)
                            letteringMesh.position.set(0, capHeight + 0.1, 0); // Slightly above cap top surface
                        }
                        
                        scene.add(letteringMesh);
                        loadedCount++;
                        
                        if (loadedCount === 2) {
                            finishLoading();
                        }
                    },
                    function(xhr) {
                        const percentComplete = 50 + (xhr.loaded / xhr.total) * 50;
                        loadingDiv.textContent = `Loading lettering... ${Math.round(percentComplete)}%`;
                    },
                    function(error) {
                        console.error('❌ Lettering load error:', error);
                        console.error('❌ Failed to load:', stlData.lettering);
                        showError(stlData.lettering);
                    }
                );
                
                function finishLoading() {
                    loadingDiv.style.display = 'none';
                    
                    // Update camera and controls to look at center
                    if (controls) {
                        controls.target.set(0, 0, 0);
                        controls.update();
                    }
                    camera.lookAt(0, 0, 0);
                    
                    // Setup color change listeners for separate parts
                    if (colorSelects.capColorSelect) {
                        colorSelects.capColorSelect.addEventListener('change', function() {
                            const newColor = COLOR_MAP[this.value] || 0x1a1a1a;
                            capMaterial.color.setHex(newColor);
                        });
                    }
                    if (colorSelects.letteringColorSelect) {
                        colorSelects.letteringColorSelect.addEventListener('change', function() {
                            const newColor = COLOR_MAP[this.value] || 0xf5f5f5;
                            letteringMaterial.color.setHex(newColor);
                        });
                    }
                    if (colorSelects.holderColorSelect) {
                        colorSelects.holderColorSelect.addEventListener('change', function() {
                            const newColor = COLOR_MAP[this.value] || 0x1a1a1a;
                            capMaterial.color.setHex(newColor);
                        });
                    }
                    
                    // Animation loop
                    function animate() {
                        requestAnimationFrame(animate);
                        if (controls) controls.update();
                        renderer.render(scene, camera);
                    }
                    animate();
                    
                    // Handle window resize
                    window.addEventListener('resize', function() {
                        if (container.clientWidth > 0) {
                            camera.aspect = container.clientWidth / container.clientHeight;
                            camera.updateProjectionMatrix();
                            renderer.setSize(container.clientWidth, container.clientHeight);
                        }
                    });
                }
            } else {
                // Single file model (original behavior)
                const stlPath = stlData;
                const isHolderModel = /holder/i.test(stlPath);
                
                console.log('🔄 Attempting to load STL from:', stlPath);
                console.log('🔄 Full URL would be:', window.location.origin + '/' + stlPath);
                
                loader.load(
                    stlPath,
                    function(geometry) {
                        // Success - STL loaded
                        loadingDiv.style.display = 'none';
                        
                        console.log('✅ STL loaded successfully:', stlPath);
                        console.log('Geometry vertices:', geometry.attributes.position.count);
                        
                        // Create material (use selected color, not test red)
                        const material = new THREE.MeshPhongMaterial({
                            color: COLOR_MAP[initialCapColor] || 0x1a1a1a,
                            specular: 0x333333,
                            shininess: 100,
                            flatShading: false,
                            side: THREE.DoubleSide
                        });

                        // Create mesh
                        const mesh = new THREE.Mesh(geometry, material);
                        
                        // Center and scale the model BEFORE adding edges
                        geometry.computeBoundingBox();
                        const bbox = geometry.boundingBox;
                        
                        console.log('Bounding box:', bbox);
                        
                        // Calculate size and scale
                        const size = new THREE.Vector3();
                        bbox.getSize(size);
                        const maxDim = Math.max(size.x, size.y, size.z);
                        // Native scale; only adjust camera, not the mesh
                        const scale = 1;
                        
                        console.log('📏 Model size:', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
                        console.log('📏 Max dimension:', maxDim.toFixed(2));
                        console.log('📏 Scale factor:', scale.toFixed(2));
                        
                        // Center the geometry at origin so rotations are predictable
                        geometry.center();

                        // Detect holder models by filename
                        // Apply uniform scale (currently native scale=1)
                        mesh.scale.set(scale, scale, scale);

                        // Orientation logic:
                        // Goal: caps should lay flat; holders should show their broad face.
                        if (!isHolderModel) {
                            // Cap: rotate flat
                            mesh.rotation.x = -Math.PI / 2;
                        } else {
                            // Holder: show upright, slight tilt for depth
                            mesh.rotation.x = -0.25;
                        }

                        // Recompute bounding box after rotation & centering for positioning
                        geometry.computeBoundingBox();
                        const centeredBBox = geometry.boundingBox;
                        const modelHeight = (centeredBBox.max.y - centeredBBox.min.y) * scale;
                        window.capHeight = modelHeight;

                        // Add edge lines for better visibility
                        const edges = new THREE.EdgesGeometry(geometry, 15);
                        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ 
                            color: 0x000000,
                            linewidth: 2,
                            opacity: 0.4,
                            transparent: true
                        }));
                        mesh.add(line);

                        // Position so bottom sits on grid
                        // Base alignment
                        if (isHolderModel) {
                            mesh.position.y = -centeredBBox.min.y; // set base on grid
                        } else {
                            mesh.position.y = modelHeight / 2;
                        }

                        // Debug helpers removed
                        
                        console.log('📍 Mesh position:', mesh.position);
                        console.log('📍 Mesh scale:', mesh.scale);
                        console.log('✅ Mesh added to scene');
                        
                        scene.add(mesh);
                        
                        // Update camera and controls to look at center
                        if (controls) {
                            controls.target.set(0, 0, 0);
                            controls.update();
                        }
                        // Camera fit based on largest dimension for native scale
                        const camDist = Math.max(90, maxDim * 2.2);
                        camera.position.set(camDist * 0.6, camDist * 0.9, camDist * 1.1);
                        camera.lookAt(0, 0, 0);

                        // Setup color change listeners
                        if (colorSelects.capColorSelect) {
                            colorSelects.capColorSelect.addEventListener('change', function() {
                                const newColor = COLOR_MAP[this.value] || 0x1a1a1a;
                                material.color.setHex(newColor);
                            });
                        }
                        if (colorSelects.holderColorSelect) {
                            colorSelects.holderColorSelect.addEventListener('change', function() {
                                const newColor = COLOR_MAP[this.value] || 0x1a1a1a;
                                material.color.setHex(newColor);
                            });
                        }

                        // Add 3D text functionality for cap3
                        let textMesh = null;
                        if (colorSelects.productId === 'cap3') {
                            const applyTextBtn = document.getElementById('apply-3d-text');
                            const textInput = document.getElementById('custom-3d-text');
                            const textSizeSlider = document.getElementById('text-size-slider');
                            const textSizeValue = document.getElementById('text-size-value');
                            
                            // Update size display when slider changes
                            if (textSizeSlider && textSizeValue) {
                                textSizeSlider.addEventListener('input', function() {
                                    textSizeValue.textContent = this.value;
                                });
                            }
                            
                            if (applyTextBtn && textInput && textSizeSlider) {
                                applyTextBtn.addEventListener('click', function() {
                                    const customText = textInput.value.trim().toUpperCase();
                                    const textSize = parseFloat(textSizeSlider.value);
                                    
                                    if (!customText) {
                                        alert('Please enter some text first!');
                                        return;
                                    }
                                    
                                    // Remove existing text mesh if any
                                    if (textMesh) {
                                        scene.remove(textMesh);
                                        textMesh = null;
                                    }
                                    
                                    // Load font and create 3D text
                                    if (typeof THREE.FontLoader === 'undefined') {
                                        alert('FontLoader not available. Please add the FontLoader script to your HTML.');
                                        return;
                                    }
                                    
                                    const fontLoader = new THREE.FontLoader();
                                    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
                                        const textGeometry = new THREE.TextGeometry(customText, {
                                            font: font,
                                            size: textSize,
                                            height: 1.5,
                                            curveSegments: 12,
                                            bevelEnabled: true,
                                            bevelThickness: 0.3,
                                            bevelSize: 0.2,
                                            bevelSegments: 5
                                        });
                                        
                                        textGeometry.center();
                                        
                                        const textMaterial = new THREE.MeshPhongMaterial({
                                            color: COLOR_MAP[initialLetteringColor] || 0xf5f5f5,
                                            specular: 0x333333,
                                            shininess: 100
                                        });
                                        
                                        textMesh = new THREE.Mesh(textGeometry, textMaterial);
                                        
                                        // Position text on top of cap surface
                                        const capHeight = window.capHeight || 10; // Use stored cap height
                                        textMesh.position.set(0, capHeight + 0.5, 0); // On top of cap + small offset
                                        textMesh.rotation.x = -Math.PI / 2; // Lay flat to match cap
                                        
                                        // Add edges to text for better visibility
                                        const textEdges = new THREE.EdgesGeometry(textGeometry, 15);
                                        const textLine = new THREE.LineSegments(textEdges, new THREE.LineBasicMaterial({ 
                                            color: 0x000000, 
                                            linewidth: 2,
                                            opacity: 0.5,
                                            transparent: true
                                        }));
                                        textMesh.add(textLine);
                                        
                                        scene.add(textMesh);
                                        
                                        // Show color selectors after text is applied
                                        let colorSelectorsDiv = document.getElementById('text-color-selectors');
                                        if (!colorSelectorsDiv) {
                                            colorSelectorsDiv = document.createElement('div');
                                            colorSelectorsDiv.id = 'text-color-selectors';
                                            colorSelectorsDiv.style.cssText = `
                                                margin-top: 15px;
                                                padding: 15px;
                                                background: #f8f9fa;
                                                border-radius: 8px;
                                                border: 2px solid #11998e;
                                            `;
                                            colorSelectorsDiv.innerHTML = `
                                                <h4 style="margin: 0 0 12px 0; color: #11998e; font-size: 1rem;">🎨 Customize Colors:</h4>
                                                
                                                <label style="font-weight: bold; color: #333; margin-bottom: 6px; display: block;">Cap Color:</label>
                                                <select id="cap-color-3d" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 12px;">
                                                    <option value="black">Black</option>
                                                    <option value="white">White</option>
                                                    <option value="red">Red</option>
                                                    <option value="blue">Blue</option>
                                                    <option value="green">Green</option>
                                                    <option value="yellow">Yellow</option>
                                                    <option value="orange">Orange</option>
                                                    <option value="gray">Gray</option>
                                                </select>
                                                
                                                <label style="font-weight: bold; color: #333; margin-bottom: 6px; display: block;">Text Color:</label>
                                                <select id="text-color-3d" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px;">
                                                    <option value="black">Black</option>
                                                    <option value="white" selected>White</option>
                                                    <option value="red">Red</option>
                                                    <option value="blue">Blue</option>
                                                    <option value="green">Green</option>
                                                    <option value="yellow">Yellow</option>
                                                    <option value="orange">Orange</option>
                                                    <option value="gray">Gray</option>
                                                </select>
                                            `;
                                            
                                            // Insert after the custom text input container
                                            const textInputContainer = document.getElementById('custom-text-input-container');
                                            if (textInputContainer && textInputContainer.nextSibling) {
                                                textInputContainer.parentNode.insertBefore(colorSelectorsDiv, textInputContainer.nextSibling);
                                            }
                                        }
                                        
                                        // Add color change listeners
                                        const capColorSelect = document.getElementById('cap-color-3d');
                                        const textColorSelect = document.getElementById('text-color-3d');
                                        
                                        if (capColorSelect) {
                                            capColorSelect.addEventListener('change', function() {
                                                const newColor = COLOR_MAP[this.value] || 0x1a1a1a;
                                                material.color.setHex(newColor);
                                            });
                                        }
                                        
                                        if (textColorSelect) {
                                            textColorSelect.addEventListener('change', function() {
                                                const newColor = COLOR_MAP[this.value] || 0xf5f5f5;
                                                textMaterial.color.setHex(newColor);
                                            });
                                        }
                                    });
                                });
                            }
                        }

                        // Animation loop
                        function animate() {
                            requestAnimationFrame(animate);
                            if (controls) controls.update();
                            renderer.render(scene, camera);
                        }
                        animate();

                        // Handle window resize
                        window.addEventListener('resize', function() {
                            if (container.clientWidth > 0) {
                                camera.aspect = container.clientWidth / container.clientHeight;
                                camera.updateProjectionMatrix();
                                renderer.setSize(container.clientWidth, container.clientHeight);
                            }
                        });
                    },
                    function(xhr) {
                        // Progress
                        const percentComplete = (xhr.loaded / xhr.total) * 100;
                        loadingDiv.textContent = `Loading 3D model... ${Math.round(percentComplete)}%`;
                    },
                    function(error) {
                        console.error('❌ STL Load Error:', error);
                        console.error('❌ Failed path:', stlPath);
                        console.error('❌ Error details:', error.message || error);
                        showError(stlPath);
                    }
                );
            }
            
            function showError(path) {
                loadingDiv.style.display = 'none';
                container.style.display = 'none'; // Hide the black viewer container
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = `
                    <p style="font-size: 1.2rem; font-weight: bold;">⚠️ Could not load STL file</p>
                    <p style="font-size: 1rem; margin: 10px 0;"><code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">${path}</code></p>
                    <p style="font-size: 0.95rem; color: #666; margin-bottom: 20px;">The 3D model file doesn't exist yet. You need to add STL files to your project.</p>
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin-top: 15px; text-align: left;">
                        <h4 style="margin: 0 0 10px 0; color: #1976D2;">📦 How to Add 3D Models:</h4>
                        <ol style="margin: 10px 0; padding-left: 20px; font-size: 0.95rem; line-height: 1.8;">
                            <li><strong>Export from Tinkercad:</strong> Open your design → Click "Export" → Choose ".STL"</li>
                            <li><strong>Create models folder:</strong> Make a folder called "models" in your project</li>
                            <li><strong>Add the STL file:</strong> Put your downloaded .stl file in the models folder</li>
                            <li><strong>Name it correctly:</strong> Rename it to match: <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">${path}</code></li>
                            <li><strong>Push to GitHub:</strong> Commit and push the models folder</li>
                        </ol>
                        <p style="margin: 15px 0 0 0; padding: 12px; background: #fff3cd; border-radius: 6px; font-size: 0.9rem;">
                            💡 <strong>Tip:</strong> The 3D viewer is working perfectly! It just needs your STL files to display.
                        </p>
                    </div>
                `;
            }
        } else {
            // STLLoader not available
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = `
                <p>❌ STL Loader not available</p>
                <p style="font-size: 0.9rem;">Add this script to your HTML:</p>
                <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">
&lt;script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js"&gt;&lt;/script&gt;</pre>
            `;
        }
    }

    function create3DViewerModal() {
        let modal = document.getElementById('stl-viewer-modal');
        if (modal) return modal;
        
        modal = document.createElement('div');
        modal.id = 'stl-viewer-modal';
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
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 16px; max-width: 900px; width: 95%; max-height: 95vh; overflow-y: auto; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <button onclick="this.closest('#stl-viewer-modal').style.display='none'; document.body.style.overflow=''" 
                        style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 24px; font-weight: bold; z-index: 10; transition: all 0.3s ease;">
                        onmouseover="this.style.transform='scale(1.1) rotate(90deg)'" 
                        onmouseout="this.style.transform='scale(1) rotate(0deg)'">×</button>
                
                <button onclick="this.closest('#stl-viewer-modal').style.display='none'; document.body.style.overflow=''" 
                        style="position: absolute; top: 15px; left: 15px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px; padding: 10px 20px; cursor: pointer; font-size: 1rem; font-weight: bold; z-index: 10; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;"
                        onmouseover="this.style.transform='translateX(-5px)'; this.style.boxShadow='0 4px 15px rgba(52, 152, 219, 0.4)'" 
                        onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                    ← Back
                </button>
                
                <h2 id="stl-modal-title" style="margin: 0 0 20px 0; padding-top: 10px; color: #333; font-size: 1.8rem; text-align: center; background: linear-gradient(135deg, #11998e, #38ef7d); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    3D Model Viewer
                </h2>
                
                <div id="stl-viewer-container" style="width: 100%; height: 500px; background: linear-gradient(145deg, #f0f0f0, #ffffff); border-radius: 12px; position: relative; overflow: hidden; box-shadow: inset 0 4px 20px rgba(0,0,0,0.1);"></div>
                
                <div id="stl-loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px 30px; border-radius: 8px; font-size: 1rem; display: none;">
                    Loading 3D model...
                </div>
                
                <div id="stl-error" style="padding: 20px; background: #ffebee; border: 2px solid #e74c3c; border-radius: 8px; margin-top: 15px; color: #c0392b; display: none;"></div>
                
                <div class="controls-section" style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #11998e15, #38ef7d15); border-radius: 8px; border: 2px solid #11998e;">
                    <h3 style="margin: 0 0 10px 0; color: #11998e; font-size: 1.1rem;">🎮 Controls:</h3>
                    <ul style="margin: 0; padding-left: 25px; color: #333; line-height: 1.8;">
                        <li><strong>Rotate:</strong> Click and drag to rotate the model</li>
                        <li><strong>Zoom:</strong> Scroll wheel or pinch to zoom in/out</li>
                        <li><strong>Pan:</strong> Right-click and drag to move the view</li>
                        <li><strong>Auto-Rotate:</strong> Model rotates automatically for full view</li>
                        <li><strong>Color Change:</strong> Use the color selectors to see real-time updates</li>
                    </ul>
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM Content Loaded - initializing 3D viewer in 500ms...');
            setTimeout(init3DViewer, 500);
        });
    } else {
        console.log('DOM already loaded - initializing 3D viewer in 500ms...');
        setTimeout(init3DViewer, 500);
    }

    console.log('✨ 3D STL Viewer System loaded!');
})();
