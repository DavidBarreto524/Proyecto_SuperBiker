(function (global) {
    'use strict';

    var STORAGE_USERS = 'sbk_users';
    var STORAGE_SESSION = 'sbk_session';
    var ADMIN_USER = 'admin';
    var ADMIN_PASS = 'Sencho524**';

    function normalizePhone(phone) {
        return String(phone || '').replace(/\D/g, '');
    }

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }

    function registerClient(name, phone, password) {
        var phoneN = normalizePhone(phone);
        if (!phoneN || phoneN.length < 10) {
            throw new Error('Celular inválido (usa al menos 10 dígitos, ej. 3178735151).');
        }
        if (!name || !String(name).trim()) {
            throw new Error('Ingresa tu nombre.');
        }
        if (!password || String(password).length < 4) {
            throw new Error('La clave debe tener al menos 4 caracteres.');
        }
        var users = getUsers();
        if (users.some(function (u) { return u.phone === phoneN; })) {
            throw new Error('Ese número de celular ya está registrado.');
        }
        users.push({
            phone: phoneN,
            name: String(name).trim(),
            password: String(password)
        });
        saveUsers(users);
    }

    function login(identifier, password) {
        var id = String(identifier || '').trim();
        var pass = String(password || '');
        if (id.toLowerCase() === ADMIN_USER && pass === ADMIN_PASS) {
            sessionStorage.setItem(
                STORAGE_SESSION,
                JSON.stringify({
                    type: 'admin',
                    name: 'Administrador',
                    user: 'admin'
                })
            );
            return true;
        }
        var phoneN = normalizePhone(id);
        var users = getUsers();
        var found = users.find(function (x) {
            return x.phone === phoneN && x.password === pass;
        });
        if (found) {
            sessionStorage.setItem(
                STORAGE_SESSION,
                JSON.stringify({
                    type: 'client',
                    name: found.name,
                    phone: found.phone
                })
            );
            return true;
        }
        return false;
    }

    function getSession() {
        try {
            var raw = sessionStorage.getItem(STORAGE_SESSION);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function logout() {
        sessionStorage.removeItem(STORAGE_SESSION);
    }

    function requireAuthRedirect(returnFileName) {
        if (!getSession()) {
            var page =
                returnFileName ||
                (location.pathname.split('/').pop() || 'productos.html');
            if (!page || page === '') {
                page = 'productos.html';
            }
            location.replace(
                'ingresar.html?return=' + encodeURIComponent(page)
            );
        }
    }

    function getGreetingLabel() {
        var s = getSession();
        if (!s) {
            return '';
        }
        if (s.type === 'admin') {
            return s.user || 'admin';
        }
        return s.name || 'Usuario';
    }

    global.SBKAuth = {
        normalizePhone: normalizePhone,
        registerClient: registerClient,
        login: login,
        getSession: getSession,
        logout: logout,
        requireAuthRedirect: requireAuthRedirect,
        getGreetingLabel: getGreetingLabel
    };
})(typeof window !== 'undefined' ? window : this);
