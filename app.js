// ============================================
// LCDR Gallery - Dynamic Moodboard
// ============================================

class DynamicMoodboard {
	constructor() {
		this.images = [];
		this.renderedImages = new Set(); // Track which images are currently rendered
		this.isPaused = false;
		this.animationFrameId = null;
		this.containerWidth = 0;
		this.containerHeight = 0;
		this.renderTimeout = null; // Debounce render calls
		this.loadingImages = 0; // Track pending image loads
		this.scrollSpeed = this.getResponsiveScrollSpeed(); // Responsive scroll speed
		this.speedMultiplier = 0.5; // Speed control multiplier (default from slider)
		this.isSettingColor = false; // Flag to prevent recursive input events

		this.initElements();
		// Initialize speedMultiplier from slider value
		this.speedMultiplier = parseFloat(this.speedSlider.value);
		this.attachEventListeners();
		this.render();
		this.startAnimation();
	}

	getResponsiveScrollSpeed() {
		// Adjust scroll speed based on screen size
		const width = window.innerWidth;
		if (width < 480) return 1.5; // Small mobile
		if (width < 768) return 2; // Mobile
		if (width < 1200) return 2.5; // Tablet
		return 3; // Desktop
	}

	initElements() {
		this.uploadOverlay = document.getElementById("uploadOverlay");
		this.uploadBox = document.getElementById("uploadBox");
		this.fileInput = document.getElementById("fileInput");
		this.gallery = document.getElementById("gallery");
		this.imageCount = document.getElementById("imageCount");
		this.pauseToggle = document.getElementById("pauseToggle");
		this.pauseText = this.pauseToggle.closest("label").querySelector("span");
		this.clearBtn = document.getElementById("clearBtn");
		this.controlsPanel = document.getElementById("controlsPanel");
		this.controlsToggle = document.getElementById("controlsToggle");
		this.speedSlider = document.getElementById("speedSlider");
		this.speedValue = document.getElementById("speedValue");
		this.resetParamsBtn = document.getElementById("resetParamsBtn");
		this.colorPreviewBtn = document.getElementById("colorPreviewBtn");
		this.colorPickerSliders = document.getElementById("colorPickerSliders");
		this.hueSlider = document.getElementById("hueSlider");
		this.saturationSlider = document.getElementById("saturationSlider");
		this.lightnessSlider = document.getElementById("lightnessSlider");
		this.hueValue = document.getElementById("hueValue");
		this.saturationValue = document.getElementById("saturationValue");
		this.lightnessValue = document.getElementById("lightnessValue");
		this.colorValue = document.getElementById("colorValue");
		this.currentColor = "#667eea";
		this.autoExtractedColor = "#667eea"; // Store the automatically extracted color
		this.currentHue = 271;
		this.currentSaturation = 100;
		this.currentLightness = 50;

		// Get gallery container dimensions
		this.updateDimensions();
	}

	updateDimensions() {
		const wrapper = document.querySelector(".gallery-wrapper");
		this.containerWidth = wrapper.offsetWidth;
		this.containerHeight = wrapper.offsetHeight;
	}

