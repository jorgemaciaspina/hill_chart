import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
	static values = { 
		projectId: Number,
		taskId: Number,
		snapshotsHidden: Boolean
	 }
	connect() {
		console.log('Hill chart controller!')
		this.loadTasks()
	}

	async loadTasks() {
		let res = await fetch(`/projects/${this.projectIdValue}/hill_tasks`)
		this.tasks = await res.json()
		this.listTasks()
		this.drawTasks()
	}

	listTasks() {
		this.element.querySelector("#tasks").innerHTML = 
		this.tasks.map(t => `<li id="task-${t.id}" class="mb-2">
			<span>${t.title} - ${t.state}</span>
			${this.generateRemoveTaskHtml(t.id)}
			</li>`).join("")
	}

	generateRemoveTaskHtml(taskId) {
		return `<button
				data-action="hill-chart#removeTask"
				data-hill-chart-task-id-value="${taskId}"
				class="text-xs px-2 py-1 bg-red-600 text-white rounded cursor-pointer">Remove</button>`
	}

	drawTasks() {
		const svg = this.element.querySelector("svg")
		// Clear dots & labels
		svg.querySelectorAll("g.task-group").forEach(g => g.remove())

		this.tasks.forEach(task => {
			let { x, y } = this.pointOnPath(task.position)
			// Create a group to hold the circle and the text
			const group = document.createElementNS(svg.namespaceURI, "g")
			group.classList.add('task-group')
			group.dataset.id = task.id
			// Create circle
			let circle = document.createElementNS(svg.namespaceURI, "circle")
			circle.setAttribute("cx", x)
			circle.setAttribute("cy", y)
			circle.setAttribute("r", 8)
			circle.setAttribute("fill", this.colorForState(task.state))
			circle.dataset.id = task.id
			circle.dataset.position = task.position
			circle.style.cursor = "grab"
			// Create text label
			const text = document.createElementNS(svg.namespaceURI, "text")
			text.textContent = task.title
			text.setAttribute("x", x + 12)
			text.setAttribute("y", y - 8)
			text.setAttribute("font-size", "16")
			text.setAttribute("fill", "rgb(104, 87, 178)")
			text.style.userSelect = "none"

			this.makeDraggable(circle, text)

			group.append(circle, text)
			svg.appendChild(group)
		})
	}

	pointOnPath(pos) {
		const path = this.element.querySelector("#hill-path")
		const length = path.getTotalLength()
		const point = path.getPointAtLength(pos * length)
		return { x: point.x, y: point.y }
	}

	colorForState(state) {
		switch (state) {
			case "uphill": return "#FF0000"
      case "crest":   return "#d97706"
      case "downhill":return "#047857"
		}
	}

	makeDraggable(circle, text) {
		let dragging = false
		circle.addEventListener("pointerdown", (e) => { 
			dragging = true; 
			circle.setPointerCapture(e.pointerId)
		})

		window.addEventListener("pointerup", e => {
			if (!dragging) return
			this.savePosition(circle, text)
			dragging = false
			circle.releasePointerCapture(e.pointerId)
		})

		window.addEventListener("pointermove", e => {
			if (!dragging) return

			let svg = this.element.querySelector("svg")
			let pt = svg.createSVGPoint()
			pt.x = e.clientX; pt.y = e.clientY
			let cursor = pt.matrixTransform(svg.getScreenCTM().inverse())

			let nearest = this.nearestPosition(cursor)
			let { x, y } = this.pointOnPath(nearest)

			circle.setAttribute("cx", x)
			circle.setAttribute("cy", y)
			text.setAttribute("x", x + 12)
			text.setAttribute("y", y + 4)

			circle.dataset.position = nearest
		})
	}

	nearestPosition({ x, y }) {
		const path = this.element.querySelector("#hill-path")
		const segs = 2000
		let best = { pos: 0, dist: Infinity }
		for (let i = 0; i <= segs; i++) {
			let t = i / segs
			let pt = path.getPointAtLength(t * path.getTotalLength())
			let d = (pt.x - x)**2 + (pt.y - y)**2
			if (d < best.dist) best = { pos: t, dist: d }
		}
		return best.pos
	}

	async savePosition(circle, text) {
		let id = circle.dataset.id
		let pos = circle.dataset.position
		let state = this.deriveState(pos)

		await fetch(`/projects/${this.projectIdValue}/hill_tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hill_task: { position: pos, state } })
    })
    circle.setAttribute("fill", this.colorForState(state))
		this.element.querySelector(`#task-${circle.dataset.id}`).innerHTML = `<span>${text.textContent} - ${state}</span> ${this.generateRemoveTaskHtml(id)}`
	}

	deriveState(pos) {
		if (pos < 0.45) return "uphill"
		if (pos < 0.55) return "crest"
		return "downhill"
	}

	// Snapshots
	async takeSnapshot() {
		const svgEl = this.element.querySelector("svg")
		const svgData = svgEl.outerHTML
		let res = await fetch(`/projects/${this.projectIdValue}/project_snapshots`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ project_snapshot: { svg_data: svgData } })
		})

		if (res.ok) {
			this.reloadSnapshots()
			this.showToast("Snapshot saved!", { error: false })
		} else {
			this.showToast("Failed to save snapshot", { error: true })
		}		
	}

	async reloadSnapshots() {
		const res = await fetch(`/projects/${this.projectIdValue}/project_snapshots`)
		const html = await res.text()
		document.getElementById("snapshots-container").innerHTML = html
	}

	showToast(message, { error = false } = {}) {
		const container = document.getElementById("toast-container")
		const toast = document.createElement("div")
		
		toast.className = ["px-4 py-2 rounded shadow-md text-sm font-medium",
      error ? "bg-red-600 text-white" : "bg-green-600 text-white"].join(" ")

			toast.textContent = message
			container.appendChild(toast)
			
			// Fade in
			setTimeout(() => {
				toast.classList.add("opacity-100")
			}, 10)

			// Fade out
			setTimeout(() => {
				toast.classList.remove("opacity-100")
				setTimeout(() => {
					toast.remove()
				}, 300)
			}, 3000)
	}

	async removeTask(e) {
		const id = e.currentTarget.dataset.hillChartTaskIdValue
		if(!confirm("Are you sure you want to remove this task?")) return

		let res = await fetch(`/projects/${this.projectIdValue}/hill_tasks/${id}`, {
			method: "DELETE"
		})
		if (!res.ok) {
			this.showToast("Failed to remove task", { error: true })
			return
		}

		this.loadTasks()
	}

	toggleSnapshots(e) {
		this.snapshotsHiddenValue = !this.snapshotsHiddenValue

		const container = this.element.querySelector("#snapshots-container")
		const btn = this.element.querySelector("#snapshot-toggle-btn")

		if (this.snapshotsHiddenValue) {
			container.classList.add("hidden")
			btn.textContent = "Show Snapshots"
		} else {
			container.classList.remove("hidden")
			btn.textContent = "Hide Snapshots"
		}
	}
}
