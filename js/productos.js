(function () {
    'use strict';

    var DISCOUNT_COUPON = 'DESC50';
    var DISCOUNT_RATE = 0.5;

    var WASH_SERVICES = {
        'basico-bajo': {
            title: 'Básico — Bajo c.c.',
            description:
                'Shampoo PH neutro; restaurador de llantas en gel.',
            price: 18000,
            image: 'imagenes/Motolavado1.jpg'
        },
        'basico-alto': {
            title: 'Básico — Alto c.c.',
            description:
                'Shampoo PH neutro; restaurador de llantas en gel.',
            price: 25000,
            image: 'imagenes/Motolavado1.jpg'
        },
        'medio-bajo': {
            title: 'Medio — Bajo c.c.',
            description:
                'Shampoo PH neutro; desengrasada kit de arrastre; restaurador de partes negras y motor; lubricada de cadena; restaurador de llantas en gel.',
            price: 23000,
            image: 'imagenes/Motolavado2.jpg'
        },
        'medio-alto': {
            title: 'Medio — Alto c.c.',
            description:
                'Shampoo PH neutro; desengrasada kit de arrastre; restaurador de partes negras y motor; lubricada de cadena; restaurador de llantas en gel.',
            price: 30000,
            image: 'imagenes/Motolavado2.jpg'
        },
        'completo-bajo': {
            title: 'Completo — Bajo c.c.',
            description:
                'Shampoo PH neutro; desengrasada kit de arrastre + piñón; restaurador de partes negras y motor; cera porcenalizadora; lubricada de cadena; restaurador de llantas en gel.',
            price: 28000,
            image: 'imagenes/Motolavado3.jpg'
        },
        'completo-alto': {
            title: 'Completo — Alto c.c.',
            description:
                'Shampoo PH neutro; desengrasada kit de arrastre + piñón; restaurador de partes negras y motor; cera porcenalizadora; lubricada de cadena; restaurador de llantas en gel.',
            price: 35000,
            image: 'imagenes/Motolavado3.jpg'
        },
        'deluxe-bajo': {
            title: 'Deluxe — Bajo c.c.',
            description:
                'Desmanchado de pintura; shampoo PH neutro; desengrasada kit de arrastre + piñón; removedor de óxido de tubería de escape; restaurador de partes negras y motor; diamantizado de pintura; lubricada de cadena; restaurador de llantas en gel.',
            price: 60000,
            image: 'imagenes/Motolavado5.jpg'
        },
        'deluxe-alto': {
            title: 'Deluxe — Alto c.c.',
            description:
                'Desmanchado de pintura; shampoo PH neutro; desengrasada kit de arrastre + piñón; removedor de óxido de tubería de escape; restaurador de partes negras y motor; diamantizado de pintura; lubricada de cadena; restaurador de llantas en gel.',
            price: 70000,
            image: 'imagenes/Motolavado5.jpg'
        },
        ciclas: {
            title: 'Ciclas',
            description:
                'Shampoo PH neutro; desengrasada y lubricada de cadena; restaurador de llantas en gel. (Bicicletas — precio único.)',
            price: 10000,
            image: 'imagenes/Motolavado4.png'
        }
    };

    var form = document.getElementById('product-form');
    var grid = document.getElementById('product-grid');
    var feedback = document.getElementById('form-feedback');
    var presetSelect = document.getElementById('wash-preset');
    var searchInput = document.getElementById('search-by-placa');
    var searchNoResults = document.getElementById('search-no-results');

    var imageInput = document.getElementById('product-image-url');
    var titleInput = document.getElementById('product-title');
    var descriptionInput = document.getElementById('product-description');
    var priceInput = document.getElementById('product-price');

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.className = 'mb-3';
        if (type === 'error') {
            feedback.classList.add('is-error');
        } else if (type === 'success') {
            feedback.classList.add('is-success');
        }
    }

    function clearFeedback() {
        feedback.textContent = '';
        feedback.className = 'mb-3';
    }

    function applyCoupon(couponCode) {
        return String(couponCode).trim().toUpperCase() === DISCOUNT_COUPON;
    }

    function calculateFinalPrice(basePrice, couponActive) {
        if (couponActive) {
            return Math.round(basePrice * (1 - DISCOUNT_RATE));
        }
        return basePrice;
    }

    function applyWashPreset() {
        var key = presetSelect.value;
        if (!key || !WASH_SERVICES[key]) {
            return;
        }
        var svc = WASH_SERVICES[key];
        titleInput.value = svc.title;
        descriptionInput.value = svc.description;
        imageInput.value = svc.image;
        priceInput.value = String(svc.price);
    }

    presetSelect.addEventListener('change', function () {
        if (presetSelect.value) {
            applyWashPreset();
        }
    });

    [titleInput, descriptionInput, priceInput].forEach(function (el) {
        el.addEventListener('paste', function (event) {
            event.preventDefault();
        });
        el.addEventListener('drop', function (event) {
            event.preventDefault();
        });
    });

    function normalizeSearchText(value) {
        return String(value).trim().toLowerCase().replace(/\s+/g, '');
    }

    function applySearchFilter() {
        var queryRaw = searchInput.value.trim();
        var query = normalizeSearchText(queryRaw);
        var cards = grid.querySelectorAll('[data-product-card]');
        var visible = 0;

        cards.forEach(function (card) {
            var idAttr = card.getAttribute('data-identifier') || '';
            var idNorm = normalizeSearchText(idAttr);
            var match =
                !query ||
                idNorm.indexOf(query) !== -1 ||
                idAttr.toLowerCase().indexOf(queryRaw.toLowerCase()) !== -1;

            if (match) {
                card.classList.remove('product-card--hidden');
                visible++;
            } else {
                card.classList.add('product-card--hidden');
            }
        });

        if (query && cards.length > 0 && visible === 0) {
            searchNoResults.textContent =
                'No hay coincidencias para «' + queryRaw + '». Prueba con otra placa o borra el filtro.';
            searchNoResults.classList.remove('d-none');
        } else {
            searchNoResults.textContent = '';
            searchNoResults.classList.add('d-none');
        }
    }

    function createProductCard(data) {
        var article = document.createElement('article');
        article.className = 'product-card';
        article.setAttribute('data-product-card', '');
        article.setAttribute('data-identifier', data.identifier.trim());

        var imgWrap = document.createElement('div');
        imgWrap.className = 'product-card__image-wrap';

        var img = document.createElement('img');
        img.className = 'product-card__image';
        img.src = data.imageUrl;
        img.alt = data.title;
        img.loading = 'lazy';
        img.addEventListener('error', function () {
            img.alt = 'Imagen no disponible';
            img.src =
                'data:image/svg+xml,' +
                encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23e9ecef" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-family="sans-serif" font-size="14">Sin imagen</text></svg>'
                );
        });

        imgWrap.appendChild(img);

        var body = document.createElement('div');
        body.className = 'product-card__body';

        var titleEl = document.createElement('h3');
        titleEl.className = 'product-card__title';
        titleEl.textContent = data.title;

        var idBlock = document.createElement('p');
        idBlock.className = 'product-card__identifier';
        var idLabel = document.createElement('span');
        idLabel.className = 'product-card__identifier-label';
        idLabel.textContent = data.identifierKind === 'ciclas'
            ? 'Documento / referencia: '
            : 'Placa: ';
        var idValue = document.createElement('strong');
        idValue.textContent = data.identifier;
        idBlock.appendChild(idLabel);
        idBlock.appendChild(idValue);

        var descEl = document.createElement('p');
        descEl.className = 'product-card__description';
        descEl.textContent = data.description;

        var pricesDiv = document.createElement('div');
        pricesDiv.className = 'product-card__prices';

        var finalSpan = document.createElement('span');
        finalSpan.className = 'product-card__price-final';
        finalSpan.textContent = formatCurrency(data.finalPrice);

        pricesDiv.appendChild(finalSpan);

        if (data.couponApplied) {
            var origSpan = document.createElement('span');
            origSpan.className = 'product-card__price-original';
            origSpan.textContent = formatCurrency(data.basePrice);
            pricesDiv.appendChild(origSpan);

            var badge = document.createElement('div');
            badge.className = 'product-card__badge';
            badge.textContent = 'Cupón ' + DISCOUNT_COUPON + ' (−50%)';
            pricesDiv.appendChild(badge);
        }

        var deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline-danger product-card__delete';
        deleteBtn.setAttribute('data-action', 'delete');
        deleteBtn.innerHTML =
            '<i class="bi bi-trash3 me-1" aria-hidden="true"></i>Eliminar';

        body.appendChild(titleEl);
        body.appendChild(idBlock);
        body.appendChild(descEl);
        body.appendChild(pricesDiv);
        body.appendChild(deleteBtn);

        article.appendChild(imgWrap);
        article.appendChild(body);

        return article;
    }

    function removeEmptyState() {
        var empty = grid.querySelector('.empty-catalog');
        if (empty) {
            empty.remove();
        }
    }

    function ensureEmptyState() {
        if (grid.querySelectorAll('[data-product-card]').length === 0) {
            grid.innerHTML =
                '<p class="empty-catalog">Aún no hay servicios en la lista. Elige una variante del catálogo (cada una es un producto aparte) o completa los campos y pulsa <strong>Guardar</strong>.</p>';
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearFeedback();

        var imageUrl = imageInput.value.trim();
        var title = titleInput.value.trim();
        var description = descriptionInput.value.trim();
        var priceRaw = priceInput.value.trim();
        var identifierRaw = document.getElementById('product-identifier').value.trim();
        var coupon = document.getElementById('product-coupon').value;
        var isCiclasService = presetSelect.value === 'ciclas';

        if (!imageUrl || !title || !description) {
            showFeedback(
                'Elige una variante del catálogo y completa la imagen (URL o ruta).',
                'error'
            );
            return;
        }

        if (!identifierRaw) {
            showFeedback(
                'Completa el campo Placa.',
                'error'
            );
            return;
        }

        var basePrice = parseFloat(priceRaw.replace(',', '.'));
        if (isNaN(basePrice) || basePrice < 0) {
            showFeedback(
                'Ingresa un valor numérico válido (precio mayor o igual a 0).',
                'error'
            );
            return;
        }

        var couponApplied = applyCoupon(coupon);
        var finalPrice = calculateFinalPrice(basePrice, couponApplied);

        removeEmptyState();

        var card = createProductCard({
            imageUrl: imageUrl,
            title: title,
            description: description,
            identifier: identifierRaw,
            identifierKind: isCiclasService ? 'ciclas' : 'moto',
            basePrice: basePrice,
            finalPrice: finalPrice,
            couponApplied: couponApplied
        });

        grid.appendChild(card);
        applySearchFilter();
        form.reset();
        presetSelect.value = '';
        showFeedback('Servicio agregado a la lista.', 'success');
    });

    searchInput.addEventListener('input', applySearchFilter);

    grid.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-action="delete"]');
        if (!btn) {
            return;
        }
        var card = btn.closest('[data-product-card]');
        if (card) {
            card.remove();
            ensureEmptyState();
            applySearchFilter();
        }
    });

    ensureEmptyState();
})();
