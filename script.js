// Form handling and interactive features for Pupilens landing page

/** Injected at deploy time via GitHub Actions (replace __LAHAR_TOKEN__) */
var LAHAR_TOKEN = '__LAHAR_TOKEN__';
var LAHAR_NOME_FORMULARIO = 'pupilens_lp';
var LAHAR_CONVERSIONS_URL = 'https://app.lahar.com.br/api/conversions';

function getUtmTags() {
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var parts = [];
    keys.forEach(function (key) {
        var el = document.querySelector('input[type="hidden"][name="' + key + '"]');
        var v = el && el.value ? el.value.trim() : '';
        if (v) parts.push(key + '=' + v);
    });
    return parts.join(',');
}

function buildAnotacoes(message, instagram) {
    var msg = (message || '').trim();
    var ig = (instagram || '').trim();
    if (msg && ig) return msg + '\n\nInstagram: ' + ig;
    if (ig) return 'Instagram: ' + ig;
    return msg;
}

function sendLaharConversion(data) {
    var params = new URLSearchParams();
    params.set('token_api_lahar', LAHAR_TOKEN);
    params.set('nome_formulario', LAHAR_NOME_FORMULARIO);
    params.set('tipo_integracao', 'conversions');
    params.set('estagio_lead', '1');
    params.set('url_origem', window.location.href);
    params.set('email_contato', data.email.trim());
    params.set('nome_contato', data.name.trim());
    params.set('tel_celular', data.phone.trim());
    if (data.company.trim()) {
        params.set('name_empresa', data.company.trim());
    }
    var anotacoes = buildAnotacoes(data.message, data.instagram);
    if (anotacoes) {
        params.set('anotacoes', anotacoes);
    }
    var tags = getUtmTags();
    if (tags) {
        params.set('tags', tags);
    }

    return fetch(LAHAR_CONVERSIONS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    }).then(function (res) {
        return res.text();
    }).then(function (text) {
        try {
            var json = JSON.parse(text);
            return json.status === 'sucesso';
        } catch (e) {
            return false;
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handler
const contactForm = document.getElementById('pp-form');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            instagram: document.getElementById('instagram').value,
            message: document.getElementById('message').value
        };

        if (!validateForm(formData)) {
            return;
        }

        var submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        sendLaharConversion(formData)
            .then(function (ok) {
                if (ok) {
                    showFormMessage('Obrigado! Entraremos em contato em breve.', 'success');
                    setTimeout(function () {
                        contactForm.reset();
                    }, 500);
                } else {
                    showFormMessage(
                        'Não foi possível enviar agora. Tente novamente em instantes ou entre em contato por outro canal.',
                        'error'
                    );
                }
            })
            .catch(function () {
                showFormMessage(
                    'Erro de conexão. Verifique sua internet e tente novamente.',
                    'error'
                );
            })
            .finally(function () {
                if (submitBtn) submitBtn.disabled = false;
            });
    });
}

// Form validation
function validateForm(data) {
    if (!data.name.trim()) {
        showFormMessage('Por favor, preencha seu nome.', 'error');
        return false;
    }

    if (!data.email.trim() || !isValidEmail(data.email)) {
        showFormMessage('Por favor, insira um e-mail válido.', 'error');
        return false;
    }

    if (!data.phone.trim()) {
        showFormMessage('Por favor, preencha seu telefone.', 'error');
        return false;
    }

    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form message
function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message form-message-${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        padding: 1.25rem;
        margin-top: 1.5rem;
        border-radius: 12px;
        text-align: center;
        font-weight: 700;
        font-size: 1.125rem;
        ${type === 'success' 
            ? 'background-color: #10b981; color: white;' 
            : 'background-color: #ef4444; color: white;'}
    `;

    // Insert message after form
    const form = document.getElementById('pp-form');
    if (form && form.parentNode) {
        form.parentNode.insertBefore(messageElement, form.nextSibling);
    }

    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.benefit-card, .testimonial-card, .differentiator-item, .faq-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Handle image display - hide placeholder when image is loaded
    handleImageDisplay();
});

// Image display handler
function handleImageDisplay() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const hasValidSrc = img.src && img.src !== window.location.href && img.getAttribute('src');
        if (hasValidSrc) {
            function showImage() {
                img.style.display = 'block';
                const placeholderId = (img.id || '').replace('Image', 'ImagePlaceholder').replace('Logo', 'LogoPlaceholder');
                const placeholder = placeholderId ? document.getElementById(placeholderId) : null;
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            }
            if (img.complete && img.naturalWidth > 0) {
                showImage();
            } else {
                img.onload = showImage;
                img.onerror = function() {
                    img.style.display = 'none';
                };
            }
        } else {
            img.style.display = 'none';
        }
    });
}

// FAQ accordion functionality
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        const answer = faqItem ? faqItem.querySelector('.faq-answer') : null;
        
        if (faqItem && answer) {
            const isOpen = faqItem.classList.contains('faq-open');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('faq-open');
                const itemAnswer = item.querySelector('.faq-answer');
                if (itemAnswer) {
                    itemAnswer.style.maxHeight = null;
                }
            });
            
            // Open clicked item if it wasn't open
            if (!isOpen) {
                faqItem.classList.add('faq-open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        }
    });
    
    // Make FAQ items clickable
    question.style.cursor = 'pointer';
});