	attachEventListeners() {
		// Upload interactions
		this.uploadBox.addEventListener("click", () => this.fileInput.click());
		this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

		// Drag and drop
		this.uploadOverlay.addEventListener("dragover", (e) => this.handleDragOver(e), { passive: false });
		this.uploadOverlay.addEventListener("dragleave", (e) => this.handleDragLeave(e), { passive: false });
		this.uploadOverlay.addEventListener("drop", (e) => this.handleDrop(e), { passive: false });

		// Controls
		this.pauseToggle.addEventListener(
			"change",
			(e) => {
				this.isPaused = e.target.checked;
				this.pauseText.textContent = this.isPaused ? "Play" : "Pause";
			},
			{ passive: true },
		);

		this.clearBtn.addEventListener("click", () => this.clearGallery(), { passive: true });

		// Controls panel toggle
		this.controlsToggle.addEventListener("click", () => this.toggleControls(), { passive: true });

		// Spacebar pause toggle
		document.addEventListener("keydown", (e) => {
			if (e.code === "Space") {
				e.preventDefault();
				this.isPaused = !this.isPaused;
				this.pauseToggle.checked = this.isPaused;
				this.pauseText.textContent = this.isPaused ? "Play" : "Pause";
			}
		});

		// Hide overlay on click outside upload box
		this.uploadOverlay.addEventListener(
			"click",
			(e) => {
				if (e.target === this.uploadOverlay) {
					if (this.images.length > 0) {
						this.hideUploadOverlay();
					}
				}
			},
			{ passive: true },
		);

		// Resize handler
		window.addEventListener(
			"resize",
			() => {
				this.updateDimensions();
				this.scrollSpeed = this.getResponsiveScrollSpeed();
			},
			{ passive: true },
		);

		// Speed slider
		this.speedSlider.addEventListener(
			"input",
			(e) => {
				this.speedMultiplier = parseFloat(e.target.value);
				this.speedValue.textContent = this.speedMultiplier.toFixed(1);
			},
			{ passive: true },
		);

		// Reset parameters button
		this.resetParamsBtn.addEventListener("click", () => this.resetParameters(), { passive: true });

		// HSL Sliders
		this.hueSlider.addEventListener(
			"input",
			(e) => {
				this.currentHue = parseInt(e.target.value);
				this.hueValue.textContent = this.currentHue;
				this.updateSliderBackgrounds();
				this.updateColorFromHSL();
			},
			{ passive: true },
		);

		this.saturationSlider.addEventListener(
			"input",
			(e) => {
				this.currentSaturation = parseInt(e.target.value);
				this.saturationValue.textContent = this.currentSaturation;
				this.updateColorFromHSL();
			},
			{ passive: true },
		);

		this.lightnessSlider.addEventListener(
			"input",
			(e) => {
				this.currentLightness = parseInt(e.target.value);
				this.lightnessValue.textContent = this.currentLightness;
				this.updateColorFromHSL();
			},
			{ passive: true },
		);

		// Hex color input
		this.colorValue.addEventListener(
			"input",
			(e) => {
				// Skip if we're programmatically setting the color
				if (this.isSettingColor) return;

				let hex = e.target.value.trim();
				// Validate hex format
				if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
					this.setColor(hex);
				}
			},
			{ passive: true },
		);

