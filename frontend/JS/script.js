document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // UTILITY: Safe execution wrapper
    // ============================================
    function safeExecute(fn) {
        try {
            fn();
        } catch (e) {
            console.warn('⚠️ Feature skipped:', e.message);
        }
    }
    // ============================================
    // 1B. AUTH-AWARE NAV (Login/Register <-> Dashboard/Logout)
    // ============================================
    safeExecute(function () {
        if (window.HospitalAPI) {
            window.HospitalAPI.updateAuthNav();
        }
    });

    // ============================================
    // 2. ACTIVE NAV LINK HIGHLIGHT
    // ============================================
    safeExecute(function () {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.navbar-nav .nav-link, .nav-link, .fot').forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === current) {
                link.classList.add('active');
            }
        });
    });

    // ============================================
    // 3. SCROLL REVEAL ANIMATIONS
    // ============================================
    safeExecute(function () {
        const els = document.querySelectorAll('.section, .card, .gallery-item, .testimonial-card, .stat-box, .dept-item');
        if (!els.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.15 });

        els.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            observer.observe(el);
        });
    });

    // ============================================
    // 4. LIVE NUMBER COUNTERS (Homepage Stats)
    // ============================================
    safeExecute(function () {
        const counters = document.querySelectorAll('.stat-box h3');
        if (!counters.length) return;

        let animated = false;
        const observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !animated) {
                animated = true;

                counters.forEach(function (counter) {
                    // Extract number from text like "150+" or "10K+"
                    const text = counter.innerText.trim();
                    const raw = text.replace(/[^0-9K]/g, '');
                    let target = parseInt(raw);
                    if (text.includes('K')) target = target * 1000;

                    const duration = 2000;
                    const startTime = performance.now();
                    const startValue = 0;

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * target);

                        // Format output
                        let display = current;
                        if (current >= 10000) display = (current / 1000).toFixed(1) + 'K';
                        else if (current >= 1000) display = (current / 1000).toFixed(1) + 'K';
                        counter.innerText = display + '+';

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            // Final value with original format
                            let finalDisplay = target;
                            if (target >= 10000) finalDisplay = (target / 1000).toFixed(1) + 'K';
                            else if (target >= 1000) finalDisplay = (target / 1000).toFixed(1) + 'K';
                            counter.innerText = finalDisplay + '+';
                        }
                    }
                    requestAnimationFrame(updateCounter);
                });
            }
        }, { threshold: 0.5 });

        counters.forEach(function (c) {
            observer.observe(c.closest('.stat-box') || c.parentElement);
        });
    });

    // 6. DOCTOR FILTER SYSTEM

    safeExecute(function () {
        const btns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.doctor-card');
        if (!btns.length || !cards.length) return;

        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                btns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                const filter = this.dataset.filter;
                cards.forEach(function (card) {
                    const category = card.dataset.category;
                    card.style.display = (filter === 'all' || category === filter) ? 'flex' : 'none';
                });
            });
        });
    });

    // ============================================
    // 7. DOCTOR "BOOK" BUTTON
    // ============================================
    safeExecute(function () {
        document.querySelectorAll('.book-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const name = this.dataset.doctorName || 'Doctor';
                sessionStorage.setItem('prefillDoctor', name);
                alert('📋 Booking with Dr. ' + name + '. Redirecting to appointment page...');
                window.location.href = 'appointment.html';
            });
        });
    });

    // ============================================
    // 8. DYNAMIC DOCTOR DROPDOWN (Appointment)
    // Pulls the live doctor list for the chosen department from the backend.
    // ============================================
    safeExecute(function () {
        const deptSelect = document.querySelector('#department');
        const docSelect = document.querySelector('#doctor');
        if (!deptSelect || !docSelect || !window.HospitalAPI) return;

        async function loadDoctorsFor(dept) {
            docSelect.innerHTML = '<option value="">Any Available</option>';
            if (!dept) return;

            try {
                const data = await window.HospitalAPI.apiFetch(
                    '/doctors?department=' + encodeURIComponent(dept)
                );
                (data.doctors || []).forEach(function (doc) {
                    const opt = document.createElement('option');
                    opt.value = doc.name;
                    opt.textContent = doc.name + ' (' + doc.specialty + ')';
                    docSelect.appendChild(opt);
                });
            } catch (err) {
                console.warn('⚠️ Could not load doctors:', err.message);
            }
        }

        deptSelect.addEventListener('change', function () {
            loadDoctorsFor(this.value);
        });

        // Trigger on load if department is pre-selected
        if (deptSelect.value) {
            loadDoctorsFor(deptSelect.value);
        }
    });

    // ============================================
    // 9. APPOINTMENT FORM VALIDATION
    // ============================================
    safeExecute(function () {
        const form = document.querySelector('#appointmentForm');
        if (!form) return;

        // Block past dates
        const dateInput = form.querySelector('#date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        // Prefill doctor from sessionStorage
        const docField = form.querySelector('#doctor');
        if (docField && sessionStorage.getItem('prefillDoctor')) {
            docField.value = sessionStorage.getItem('prefillDoctor');
            sessionStorage.removeItem('prefillDoctor');
        }

        // Form validation on submit
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = form.querySelector('#name');
            const email = form.querySelector('#email');
            const phone = form.querySelector('#phone');
            const date = form.querySelector('#date');
            const dept = form.querySelector('#department');

            let isValid = true;

            // Reset borders
            [name, email, phone, date, dept].forEach(function (field) {
                if (field) field.style.borderColor = '#ced4da';
            });

            // Validate Name
            if (name && name.value.trim().length < 2) {
                name.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please enter your full name.');
            }

            // Validate Phone
            if (phone && !/^[0-9]{10}$/.test(phone.value.trim())) {
                phone.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please enter a valid 10-digit phone number.');
            }

            // Validate Email
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                email.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please enter a valid email address.');
            }

            // Validate Date
            if (date && !date.value) {
                date.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please select an appointment date.');
            }

            // Validate Department
            if (dept && !dept.value) {
                dept.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please select a department.');
            }

            if (!isValid) return;

            if (!window.HospitalAPI) {
                alert('✅ Appointment successful');
                form.reset();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : null;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Booking...';
            }

            const messageField = form.querySelector('#message');

            window.HospitalAPI.apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    department: dept.value,
                    doctor: form.querySelector('#doctor') ? form.querySelector('#doctor').value : '',
                    date: date.value,
                    time: form.querySelector('#time') ? form.querySelector('#time').value : '',
                    message: messageField ? messageField.value.trim() : '',
                }),
            })
                .then(function (data) {
                    alert('✅ Appointment booked! We will confirm it shortly.\nReference ID: ' + data.appointment.id);
                    form.reset();
                    const doc = form.querySelector('#doctor');
                    if (doc) doc.innerHTML = '<option value="">Any Available</option>';
                })
                .catch(function (err) {
                    alert('⚠️ ' + err.message);
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                });
        });
    });

    // ============================================
    // 10. PASSWORD TOGGLE (Login & Register)
    // ============================================
    safeExecute(function () {
        document.querySelectorAll('.toggle-password').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const targetId = this.dataset.target;
                const input = document.getElementById(targetId);
                if (!input) return;

                const icon = this.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    });

    // ============================================
    // 11. LOGIN FORM SUBMISSION
    // ============================================
    safeExecute(function () {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail');
            const password = document.getElementById('loginPassword');

            if (!email || !password) return;

            if (email.value.trim() === '' || password.value.trim() === '') {
                alert('⚠️ Please fill in both email and password.');
                return;
            }

            if (!window.HospitalAPI) {
                alert('✅ Login successful!');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            window.HospitalAPI.apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value,
                }),
            })
                .then(function (data) {
                    window.HospitalAPI.saveSession(data.token, data.user);
                    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
                })
                .catch(function (err) {
                    alert('⚠️ ' + err.message);
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    });

    // ============================================
    // 12. REGISTER FORM SUBMISSION
    // ============================================
    safeExecute(function () {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('registerName');
            const email = document.getElementById('registerEmail');
            const phone = document.getElementById('registerPhone');
            const password = document.getElementById('registerPassword');
            const confirm = document.getElementById('registerConfirmPassword');
            const terms = form.querySelector('input[type="checkbox"]');

            // Basic validation
            if (name && name.value.trim().length < 2) {
                alert('⚠️ Please enter your full name.');
                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                alert('⚠️ Please enter a valid email address.');
                return;
            }

            if (phone && !/^[0-9]{10}$/.test(phone.value.trim())) {
                alert('⚠️ Please enter a valid 10-digit phone number.');
                return;
            }

            if (password && password.value.length < 8) {
                alert('⚠️ Password must be at least 8 characters long.');
                return;
            }

            if (password && confirm && password.value !== confirm.value) {
                alert('⚠️ Passwords do not match.');
                return;
            }

            if (terms && !terms.checked) {
                alert('⚠️ Please agree to the Terms of Service and Privacy Policy.');
                return;
            }

            if (!window.HospitalAPI) {
                alert('✅ Registration successful! Please login to continue.');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            window.HospitalAPI.apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    password: password.value,
                }),
            })
                .then(function (data) {
                    window.HospitalAPI.saveSession(data.token, data.user);
                    alert('✅ Registration successful! Redirecting to your dashboard...');
                    window.location.href = 'dashboard.html';
                })
                .catch(function (err) {
                    alert('⚠️ ' + err.message);
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    });

    // ============================================
    // 13. WORKING HOURS (Contact Page)
    // ============================================
    safeExecute(function () {
        const el = document.getElementById('openStatus');
        if (!el) return;

        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const current = hours + minutes / 60;

        let open = false;
        // Mon-Sat (1-6), 9:00 AM to 6:00 PM
        if (day >= 1 && day <= 6) {
            if (current >= 9 && current < 18) {
                open = true;
            }
        }

        el.innerHTML = open
            ? '✅ <span style="color:green;font-weight:bold;">Open Now</span> (9:00 AM – 6:00 PM)'
            : '❌ <span style="color:red;font-weight:bold;">Closed</span> (Mon–Sat, 9:00 AM – 6:00 PM)';
    });

    // ============================================
    // 13B. CONTACT FORM SUBMISSION
    // ============================================
    safeExecute(function () {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const subject = document.getElementById('contactSubject');
            const message = document.getElementById('contactMessage');

            if (!name || !email || !subject || !message) return;

            if (name.value.trim() === '' || subject.value.trim() === '' || message.value.trim() === '') {
                alert('⚠️ Please fill in all fields.');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                alert('⚠️ Please enter a valid email address.');
                return;
            }

            if (!window.HospitalAPI) {
                alert('✅ Message sent! We will get back to you shortly.');
                form.reset();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            window.HospitalAPI.apiFetch('/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.value.trim(),
                    email: email.value.trim(),
                    subject: subject.value.trim(),
                    message: message.value.trim(),
                }),
            })
                .then(function () {
                    alert('✅ Message sent! We will get back to you shortly.');
                    form.reset();
                })
                .catch(function (err) {
                    alert('⚠️ ' + err.message);
                })
                .finally(function () {
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    });

    // ============================================
    // LOG: Script loaded successfully
    // ============================================
    console.log('✅ Dehradun Hospital JS – All features loaded successfully!');
});
