/*
 * All Strategic Priorities — standalone web app
 * Louis Riel School Division · Multi-Year Strategic Plan 2023–2027
 *
 * Behaviour preserved from the original embed:
 *   - staggered card entrance animation
 *   - per-card detail tabs (Context / Accomplished / Where We're Going)
 *   - global status + topic filtering with section auto-open/collapse
 *
 * Improvements enabled by the standalone build:
 *   - free-text keyword search across every card
 *   - live result count + an explicit "no results" state
 *   - expand-all / collapse-all controls
 *   - shareable filter state synced to the URL query string
 *   - aria-pressed state on filter chips for assistive technology
 */
(function () {
	'use strict';

	var wrapper = document.getElementById('sp1-wrapper');
	if (wrapper) wrapper.classList.add('js-ready');

	// ── Staggered card entrance for all grids ──
	document.querySelectorAll('.cards-grid').forEach(function (grid) {
		grid.querySelectorAll('.scorecard').forEach(function (card, i) {
			setTimeout(function () {
				card.classList.add('visible');
			}, 80 + i * 90);
		});
	});

	// ── Per-card detail tabs ──
	document.querySelectorAll('.card-details').forEach(function (details) {
		details.addEventListener('toggle', function () {
			if (details.open) {
				var inner = details.querySelector('.details-inner');
				if (inner && !inner.querySelector('.detail-tab-pane.active')) {
					inner.querySelectorAll('.detail-tab-pane')[0].classList.add('active');
					inner.querySelectorAll('.detail-tab-btn')[0].classList.add('active');
				}
			}
		});
		details.addEventListener('click', function (e) {
			var btn = e.target.closest('.detail-tab-btn');
			if (!btn) return;
			var tabKey = btn.getAttribute('data-tab');
			var inner = details.querySelector('.details-inner');
			inner.querySelectorAll('.detail-tab-btn').forEach(function (b) {
				b.classList.remove('active');
			});
			inner.querySelectorAll('.detail-tab-pane').forEach(function (p) {
				p.classList.remove('active');
			});
			btn.classList.add('active');
			var pane = inner.querySelector('[data-pane="' + tabKey + '"]');
			if (pane) pane.classList.add('active');
		});
	});

	// ── Global filtering / search ──
	var activeStatus = 'all';
	var activeTopic = 'all';
	var searchQuery = '';

	var globalFilterBar = document.getElementById('global-filter-bar');
	var searchInput = document.getElementById('sp-search-input');
	var searchClear = document.getElementById('sp-search-clear');
	var resultCount = document.getElementById('sp-result-count');
	var noResults = document.getElementById('sp-no-results');
	var resetFilters = document.getElementById('sp-reset-filters');
	var expandAll = document.getElementById('sp-expand-all');
	var collapseAll = document.getElementById('sp-collapse-all');

	var allCards = Array.prototype.slice.call(
		document.querySelectorAll('.cards-grid .scorecard')
	);

	// Pre-compute lowercased searchable text once per card.
	allCards.forEach(function (card) {
		card._searchText = (card.textContent || '').toLowerCase();
	});

	function filtersActive() {
		return activeStatus !== 'all' || activeTopic !== 'all' || searchQuery !== '';
	}

	function applyFilters() {
		var visibleTotal = 0;

		allCards.forEach(function (card) {
			var statusMatch = activeStatus === 'all' || card.getAttribute('data-status') === activeStatus;
			var topics = (card.getAttribute('data-topics') || '').split(' ');
			var topicMatch = activeTopic === 'all' || topics.indexOf(activeTopic) !== -1;
			var searchMatch = searchQuery === '' || card._searchText.indexOf(searchQuery) !== -1;

			if (statusMatch && topicMatch && searchMatch) {
				card.classList.remove('js-filtered-out');
				visibleTotal++;
			} else {
				card.classList.add('js-filtered-out');
			}
		});

		var active = filtersActive();

		// Auto-open sections with visible cards while filtering; collapse empty
		// ones. With no active filters, return to the default collapsed view.
		document.querySelectorAll('.sp-section').forEach(function (section) {
			var accordion = section.querySelector('.sp-accordion');
			if (!accordion) return;
			var visibleCards = section.querySelectorAll('.scorecard:not(.js-filtered-out)');
			section.classList.toggle('sp-section-empty', active && visibleCards.length === 0);
			if (!active) {
				accordion.removeAttribute('open');
			} else if (visibleCards.length > 0) {
				accordion.setAttribute('open', '');
			} else {
				accordion.removeAttribute('open');
			}
		});

		updateResultCount(visibleTotal, active);
		syncUrl();
	}

	function updateResultCount(visibleTotal, active) {
		if (resultCount) {
			if (active) {
				resultCount.textContent =
					'Showing ' + visibleTotal + ' of ' + allCards.length + ' actions';
			} else {
				resultCount.textContent = allCards.length + ' actions';
			}
		}
		if (noResults) {
			noResults.hidden = !(active && visibleTotal === 0);
		}
	}

	function setStatus(status) {
		activeStatus = status || 'all';
		syncChips('status', 'data-status', activeStatus);
	}

	function setTopic(topic) {
		activeTopic = topic || 'all';
		syncChips('topic', 'data-topic', activeTopic);
	}

	function syncChips(filterType, attr, value) {
		if (!globalFilterBar) return;
		globalFilterBar
			.querySelectorAll('[data-filter-type="' + filterType + '"]')
			.forEach(function (chip) {
				var isActive = chip.getAttribute(attr) === value;
				chip.classList.toggle('active', isActive);
				chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
			});
	}

	function setSearch(value) {
		searchQuery = (value || '').trim().toLowerCase();
		if (searchInput && searchInput.value !== value) searchInput.value = value || '';
		if (searchClear) searchClear.hidden = searchQuery === '';
	}

	// ── URL state (shareable filters) ──
	function syncUrl() {
		if (!window.history || !window.history.replaceState) return;
		var params = new URLSearchParams();
		if (activeStatus !== 'all') params.set('status', activeStatus);
		if (activeTopic !== 'all') params.set('topic', activeTopic);
		if (searchQuery !== '') params.set('q', searchQuery);
		var query = params.toString();
		var url = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
		window.history.replaceState(null, '', url);
	}

	function readUrl() {
		var params = new URLSearchParams(window.location.search);
		setStatus(params.get('status'));
		setTopic(params.get('topic'));
		setSearch(params.get('q') || '');
	}

	// ── Events ──
	if (globalFilterBar) {
		globalFilterBar.addEventListener('click', function (e) {
			var chip = e.target.closest('.filter-chip');
			if (!chip) return;
			var filterType = chip.getAttribute('data-filter-type');
			if (filterType === 'status') {
				setStatus(chip.getAttribute('data-status'));
			} else if (filterType === 'topic') {
				setTopic(chip.getAttribute('data-topic'));
			}
			applyFilters();
		});
	}

	if (searchInput) {
		searchInput.addEventListener('input', function () {
			setSearch(searchInput.value);
			applyFilters();
		});
	}

	if (searchClear) {
		searchClear.addEventListener('click', function () {
			setSearch('');
			applyFilters();
			if (searchInput) searchInput.focus();
		});
	}

	if (resetFilters) {
		resetFilters.addEventListener('click', function () {
			setStatus('all');
			setTopic('all');
			setSearch('');
			applyFilters();
		});
	}

	if (expandAll) {
		expandAll.addEventListener('click', function () {
			document.querySelectorAll('.sp-accordion').forEach(function (accordion) {
				accordion.setAttribute('open', '');
			});
		});
	}

	if (collapseAll) {
		collapseAll.addEventListener('click', function () {
			document.querySelectorAll('.sp-accordion').forEach(function (accordion) {
				accordion.removeAttribute('open');
			});
		});
	}

	// ── Init ──
	readUrl();
	applyFilters();
})();