		// Hex color on blur - auto-format
		this.colorValue.addEventListener("blur", (e) => {
			let hex = e.target.value.trim();
			// Ensure it has # prefix
			if (!hex.startsWith("#")) hex = "#" + hex;
			// Validate and correct format
			if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
				this.setColor(hex);
			} else {
				// Reset to current color on invalid input
				this.colorValue.value = this.currentColor.toUpperCase();
			}
		});

		// Allow Enter key to confirm hex input
		this.colorValue.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				let hex = e.target.value.trim();
				// Ensure it has # prefix
				if (!hex.startsWith("#")) hex = "#" + hex;
				// Validate and correct format
				if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
					this.setColor(hex);
				} else {
					// Reset to current color on invalid input
					this.colorValue.value = this.currentColor.toUpperCase();
				}
			}
		});

		// Initialize slider backgrounds
		this.updateSliderBackgrounds();
	}

	updateSliderBackgrounds() {
		// Update saturation slider background based on hue
		const satGradient = `linear-gradient(90deg, hsl(${this.currentHue}, 0%, 50%), hsl(${this.currentHue}, 100%, 50%))`;
		this.saturationSlider.style.background = satGradient;

		// Update lightness slider background based on hue
		const lightGradient = `linear-gradient(90deg, hsl(${this.currentHue}, 100%, 0%), hsl(${this.currentHue}, 100%, 50%), hsl(${this.currentHue}, 100%, 100%))`;
		this.lightnessSlider.style.background = lightGradient;
	}

	updateColorFromHSL() {
		const color = `hsl(${this.currentHue}, ${this.currentSaturation}%, ${this.currentLightness}%)`;
		this.setColor(color);
	}

	setColor(color) {
		this.currentColor = color;
		// Convert to hex if needed
		let hexColor = color;
		if (color.startsWith("hsl")) {
			// Convert HSL to HEX
			const result = color.match(/\d+/g);
			if (result && result.length >= 3) {
				const h = parseInt(result[0]);
				const s = parseInt(result[1]) / 100;
				const l = parseInt(result[2]) / 100;
				hexColor = this.hslToHex(h, s, l);

				// Update HSL values from the color
				this.currentHue = parseInt(result[0]);
				this.currentSaturation = parseInt(result[1]);
				this.currentLightness = parseInt(result[2]);
				this.hueSlider.value = this.currentHue;
				this.saturationSlider.value = this.currentSaturation;
				this.lightnessSlider.value = this.currentLightness;
				this.hueValue.textContent = this.currentHue;
				this.saturationValue.textContent = this.currentSaturation;
				this.lightnessValue.textContent = this.currentLightness;
			}
		} else if (color.startsWith("#")) {
			// Already hex, convert to HSL
			hexColor = color.toUpperCase();
			const hsl = this.hexToHsl(hexColor);
			this.currentHue = Math.round(hsl.h);
			this.currentSaturation = Math.round(hsl.s);
			this.currentLightness = Math.round(hsl.l);
			this.hueSlider.value = this.currentHue;
			this.saturationSlider.value = this.currentSaturation;
			this.lightnessSlider.value = this.currentLightness;
			this.hueValue.textContent = this.currentHue;
			this.saturationValue.textContent = this.currentSaturation;
			this.lightnessValue.textContent = this.currentLightness;
		} else if (color.match(/^[0-9A-Fa-f]{6}$/)) {
			// Hex without #, add it
			hexColor = "#" + color.toUpperCase();
		}

		// Update all UI elements
		const rgbColor = color.startsWith("#")
			? color
			: `hsl(${this.currentHue}, ${this.currentSaturation}%, ${this.currentLightness}%)`;
		document.body.style.background = rgbColor;
		if (this.colorValue) {
			this.isSettingColor = true;
			this.colorValue.value = hexColor.toUpperCase();
			// Use setTimeout to ensure DOM has updated before resetting flag
			setTimeout(() => {
				this.isSettingColor = false;
			}, 0);
		}
		this.colorPreviewBtn.style.background = rgbColor;

		// Update saturation and lightness slider backgrounds based on hue
		this.updateSliderBackgrounds();
	}

	hslToHex(h, s, l) {
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const hp = h / 60;
		const x = c * (1 - Math.abs((hp % 2) - 1));
		let r = 0,
			g = 0,
			b = 0;

		if (hp < 1) {
			r = c;
			g = x;
		} else if (hp < 2) {
			r = x;
			g = c;
		} else if (hp < 3) {
			g = c;
			b = x;
		} else if (hp < 4) {
			g = x;
			b = c;
		} else if (hp < 5) {
			r = x;
			b = c;
		} else {
			r = c;
			b = x;
		}

		const m = l - c / 2;
		r = Math.round((r + m) * 255)
			.toString(16)
			.padStart(2, "0");
		g = Math.round((g + m) * 255)
			.toString(16)
			.padStart(2, "0");
		b = Math.round((b + m) * 255)
			.toString(16)
			.padStart(2, "0");

		return `#${r}${g}${b}`.toUpperCase();
	}

	hexToHsl(hex) {
		// Remove # if present
		hex = hex.replace("#", "");

		// Convert hex to RGB
		const r = parseInt(hex.substring(0, 2), 16) / 255;
		const g = parseInt(hex.substring(2, 4), 16) / 255;
		const b = parseInt(hex.substring(4, 6), 16) / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0,
			s = 0;
		const l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r:
					h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
					break;
				case g:
					h = ((b - r) / d + 2) / 6;
					break;
				case b:
					h = ((r - g) / d + 4) / 6;
					break;
			}
		}

		return {
			h: h * 360,
			s: s * 100,
			l: l * 100,
		};
	}

	handleDragOver(e) {
		e.preventDefault();
		e.stopPropagation();
		this.uploadBox.classList.add("dragover");
	}

	handleDragLeave(e) {
		e.preventDefault();
		e.stopPropagation();
		this.uploadBox.classList.remove("dragover");
	}

	handleDrop(e) {
		e.preventDefault();
		e.stopPropagation();
		this.uploadBox.classList.remove("dragover");

		const files = e.dataTransfer.files;
		this.processFiles(files);
	}

	handleFileSelect(e) {
		const files = e.target.files;
		this.processFiles(files);
	}

	processFiles(files) {
		// Batch process files for better performance
		const filesToProcess = Array.from(files).filter((file) => file.type.startsWith("image/"));
		this.loadingImages += filesToProcess.length;

		filesToProcess.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				this.addImage(e.target.result);
			};
			reader.readAsDataURL(file);
		});
		// Reset file input so uploading same files again works
		this.fileInput.value = "";
	}

	addImage(src) {
		const imageObj = {
			src: src,
			loaded: false,
		};

		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			imageObj.loaded = true;
			imageObj.naturalWidth = img.naturalWidth;
			imageObj.naturalHeight = img.naturalHeight;
			imageObj.aspectRatio = imageObj.naturalWidth / imageObj.naturalHeight;

			this.images.push(imageObj);
			this.loadingImages--;
			this.updateImageCount();

			// Extract dominant color from first image
			if (this.images.length === 1) {
				this.extractDominantColor(img);
			}
			this.hideUploadOverlay();
			this.clearBtn.disabled = false;

			// Debounce render to wait for batch of images
			this.debouncedRender();
		};
		img.onerror = () => {
			console.error("Failed to load image:", src);
			this.loadingImages--;
		};
		img.src = src;
	}

	debouncedRender() {
		// Clear existing timeout
		if (this.renderTimeout) {
			clearTimeout(this.renderTimeout);
		}
		// Wait 500ms for more images to load before rendering
		this.renderTimeout = setTimeout(() => {
			this.render();
		}, 500);
	}

	hideUploadOverlay() {
		if (this.images.length > 0) {
			this.uploadOverlay.classList.add("hidden");
		}
	}

	updateImageCount() {
		const count = this.images.length;
		this.imageCount.textContent = `${count} img${count > 1 ? "s" : ""}`;
	}

	clearGallery() {
		if (confirm("Êtes-vous sûr de vouloir effacer toutes les images ?")) {
			this.images = [];
			this.renderedImages.clear();
			this.uploadOverlay.classList.remove("hidden");
			this.updateImageCount();
			this.clearBtn.disabled = true;
			this.pauseToggle.checked = false;
			this.isPaused = false;
			this.pauseText.textContent = "Pause";
			this.render();
		}
	}

	toggleControls() {
		this.controlsPanel.classList.toggle("visible");
		this.controlsToggle.classList.toggle("open");
	}

	resetParameters() {
		this.speedSlider.value = 0.5;
		this.speedMultiplier = 0.5;
		this.speedValue.textContent = "0.5";

		// Reset color to the auto-extracted color
		this.setColor(this.autoExtractedColor);

		// Update sliders to match the auto-extracted color
		const hsl = this.hexToHsl(this.autoExtractedColor);
		this.currentHue = Math.round(hsl.h);
		this.currentSaturation = Math.round(hsl.s);
		this.currentLightness = Math.round(hsl.l);
		this.hueSlider.value = this.currentHue;
		this.saturationSlider.value = this.currentSaturation;
		this.lightnessSlider.value = this.currentLightness;
		this.hueValue.textContent = this.currentHue;
		this.saturationValue.textContent = this.currentSaturation;
		this.lightnessValue.textContent = this.currentLightness;

		// Update the background to match
		const rgbColor = `hsl(${this.currentHue}, ${this.currentSaturation}%, ${this.currentLightness}%)`;
		document.body.style.background = rgbColor;
		this.colorPreviewBtn.style.background = rgbColor;
		this.updateSliderBackgrounds();
	}

	extractDominantColor(img) {
		try {
			const canvas = document.createElement("canvas");
			canvas.width = 100;
			canvas.height = 100;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, 100, 100);

			const imageData = ctx.getImageData(0, 0, 100, 100);
			const data = imageData.data;

			let r = 0,
				g = 0,
				b = 0;
			const pixelCount = data.length / 4;

			for (let i = 0; i < data.length; i += 4) {
				r += data[i];
				g += data[i + 1];
				b += data[i + 2];
			}

			r = Math.round(r / pixelCount);
			g = Math.round(g / pixelCount);
			b = Math.round(b / pixelCount);

			const dominantColor = `rgb(${r}, ${g}, ${b})`;
			document.body.style.background = dominantColor;

			// Update color picker to show the extracted color (convert to hex)
			const hex =
				"#" +
				[r, g, b]
					.map((x) => x.toString(16).padStart(2, "0"))
					.join("")
					.toUpperCase();

			// Store the auto-extracted color for reset functionality
			this.autoExtractedColor = hex;
			this.setColor(hex);
		} catch (e) {
			console.error("Error extracting dominant color:", e);
		}
	}

	animate() {
		// Optimized animation loop - only update counts when needed
		this.animationFrameId = requestAnimationFrame(() => {
			this.updateTotalCount();
			this.handleInfiniteScroll();
			this.animate();
		});
	}

	updateTotalCount() {
		const loadingCount = this.images.filter((img) => !img.loaded).length;
		const totalCount = this.images.length;
		document.getElementById("loadingCount").textContent = loadingCount;
		document.getElementById("totalCount").textContent = totalCount;
	}

	getCardSizeClass(imageObj, variantIndex) {
		const aspectRatio = imageObj.aspectRatio || 1;

		if (aspectRatio < 0.8) return "size-tall";
		if (aspectRatio > 1.4) return "size-small";
		if (variantIndex % 3 === 0) return "size-tall";
		if (variantIndex % 2 === 0) return "size-small";
		return "size-medium";
	}

	createColumn(loadedImages, startIndex, columnIndex) {
		const column = document.createElement("div");
		column.className = "gallery-column";

		let index = startIndex;
		const cardsInColumn = 2 + (columnIndex % 3); // 2 to 4 cards

		for (let i = 0; i < cardsInColumn; i++) {
			const imageObj = loadedImages[index % loadedImages.length];

			const card = document.createElement("div");
			card.className = "gallery-card";
			card.classList.add(this.getCardSizeClass(imageObj, i + columnIndex));

			const img = document.createElement("img");
			img.src = imageObj.src;
			img.alt = "Gallery image";
			img.style.pointerEvents = "auto";

			card.appendChild(img);
			column.appendChild(card);
			index++;
		}

		return { column, nextIndex: index };
	}

	render() {
		// Only re-render if images have changed
		if (this.images.length !== this.renderedImages.size) {
			this.gallery.innerHTML = ""; // Clear DOM
			this.renderedImages.clear();

			const loadedImages = this.images.filter((imageObj) => imageObj.loaded);
			if (loadedImages.length === 0) {
				return;
			}

			const fragment = document.createDocumentFragment();
			const columnCount = Math.max(12, loadedImages.length * 2);
			let pointer = 0;

			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
				const { column, nextIndex } = this.createColumn(loadedImages, pointer, columnIndex);
				pointer = nextIndex;
				fragment.appendChild(column);
			}

			this.gallery.appendChild(fragment);

			loadedImages.forEach((imageObj) => {
				this.renderedImages.add(imageObj.src);
			});

			this.gallery.scrollLeft = 0;
		}
	}

	startAnimation() {
		this.animate();
	}

	stopAnimation() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
	}

	getRecycleStep() {
		const columns = this.gallery.querySelectorAll(".gallery-column");
		if (columns.length === 0) return 0;

		const firstLeft = columns[0].offsetLeft;

		for (let i = 1; i < columns.length; i++) {
			const delta = columns[i].offsetLeft - firstLeft;
			if (delta > 0) {
				return delta;
			}
		}

		const galleryStyle = getComputedStyle(this.gallery);
		const gap = parseFloat(galleryStyle.columnGap || galleryStyle.gap || "0") || 0;
		return columns[0].getBoundingClientRect().width + gap;
	}

	handleInfiniteScroll() {
		if (this.isPaused || this.images.length === 0) return;

		const container = this.gallery; // gallery-container with overflow-x: auto
		if (!container) return;

		// Auto-scroll horizontally with speed multiplier
		container.scrollLeft += this.scrollSpeed * this.speedMultiplier;

		// Recycle full columns to avoid grid reflow jumps.
		let safety = 0;
		while (safety < 12) {
			const step = this.getRecycleStep();
			if (step <= 0 || container.scrollLeft < step) break;

			const firstColumn = container.querySelector(".gallery-column");
			if (!firstColumn) break;

			container.appendChild(firstColumn);
			container.scrollLeft -= step;
			safety++;
		}
	}
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	const moodboard = new DynamicMoodboard();
});
