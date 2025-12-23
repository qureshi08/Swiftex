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
                name: "Qatar",
                lat: 25.3,
                lon: 51.5,
                services: "Air Cargo, Express Delivery, Commercial Freight",
                routing: "KHI → DOH (Direct)",
                transit: "1-3 business days",
                detail: "Specialized handling for Qatar with direct flights from Karachi."
            }
        ];

        // ZOOM IN/OUT Logic
        function onMouseWheel(e) {
            e.preventDefault();
            const zoomSpeed = 1.2;
            const minZoom = 10;
            const maxZoom = 25;

            camera.position.z += e.deltaY * 0.005 * zoomSpeed;

            // Clamp zoom
            if (camera.position.z < minZoom) camera.position.z = minZoom;
            if (camera.position.z > maxZoom) camera.position.z = maxZoom;
        }

        const markers = [];
        const animatedPlanes = []; // Array to store plane objects
        const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const originMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }); // Changed to white
        const destMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pakistanPos = latLongToVector3(30.37, 69.34, 6);

        destinations.forEach(dest => {
            const pos = latLongToVector3(dest.lat, dest.lon, 6);
            const marker = new THREE.Mesh(markerGeo, dest.isOrigin ? originMat : destMat);
            marker.position.copy(pos);
            marker.userData = dest;
            globeGroup.add(marker);



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
            const altitude = 5.2 + (dist * 0.55);
            const mid = pakistanPos.clone().add(targetPos).normalize().multiplyScalar(altitude);
            const curve = new THREE.QuadraticBezierCurve3(pakistanPos, mid, targetPos);

            // Dotted Route Line
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineDashedMaterial({
                color: 0x2DBE60,
                dashSize: 0.2,
                gapSize: 0.1,
                transparent: true,
                opacity: 0.4
            });
            const routeLine = new THREE.Line(geometry, material);
            routeLine.computeLineDistances();
            routeLine.userData = { isRoute: true, target: dest.name };
            globeGroup.add(routeLine);
            dest.routeMesh = routeLine;

            // --- 3D Animated Plane (Custom Shape) ---
            const planeShape = new THREE.Shape();
            // C130 Cargo Plane Silhouette (Straight Wings, Heavy Body)
            planeShape.moveTo(0, 12); // Nose
            planeShape.lineTo(2, 10); // Nose taper
            planeShape.lineTo(2.5, 4); // Forward body
            planeShape.lineTo(15, 4); // Wing front (Straight)
            planeShape.lineTo(15, -2); // Wing tip
            planeShape.lineTo(2.5, -2); // Wing back
            planeShape.lineTo(2.5, -10); // Aft body
            planeShape.lineTo(7, -10); // Horizontal stabilizer front
            planeShape.lineTo(7, -13); // Horizontal stabilizer tip
            planeShape.lineTo(2, -13); // Horizontal stabilizer back
            planeShape.lineTo(0, -15); // Tail end
            planeShape.lineTo(-2, -13);
            planeShape.lineTo(-7, -13);
            planeShape.lineTo(-7, -10);
            planeShape.lineTo(-2.5, -10);
            planeShape.lineTo(-2.5, -2);
            planeShape.lineTo(-15, -2);
            planeShape.lineTo(-15, 4);
            planeShape.lineTo(-2.5, 4);
            planeShape.lineTo(-2.5, 10);
            planeShape.lineTo(0, 12);

            const extrudeSettings = { depth: 1.5, bevelEnabled: false };
            const planeGeo = new THREE.ExtrudeGeometry(planeShape, extrudeSettings);

            planeGeo.center();
            planeGeo.scale(0.018, 0.018, 0.018); // Slightly smaller scale for C130 body

            // Orientation Corrected: C130 shape is vertically oriented in 2D, 
            // after extrusion it faces Z, but we need it to face the direction of the tangent.
            planeGeo.rotateX(Math.PI / 2); // Lay it flat on XY plane relative to its coordinate system

            const planeMat = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                emissive: 0x2DBE60,
                emissiveIntensity: 0.5,
                side: THREE.DoubleSide,
                flatShading: true,
                shininess: 0
            });
            const plane = new THREE.Mesh(planeGeo, planeMat);
            globeGroup.add(plane);

            // Store for animation
            animatedPlanes.push({
                mesh: plane,
                curve: curve,
                t: Math.random() // Random start position
            });
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
                    child.material.opacity = 0.4;
                    child.material.color.setHex(0x00FFAA); // Electric Cyan
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
                        data.routeMesh.material.color.setHex(0x50FF90); // Brighter green highlight
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
                // Prevent scrolling while interacting with globe
                if (e.cancelable) e.preventDefault();

                const deltaMove = {
                    x: e.touches[0].clientX - previousMousePosition.x,
                    y: e.touches[0].clientY - previousMousePosition.y
                };
                targetRotation.y += deltaMove.x * 0.008; // Slightly more sensitive for mobile
                targetRotation.x += deltaMove.y * 0.008;
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }

        function onTouchEnd() {
            isDragging = false;
        }

        canvasContainer.addEventListener('touchstart', onTouchStart, { passive: false });
        canvasContainer.addEventListener('touchmove', onTouchMove, { passive: false });
        canvasContainer.addEventListener('touchend', onTouchEnd);
        canvasContainer.addEventListener('wheel', onMouseWheel, { passive: false });

        // RESET BUTTON REMOVED PER REQ
        // MOUSE WHEEL ZOOM REMOVED PER REQ

        function animate() {
            requestAnimationFrame(animate);
            currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
            currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;
            if (!isDragging) targetRotation.y += 0.001;
            globeGroup.rotation.x = currentRotation.x;
            globeGroup.rotation.y = currentRotation.y;

            // Animate Planes
            animatedPlanes.forEach(planeObj => {
                planeObj.t += 0.003; // Speed
                if (planeObj.t > 1) planeObj.t = 0;

                const point = planeObj.curve.getPoint(planeObj.t);
                planeObj.mesh.position.copy(point);

                // --- Improved Linear Orientation ---
                const tangent = planeObj.curve.getTangentAt(planeObj.t).normalize();
                const up = point.clone().normalize(); // Normal to globe
                const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
                const forward = new THREE.Vector3().crossVectors(right, up).normalize();

                const matrix = new THREE.Matrix4();
                matrix.makeBasis(right, up, forward.negate()); // Negate forward if needed based on geo
                planeObj.mesh.quaternion.setFromRotationMatrix(matrix);
            });

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
