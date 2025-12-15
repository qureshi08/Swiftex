console.log("Main JS loaded");

// --- Three.js Interactive Globe ---
function initThreeJS() {
    try {
        if (typeof THREE === 'undefined') {
            console.error("Three.js is not loaded.");
            return;
        }

        const canvasContainer = document.getElementById('hero-canvas-container');
        if (!canvasContainer) {
            console.log("Hero canvas container not found - skipping Three.js init");
            return;
        }

        console.log("Initializing Three.js Globe...");

        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        camera.position.z = 16.5;
        camera.position.y = 0;
        const initialZoom = 16.5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        canvasContainer.appendChild(renderer.domElement);

        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        // Globe Material
        const sphereGeo = new THREE.SphereGeometry(6, 64, 64);
        const textureLoader = new THREE.TextureLoader();
        const material = new THREE.MeshPhongMaterial({
            map: null,
            color: 0x3D5A80,
            emissive: 0x0A1929,
            emissiveIntensity: 0.15,
            specular: 0x1A2332,
            shininess: 8
        });

        textureLoader.load(
            'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
            (texture) => {
                material.map = texture;
                material.needsUpdate = true;
                material.color.setHex(0x5B7FA8);
            },
            undefined,
            (err) => {
                console.error("Error loading texture:", err);
                // Fallback color if texture fails
                material.color.setHex(0x5B7FA8);
            }
        );

        const globe = new THREE.Mesh(sphereGeo, material);
        globeGroup.add(globe);

        // Atmosphere
        const atmosGeo = new THREE.SphereGeometry(6.25, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x2DBE60,  // UPDATED ACCENT GREEN
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide
        });
        const atmos = new THREE.Mesh(atmosGeo, atmosMat);
        globeGroup.add(atmos);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(15, 8, 15);
        scene.add(dirLight);
        const fillLight = new THREE.DirectionalLight(0x7BA3D1, 0.3);
        fillLight.position.set(-10, -5, -10);
        scene.add(fillLight);

        function latLongToVector3(lat, lon, radius) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = (radius * Math.sin(phi) * Math.sin(theta));
            const y = (radius * Math.cos(phi));
            return new THREE.Vector3(x, y, z);
        }

        const destinations = [
            {
                name: "Pakistan",
                lat: 30.37,
                lon: 69.34,
                isOrigin: true,
                services: "International Cargo Hub, Air Freight, Express Cargo, Door-to-Door Delivery",
                routing: "Main Hubs: Lahore (LHE), Islamabad (ISB), Karachi (KHI)",
                transit: "Domestic: Same day | International: 1-7 days",
                detail: "Operating from major cities: Lahore, Islamabad, and Karachi. We provide comprehensive international cargo services to all major destinations worldwide."
            },
            {
                name: "United Kingdom",
                lat: 54.0,
                lon: -2.0,
                services: "Air Freight, Express Cargo, Door-to-Door Delivery, Customs Clearance",
                routing: "LHE → DXB → LHR",
                transit: "3-5 business days",
                detail: "Primary European hub with daily flights and comprehensive customs support."
            },
            {
                name: "United States",
                lat: 39.0,
                lon: -98.0,
                services: "Air Freight, Sea Freight, Express Delivery, Customs Brokerage",
                routing: "LHE → DXB → JFK/ORD/LAX",
                transit: "5-7 business days",
                detail: "Direct and connecting flights to major US cities with full customs clearance."
            },
            {
                name: "UAE / Dubai",
                lat: 25.0,
                lon: 55.0,
                services: "Express Air Cargo, Next-Day Delivery, Warehousing",
                routing: "LHE → DXB (Direct)",
                transit: "1-2 business days",
                detail: "Fastest route with next-day delivery options and local warehousing."
            },
            {
                name: "Saudi Arabia",
                lat: 24.0,
                lon: 45.0,
                services: "Door-to-Door Cargo, Air Freight, Commercial Shipments",
                routing: "LHE → DXB → RUH/JED",
                transit: "2-4 business days",
                detail: "Reliable service to Riyadh, Jeddah, and other major Saudi cities."
            },
            {
                name: "Canada",
                lat: 56.0,
                lon: -106.0,
                services: "Air Freight, Express Cargo, Customs Clearance",
                routing: "LHE → LHR → YYZ/YVR",
                transit: "5-7 business days",
                detail: "Service to Toronto, Vancouver, and other major Canadian cities."
            },
            {
                name: "Canada (Direct)",
                lat: 56.0,
                lon: -106.0,
                services: "Air Freight, Sea Freight",
                routing: "LHE → YYZ (Direct)",
                transit: "3-5 business days",
                detail: "Direct cargo flights available to major Canadian hubs."
            },
            {
                name: "Qatar",
                lat: 25.3,
                lon: 51.5,
                services: "Air Cargo, Express Delivery, Commercial Freight",
                routing: "KHI → DOH (Direct)",
                transit: "1-3 business days",
                detail: "Specialized handling for Qatar with direct flights from Karachi."
            }
        ];

        const markers = [];
        const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const originMat = new THREE.MeshBasicMaterial({ color: 0x2DBE60 }); // Accent Green
        const destMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pakistanPos = latLongToVector3(30.37, 69.34, 6);

        destinations.forEach(dest => {
            const pos = latLongToVector3(dest.lat, dest.lon, 6);
            const marker = new THREE.Mesh(markerGeo, dest.isOrigin ? originMat : destMat);
            marker.position.copy(pos);
            marker.userData = dest;
            globeGroup.add(marker);

            if (dest.isOrigin) {
                const ringGeo = new THREE.RingGeometry(0.25, 0.35, 32);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0x2DBE60, // Accent Green
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.copy(pos);
                ring.lookAt(new THREE.Vector3(0, 0, 0));
                globeGroup.add(ring);
            }

            const hitbox = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 8, 8),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            hitbox.position.copy(pos);
            hitbox.userData = dest;
            markers.push(hitbox);
            globeGroup.add(hitbox);

            // --- Country Name Labels ---
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            context.font = "Bold 22px Arial"; /* Reduced font size from 24px */
            context.fillStyle = "rgba(255,255,255,1.0)";
            context.textAlign = "center";
            context.shadowColor = "rgba(0,0,0,0.8)";
            context.shadowBlur = 3;
            context.fillText(dest.name, 128, 38); /* Adjusted vertical position */

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true }); /* Physics/Occlusion enabled */
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(pos.clone().multiplyScalar(1.08)); /* Closer to surface */
            sprite.scale.set(2, 0.5, 1); /* Smaller scale */
            globeGroup.add(sprite);

        });

        // Routes
        destinations.forEach(dest => {
            if (dest.isOrigin) return;
            const targetPos = latLongToVector3(dest.lat, dest.lon, 6);
            const dist = pakistanPos.distanceTo(targetPos);
            // Dynamic altitude: Lowered to be closer to surface but safely clear it
            const altitude = 5.2 + (dist * 0.55);
            const mid = pakistanPos.clone().add(targetPos).normalize().multiplyScalar(altitude);
            const curve = new THREE.QuadraticBezierCurve3(pakistanPos, mid, targetPos);
            const geometry = new THREE.TubeGeometry(curve, 50, 0.02, 8, false);
            const material = new THREE.MeshBasicMaterial({
                color: 0x2DBE60, // Accent Green
                transparent: true,
                opacity: 0.8
            });
            const routeLine = new THREE.Mesh(geometry, material);
            routeLine.userData = { isRoute: true, target: dest.name };
            globeGroup.add(routeLine);
            dest.routeMesh = routeLine;
        });

        let isDragging = false;
        let dragStartPos = { x: 0, y: 0 };
        let previousMousePosition = { x: 0, y: 0 };

        // Initial rotation: 350 degrees (approx 6.11 radians)
        let targetRotation = { x: 0.5, y: 6.11 };
        let currentRotation = { x: 0.5, y: 6.11 };
        globeGroup.rotation.x = currentRotation.x;
        globeGroup.rotation.y = currentRotation.y;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const tooltip = document.getElementById('globe-tooltip');

        function onMouseDown(e) {
            if (e.button === 0) {
                isDragging = true;
                dragStartPos = { x: e.clientX, y: e.clientY };
                canvasContainer.style.cursor = 'grabbing';
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        }

        function onMouseUp() {
            isDragging = false;
            canvasContainer.style.cursor = 'grab';
        }

        function onMouseMove(e) {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };
                targetRotation.y += deltaMove.x * 0.005;
                targetRotation.x += deltaMove.y * 0.005;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }

            const rect = canvasContainer.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(markers);

            // Default Route State: Semi-visible
            globeGroup.children.forEach(child => {
                if (child.userData.isRoute) {
                    child.material.opacity = 0.8;
                    child.material.color.setHex(0x2DBE60); // Accent Green
                }
            });

            canvasContainer.style.cursor = isDragging ? 'grabbing' : 'grab';

            if (intersects.length > 0) {
                const data = intersects[0].object.userData;
                if (data) {
                    canvasContainer.style.cursor = 'pointer';
                    // Highlight specific route if hovering destination
                    if (!data.isOrigin && data.routeMesh) {
                        data.routeMesh.material.opacity = 1.0;
                        data.routeMesh.material.color.setHex(0x34E075); // Lighter Green Highlight
                    }
                    if (tooltip) {
                        tooltip.style.display = 'block';
                        tooltip.style.left = (e.clientX - rect.left + 20) + 'px';
                        tooltip.style.top = (e.clientY - rect.top + 20) + 'px';
                        const nameEl = document.getElementById('tooltip-country');
                        const descEl = document.getElementById('tooltip-desc');
                        if (nameEl) nameEl.innerText = data.name;
                        if (descEl) descEl.innerHTML = `${data.detail}<br><span style="color:#CBD5E1; font-size:0.85em; margin-top:0.3rem; display:block;">Transit: ${data.transit}</span>`;
                    }
                }
            } else {
                if (tooltip) tooltip.style.display = 'none';
            }
        }

        function onClick(e) {
            const dragDistance = Math.sqrt(
                Math.pow(e.clientX - dragStartPos.x, 2) +
                Math.pow(e.clientY - dragStartPos.y, 2)
            );
            if (dragDistance > 5) return;

            const rect = canvasContainer.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(markers);

            if (intersects.length > 0) {
                const data = intersects[0].object.userData;
                if (data) {
                    if (tooltip) tooltip.style.display = 'none';
                    openModal(data);
                }
            }
        }

        function openModal(data) {
            const modal = document.getElementById("destinationModal");
            if (modal) {
                const nameEl = document.getElementById("modal-country-name");
                const servicesEl = document.getElementById("modal-services");
                const routingEl = document.getElementById("modal-routing");
                const transitEl = document.getElementById("modal-transit");

                if (nameEl) nameEl.innerText = data.name;
                if (servicesEl) servicesEl.innerText = data.services || "Air Freight, Express Cargo";
                if (routingEl) routingEl.innerText = data.routing || "Direct";
                if (transitEl) transitEl.innerText = data.transit || "3-5 business days";

                modal.style.display = "block";
            }
        }

        canvasContainer.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        canvasContainer.addEventListener('mousemove', onMouseMove);
        canvasContainer.addEventListener('click', onClick);

        // --- Mobile Touch Support ---
        function onTouchStart(e) {
            if (e.touches.length === 1) {
                isDragging = true;
                dragStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }

        function onTouchMove(e) {
            if (isDragging && e.touches.length === 1) {
                const deltaMove = {
                    x: e.touches[0].clientX - previousMousePosition.x,
                    y: e.touches[0].clientY - previousMousePosition.y
                };
                targetRotation.y += deltaMove.x * 0.005;
                targetRotation.x += deltaMove.y * 0.005;
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }

        function onTouchEnd() {
            isDragging = false;
        }

        canvasContainer.addEventListener('touchstart', onTouchStart, { passive: false });
        canvasContainer.addEventListener('touchmove', onTouchMove, { passive: false });
        canvasContainer.addEventListener('touchend', onTouchEnd);

        // RESET BUTTON REMOVED PER REQ
        // MOUSE WHEEL ZOOM REMOVED PER REQ

        function animate() {
            requestAnimationFrame(animate);
            currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
            currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;
            if (!isDragging) targetRotation.y += 0.001;
            globeGroup.rotation.x = currentRotation.x;
            globeGroup.rotation.y = currentRotation.y;
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            if (!canvasContainer) return;
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        });

    } catch (e) {
        console.error("Three.js init failed:", e);
    }
}

function initGSAP() {
    try {
        if (typeof gsap === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);
        gsap.from(".hero-text-side", {
            duration: 1.2,
            x: -40,
            opacity: 0,
            ease: "power3.out",
            delay: 0.2
        });
        gsap.from(".hero-visual-side", {
            duration: 1.5,
            scale: 0.92,
            opacity: 0,
            ease: "power3.out",
            delay: 0.5
        });
    } catch (e) {
        console.warn("GSAP init failed:", e);
    }
}

function initNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    // Set active link based on current page
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');

    navItems.forEach(link => {
        // Clear active class first
        link.classList.remove('active');

        const linkPath = new URL(link.href, window.location.origin).pathname;

        // Check for exact match or Home
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
        // Handle "Home" specifically to match "/"
        else if (linkPath === "/" && currentPath === "/") {
            link.classList.add('active');
        }
    });

    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initGSAP();
    initNav();
});
