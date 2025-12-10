// main.js - JavaScript principal para todo o site

// Configurações globais
const SITE_CONFIG = {
    name: 'ConstruCode',
    version: '1.0.0',
    apiUrl: 'https://api.construcode.com',
    contactEmail: 'contato@construcode.com',
    contactPhone: '(11) 98765-4321'
};

// Inicialização do site
document.addEventListener('DOMContentLoaded', function() {
    console.log(`${SITE_CONFIG.name} v${SITE_CONFIG.version} carregado`);
    
    // Inicializar componentes
    initMobileMenu();
    initSmoothScroll();
    initFormValidation();
    initPWA();
    initCookieConsent();
    initLazyLoading();
    initBackToTop();
    
    // Verificar conexão
    checkConnection();
    
    // Analytics (simulado)
    trackPageView();
});

// Menu Mobile
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.textContent = '☰';
        }
    });
    
    // Fechar menu ao clicar em link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.textContent = '☰';
        });
    });
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header')?.offsetHeight || 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Atualizar URL sem recarregar a página
                history.pushState(null, null, targetId);
            }
        });
    });
}

// Validação de Formulários
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // Validação em tempo real
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Validações básicas
    if (!value) {
        isValid = false;
        message = 'Este campo é obrigatório.';
    } else if (field.type === 'email' && !isValidEmail(value)) {
        isValid = false;
        message = 'Por favor, insira um e-mail válido.';
    } else if (field.type === 'tel' && !isValidPhone(value)) {
        isValid = false;
        message = 'Por favor, insira um telefone válido.';
    } else if (field.minLength && value.length < field.minLength) {
        isValid = false;
        message = `Mínimo de ${field.minLength} caracteres.`;
    }
    
    // Mostrar/ocultar erro
    if (!isValid) {
        showFieldError(field, message);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    `;
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#dc3545';
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    // Remove caracteres não numéricos e valida
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

// PWA
function initPWA() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                    
                    // Verificar atualizações
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('Falha no registro do Service Worker:', error);
                });
        });
    }
    
    // Instalação do PWA
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botão de instalação
        showInstallButton();
    });
    
    // Gerenciar botão de instalação
    function showInstallButton() {
        const installBtn = document.getElementById('installPWA');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', installPWA);
        }
    }
    
    function installPWA() {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou instalação');
                document.getElementById('installPWA').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
    
    // Verificar se já está instalado
    window.addEventListener('appinstalled', () => {
        console.log('PWA instalado');
        document.getElementById('installPWA')?.style.display = 'none';
    });
}

function showUpdateNotification() {
    const updateDiv = document.createElement('div');
    updateDiv.className = 'update-notification';
    updateDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--secondary-color);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    updateDiv.innerHTML = `
        <span>Nova versão disponível!</span>
        <button onclick="location.reload()" style="background: white; color: var(--secondary-color); border: none; padding: 5px 15px; border-radius: 5px; font-weight: 600; cursor: pointer;">
            Atualizar
        </button>
    `;
    
    document.body.appendChild(updateDiv);
    
    // Remover após 30 segundos
    setTimeout(() => {
        updateDiv.remove();
    }, 30000);
}

// Cookie Consent
function initCookieConsent() {
    if (localStorage.getItem('cookiesAccepted')) return;
    
    setTimeout(() => {
        showCookieConsent();
    }, 2000);
}

function showCookieConsent() {
    const consentDiv = document.createElement('div');
    consentDiv.className = 'cookie-consent';
    consentDiv.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--primary-color);
        color: white;
        padding: 1.5rem;
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    `;
    
    consentDiv.innerHTML = `
        <div style="flex: 1; min-width: 300px;">
            <p style="margin: 0; font-size: 0.9rem;">
                Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa 
                <a href="legal.html#cookies" style="color: var(--secondary-color);">Política de Cookies</a>.
            </p>
        </div>
        <div style="display: flex; gap: 1rem;">
            <button onclick="acceptCookies()" style="background: var(--secondary-color); color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-weight: 500;">
                Aceitar
            </button>
            <button onclick="rejectCookies()" style="background: transparent; color: white; border: 1px solid white; padding: 8px 20px; border-radius: 5px; cursor: pointer;">
                Recusar
            </button>
        </div>
    `;
    
    document.body.appendChild(consentDiv);
    
    // Animar entrada
    setTimeout(() => {
        consentDiv.style.transform = 'translateY(0)';
    }, 100);
}

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('cookiesDate', new Date().toISOString());
    document.querySelector('.cookie-consent').remove();
    console.log('Cookies aceitos');
}

function rejectCookies() {
    localStorage.setItem('cookiesAccepted', 'false');
    localStorage.setItem('cookiesDate', new Date().toISOString());
    document.querySelector('.cookie-consent').remove();
    console.log('Cookies recusados');
}

// Lazy Loading
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Back to Top
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTop';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--secondary-color);
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        box-shadow: var(--shadow);
        z-index: 999;
        transition: var(--transition);
    `;
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.title = 'Voltar ao topo';
    
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Verificar Conexão
function checkConnection() {
    const offlineIndicator = document.createElement('div');
    offlineIndicator.className = 'offline-indicator';
    offlineIndicator.innerHTML = '⚡ Modo offline ativado';
    document.body.appendChild(offlineIndicator);
    
    window.addEventListener('online', () => {
        offlineIndicator.classList.remove('show');
        console.log('Conexão restaurada');
    });
    
    window.addEventListener('offline', () => {
        offlineIndicator.classList.add('show');
        console.log('Sem conexão com a internet');
    });
    
    // Verificar status inicial
    if (!navigator.onLine) {
        offlineIndicator.classList.add('show');
    }
}

// Analytics (simulado)
function trackPageView() {
    const pageData = {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    
    // Salvar no localStorage para análise
    const views = JSON.parse(localStorage.getItem('pageViews') || '[]');
    views.push(pageData);
    localStorage.setItem('pageViews', JSON.stringify(views.slice(-100))); // Guardar últimas 100 visualizações
    
    console.log('Page view tracked:', pageData);
}

// Utilitários
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Exportar funções globais
window.SITE = {
    config: SITE_CONFIG,
    utils: {
        debounce,
        throttle,
        validateEmail: isValidEmail,
        validatePhone: isValidPhone
    },
    pwa: {
        install: installPWA
    }
};