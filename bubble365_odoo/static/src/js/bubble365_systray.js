/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

class BubbleSystray extends Component {
	setup() {
		this.notification = useService("notification");
		this.action = useService("action");

		this.iframeVisible = false;
		this.containerId = "bubble365-iframe-container";

		const container = document.createElement("div");
		container.id = this.containerId;
		container.className = "bubble365-float-container";

		const header = document.createElement("div");
		header.className = "bubble365-float-header";

		const title = document.createElement("span");
		title.innerText = "Bubble365";
		header.appendChild(title);

		const closeButton = document.createElement("button");
		closeButton.innerText = "×";
		closeButton.className = "bubble365-close-button";

		closeButton.onclick = () => this.toggleIframe();
		header.appendChild(closeButton);

		header.onmousedown = (e) => {
			e.preventDefault();
			document.body.style.userSelect = "none";

			let startX = e.clientX;
			let startY = e.clientY;
			const rect = container.getBoundingClientRect();

			const onMouseMove = (e) => {
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;
				container.style.left = rect.left + dx + "px";
				container.style.top = rect.top + dy + "px";
			};

			const onMouseUp = () => {
				document.body.style.userSelect = "";
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		};

		const iframe = document.createElement("iframe");
		iframe.src = this.getIframeUrl();
		iframe.className = "bubble365-iframe";

		container.appendChild(header);
		container.appendChild(iframe);
		document.body.appendChild(container);

		this.container = container;
		this.iframe = iframe;

		window.addEventListener("message", (event) => {
			if (!event.data?.type?.startsWith("bubble365:")) return;

			if (event.data.type === "bubble365:show") {
				this.container.style.display = "flex";
				this.iframeVisible = true;
			}

			if (event.data.type === "bubble365:hide") {
				this.container.style.display = "none";
				this.iframeVisible = false;

				if (event.data.message) {
					this.notification.add(event.data.message, {
						type: "success",
					});
				}
			}
		});

		document.addEventListener("click", (e) => {
			const link = e.target.closest('a[href^="tel:"]');
			if (!link) return;

			e.preventDefault();
			const phone = link.getAttribute("href").replace("tel:", "");

			const iframe = document.getElementById(this.containerId)?.querySelector("iframe");
			if (iframe?.contentWindow) {
				iframe.contentWindow.postMessage({
					type: "bubble365:startCall",
					payload: { phoneNumber: phone },
				}, "*");
			}
		});

		window.addEventListener("message", (event) => {
			const { type, url } = event.data || {};
			if (type === "bubble365:navigate" && typeof url === "string") {
				try {
					const hashIndex = url.indexOf('#');
					if (hashIndex === -1) return;

					const params = new URLSearchParams(url.slice(hashIndex + 1));
					const model = params.get("model");
					const id = parseInt(params.get("id") || "");
					const menu_id = parseInt(params.get("menu_id") || "");
					const view_type = params.get("view_type") || "form";

					if (!model || isNaN(id)) {
						console.warn("Missing required parameters:", { model, id });
						return;
					}

					this.action.doAction({
						type: "ir.actions.act_window",
						name: model,
						res_model: model,
						res_id: id,
						view_mode: view_type,
						views: [[false, view_type]],
						target: "current",
						menu_id: isNaN(menu_id) ? undefined : menu_id,
					});
				} catch (error) {
					console.error("Failed to navigate from bubble365 iframe:", error);
				}
			}
		});
	}

	getIframeUrl() {
		return "https://odoo.eu.bubble365.app/";
	}

	toggleIframe() {
		this.iframeVisible = !this.iframeVisible;
		this.container.style.display = this.iframeVisible ? "flex" : "none";
	}
}

BubbleSystray.template = "bubble365_odoo.BubbleSystray";

registry.category("systray").add("bubble365_odoo.systray", { Component: BubbleSystray, }, { sequence: 10000 });